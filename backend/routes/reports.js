const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// =====================================================
// API DE RELATÓRIOS - MÉTRICAS E ESTATÍSTICAS
// =====================================================

// GET /api/reports/participation-history - Histórico de participações por estudante
router.get('/participation-history', async (req, res) => {
  try {
    const { estudante_id, congregacao_id, start_date, end_date } = req.query;
    
    let query = supabase
      .from('designacao_itens')
      .select(`
        *,
        principal_estudante:estudantes!principal_estudante_id(id, nome, genero),
        assistente_estudante:estudantes!assistente_estudante_id(id, nome, genero),
        programacao_item:programacao_itens(*),
        programacao:programacoes(*)
      `)
      .order('created_at', { ascending: false });

    // Filtrar por estudante
    if (estudante_id) {
      query = query.or(`principal_estudante_id.eq.${estudante_id},assistente_estudante_id.eq.${estudante_id}`);
    }
    
    // Filtrar por congregação
    if (congregacao_id) {
      query = query.eq('congregacao_id', congregacao_id);
    }
    
    // Filtrar por datas
    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    
    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    const { data: participations, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar histórico: ${error.message}`);
    }

    res.json({
      success: true,
      participations: participations || [],
      total: (participations || []).length
    });

  } catch (error) {
    console.error('❌ Erro ao buscar histórico de participações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// GET /api/reports/engagement-metrics - Métricas de engajamento
router.get('/engagement-metrics', async (req, res) => {
  try {
    const { congregacao_id, start_date, end_date } = req.query;
    
    // Contar total de designações
    let designacoesQuery = supabase
      .from('designacao_itens')
      .select('id, principal_estudante_id, assistente_estudante_id');
      
    if (congregacao_id) {
      designacoesQuery = designacoesQuery.eq('congregacao_id', congregacao_id);
    }
    
    if (start_date) {
      designacoesQuery = designacoesQuery.gte('created_at', start_date);
    }
    
    if (end_date) {
      designacoesQuery = designacoesQuery.lte('created_at', end_date);
    }

    const { data: designacoes, error: designacoesError } = await designacoesQuery;

    if (designacoesError) {
      throw new Error(`Erro ao buscar designações: ${designacoesError.message}`);
    }

    // Contar estudantes ativos
    let estudantesQuery = supabase
      .from('estudantes')
      .select('id');
      
    if (congregacao_id) {
      estudantesQuery = estudantesQuery.eq('congregacao_id', congregacao_id);
    }
    
    estudantesQuery = estudantesQuery.eq('ativo', true);

    const { data: estudantes, error: estudantesError } = await estudantesQuery;

    if (estudantesError) {
      throw new Error(`Erro ao buscar estudantes: ${estudantesError.message}`);
    }

    // Calcular métricas
    const totalDesignacoes = designacoes.length;
    const totalEstudantes = estudantes.length;
    const designacoesComPrincipais = designacoes.filter(d => d.principal_estudante_id).length;
    const designacoesComAssistentes = designacoes.filter(d => d.assistente_estudante_id).length;
    
    const metrics = {
      total_designacoes: totalDesignacoes,
      total_estudantes: totalEstudantes,
      designacoes_atribuidas: designacoesComPrincipais + designacoesComAssistentes,
      taxa_participacao: totalEstudantes > 0 ? ((designacoesComPrincipais + designacoesComAssistentes) / totalEstudantes).toFixed(2) : 0,
      designacoes_principais: designacoesComPrincipais,
      designacoes_assistentes: designacoesComAssistentes,
      periodo: {
        inicio: start_date || 'Desde o início',
        fim: end_date || 'Até o momento'
      }
    };

    res.json({
      success: true,
      metrics
    });

  } catch (error) {
    console.error('❌ Erro ao calcular métricas de engajamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// GET /api/reports/performance - Relatórios de desempenho
router.get('/performance', async (req, res) => {
  try {
    const { congregacao_id, start_date, end_date } = req.query;
    
    // Buscar dados de desempenho dos estudantes
    let performanceQuery = supabase
      .from('estudantes')
      .select(`
        id,
        nome,
        genero,
        ativo,
        reading,
        treasures,
        gems,
        talk,
        explaining,
        starting,
        following,
        making,
        congregation_study,
        privileges,
        created_at
      `)
      .eq('ativo', true);
      
    if (congregacao_id) {
      performanceQuery = performanceQuery.eq('congregacao_id', congregacao_id);
    }

    const { data: estudantes, error: estudantesError } = await performanceQuery;

    if (estudantesError) {
      throw new Error(`Erro ao buscar estudantes: ${estudantesError.message}`);
    }

    // Buscar histórico de designações para calcular frequência
    let designacoesQuery = supabase
      .from('designacao_itens')
      .select('principal_estudante_id, assistente_estudante_id');
      
    if (congregacao_id) {
      designacoesQuery = designacoesQuery.eq('congregacao_id', congregacao_id);
    }
    
    if (start_date) {
      designacoesQuery = designacoesQuery.gte('created_at', start_date);
    }
    
    if (end_date) {
      designacoesQuery = designacoesQuery.lte('created_at', end_date);
    }

    const { data: designacoes, error: designacoesError } = await designacoesQuery;

    if (designacoesError) {
      throw new Error(`Erro ao buscar designações: ${designacoesError.message}`);
    }

    // Calcular frequência por estudante
    const frequenciaMap = {};
    designacoes.forEach(d => {
      if (d.principal_estudante_id) {
        frequenciaMap[d.principal_estudante_id] = (frequenciaMap[d.principal_estudante_id] || 0) + 1;
      }
      if (d.assistente_estudante_id) {
        frequenciaMap[d.assistente_estudante_id] = (frequenciaMap[d.assistente_estudante_id] || 0) + 1;
      }
    });

    // Enrich students with performance data
    const estudantesComPerformance = estudantes.map(estudante => {
      const frequencia = frequenciaMap[estudante.id] || 0;
      
      // Contar qualificações
      const qualificacoes = [
        estudante.reading,
        estudante.treasures,
        estudante.gems,
        estudante.talk,
        estudante.explaining,
        estudante.starting,
        estudante.following,
        estudante.making,
        estudante.congregation_study
      ].filter(Boolean).length;
      
      return {
        ...estudante,
        frequencia,
        qualificacoes,
        nivel_qualificacao: qualificacoes > 6 ? 'Avançado' : 
                          qualificacoes > 3 ? 'Intermediário' : 'Básico'
      };
    });

    res.json({
      success: true,
      estudantes: estudantesComPerformance,
      total: estudantesComPerformance.length,
      periodo: {
        inicio: start_date || 'Desde o início',
        fim: end_date || 'Até o momento'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao gerar relatório de desempenho:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// GET /api/reports/export - Exportação de dados para Excel/CSV
router.get('/export', async (req, res) => {
  try {
    const { type = 'csv', congregacao_id, start_date, end_date } = req.query;
    
    // Buscar dados para exportação
    let exportQuery = supabase
      .from('designacao_itens')
      .select(`
        *,
        principal_estudante:estudantes!principal_estudante_id(id, nome, genero),
        assistente_estudante:estudantes!assistente_estudante_id(id, nome, genero),
        programacao_item:programacao_itens(*),
        programacao:programacoes(*)
      `)
      .order('created_at', { ascending: false });

    if (congregacao_id) {
      exportQuery = exportQuery.eq('congregacao_id', congregacao_id);
    }
    
    if (start_date) {
      exportQuery = exportQuery.gte('created_at', start_date);
    }
    
    if (end_date) {
      exportQuery = exportQuery.lte('created_at', end_date);
    }

    const { data: exportData, error } = await exportQuery;

    if (error) {
      throw new Error(`Erro ao buscar dados para exportação: ${error.message}`);
    }

    // Formatar dados para exportação
    const formattedData = exportData.map(item => ({
      data: item.created_at,
      estudante_principal: item.principal_estudante?.nome || 'Não designado',
      estudante_assistente: item.assistente_estudante?.nome || 'Nenhum',
      parte_titulo: item.programacao_item?.titulo || 'Parte não identificada',
      parte_tipo: item.programacao_item?.tipo || 'Desconhecido',
      semana: item.programacao?.semana_data_inicio || 'Data não disponível',
      congregacao: congregacao_id || 'Todas',
      observacoes: item.observacoes || ''
    }));

    // Preparar resposta para download
    res.setHeader('Content-Type', type === 'csv' ? 'text/csv' : 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-designacoes.${type}"`);

    if (type === 'csv') {
      // Gerar CSV
      const csvHeaders = Object.keys(formattedData[0] || {}).join(',');
      const csvRows = formattedData.map(row => 
        Object.values(row).map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
      );
      
      const csvContent = [csvHeaders, ...csvRows].join('\n');
      res.send(csvContent);
    } else {
      // Enviar JSON
      res.json(formattedData);
    }

  } catch (error) {
    console.error('❌ Erro ao exportar dados:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// GET /api/reports/qualifications - Relatório de qualificações avançadas
router.get('/qualifications', async (req, res) => {
  try {
    const { congregacao_id } = req.query;
    
    // Buscar estudantes com todas as qualificações
    let query = supabase
      .from('estudantes')
      .select(`
        id,
        nome,
        genero,
        ativo,
        reading,
        treasures,
        gems,
        talk,
        explaining,
        starting,
        following,
        making,
        congregation_study,
        privileges,
        created_at
      `)
      .eq('ativo', true);
      
    if (congregacao_id) {
      query = query.eq('congregacao_id', congregacao_id);
    }

    const { data: estudantes, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar estudantes: ${error.message}`);
    }

    // Processar dados de qualificações
    const qualificationReport = estudantes.map(estudante => {
      const qualificacoes = {
        reading: estudante.reading || false,
        treasures: estudante.treasures || false,
        gems: estudante.gems || false,
        talk: estudante.talk || false,
        explaining: estudante.explaining || false,
        starting: estudante.starting || false,
        following: estudante.following || false,
        making: estudante.making || false,
        congregation_study: estudante.congregation_study || false
      };
      
      const totalQualificacoes = Object.values(qualificacoes).filter(Boolean).length;
      const privilegios = Array.isArray(estudante.privileges) ? estudante.privileges : [];
      
      return {
        id: estudante.id,
        nome: estudante.nome,
        genero: estudante.genero,
        total_qualificacoes: totalQualificacoes,
        qualificacoes,
        privilegios,
        nivel_desenvolvimento: this.calculateDevelopmentLevel(totalQualificacoes, privilegios)
      };
    });

    res.json({
      success: true,
      report: qualificationReport,
      total: qualificationReport.length,
      summary: {
        total_estudantes: qualificationReport.length,
        media_qualificacoes: qualificationReport.reduce((sum, est) => sum + est.total_qualificacoes, 0) / qualificationReport.length || 0,
        estudantes_avancados: qualificationReport.filter(est => est.nivel_desenvolvimento === 'Avançado').length,
        estudantes_intermediarios: qualificationReport.filter(est => est.nivel_desenvolvimento === 'Intermediário').length,
        estudantes_basicos: qualificationReport.filter(est => est.nivel_desenvolvimento === 'Básico').length
      }
    });

  } catch (error) {
    console.error('❌ Erro ao gerar relatório de qualificações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// GET /api/reports/advanced-qualifications - Relatório de qualificações avançadas
router.get('/advanced-qualifications', async (req, res) => {
  try {
    const { congregacao_id } = req.query;
    
    // Buscar estudantes com todas as qualificações e histórico
    let query = supabase
      .from('estudantes')
      .select(`
        id,
        nome,
        genero,
        ativo,
        reading,
        treasures,
        gems,
        talk,
        explaining,
        starting,
        following,
        making,
        congregation_study,
        privileges,
        created_at,
        designacao_itens(principal_estudante_id, assistente_estudante_id, created_at)
      `)
      .eq('ativo', true);
      
    if (congregacao_id) {
      query = query.eq('congregacao_id', congregacao_id);
    }

    const { data: estudantes, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar estudantes: ${error.message}`);
    }

    // Processar dados de qualificações avançadas
    const advancedReport = estudantes.map(estudante => {
      // Calcular número total de designações
      const totalDesignacoes = (estudante.designacao_itens || []).length;
      
      // Calcular qualificações
      const qualificacoes = {
        reading: estudante.reading || false,
        treasures: estudante.treasures || false,
        gems: estudante.gems || false,
        talk: estudante.talk || false,
        explaining: estudante.explaining || false,
        starting: estudante.starting || false,
        following: estudante.following || false,
        making: estudante.making || false,
        congregation_study: estudante.congregation_study || false
      };
      
      const totalQualificacoes = Object.values(qualificacoes).filter(Boolean).length;
      const privilegios = Array.isArray(estudante.privileges) ? estudante.privileges : [];
      
      // Determinar nível de desenvolvimento
      let nivelDesenvolvimento;
      if (totalQualificacoes >= 7 || privilegios.some(p => ['anciao', 'elder', 'servo_ministerial', 'ministerial_servant'].includes(p))) {
        nivelDesenvolvimento = 'Avançado';
      } else if (totalQualificacoes >= 4) {
        nivelDesenvolvimento = 'Intermediário';
      } else {
        nivelDesenvolvimento = 'Básico';
      }
      
      // Calcular últimas atividades
      const ultimasAtividades = (estudante.designacao_itens || [])
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(item => ({
          data: item.created_at,
          tipo: item.principal_estudante_id === estudante.id ? 'Principal' : 'Assistente'
        }));

      return {
        id: estudante.id,
        nome: estudante.nome,
        genero: estudante.genero,
        total_qualificacoes: totalQualificacoes,
        qualificacoes,
        privilegios,
        total_designacoes: totalDesignacoes,
        nivel_desenvolvimento: nivelDesenvolvimento,
        ultimas_atividades: ultimasAtividades,
        data_cadastro: estudante.created_at
      };
    });

    // Agrupar por nível de desenvolvimento
    const porNivel = {
      'Avançado': advancedReport.filter(e => e.nivel_desenvolvimento === 'Avançado').length,
      'Intermediário': advancedReport.filter(e => e.nivel_desenvolvimento === 'Intermediário').length,
      'Básico': advancedReport.filter(e => e.nivel_desenvolvimento === 'Básico').length
    };

    res.json({
      success: true,
      report: advancedReport,
      total: advancedReport.length,
      summary: {
        total_estudantes: advancedReport.length,
        por_nivel: porNivel,
        media_qualificacoes: advancedReport.reduce((sum, est) => sum + est.total_qualificacoes, 0) / advancedReport.length || 0,
        media_designacoes: advancedReport.reduce((sum, est) => sum + est.total_designacoes, 0) / advancedReport.length || 0
      }
    });

  } catch (error) {
    console.error('❌ Erro ao gerar relatório de qualificações avançadas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// Função auxiliar para calcular nível de desenvolvimento
function calculateDevelopmentLevel(totalQualificacoes, privilegios) {
  // Considerar privilégios especiais
  const hasSpecialPrivileges = privilegios.some(p => 
    ['anciao', 'elder', 'servo_ministerial', 'ministerial_servant'].includes(p)
  );
  
  if (totalQualificacoes >= 7 || hasSpecialPrivileges) {
    return 'Avançado';
  } else if (totalQualificacoes >= 4) {
    return 'Intermediário';
  } else {
    return 'Básico';
  }
}

module.exports = router;
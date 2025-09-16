const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { supabase } = require('../config/supabase');
=======
const MWBParser = require('../services/mwbParser');
>>>>>>> cb5069e52f66eca9951404975794c3c89748f090

// =====================================================
// API PARA INSTRUTORES - CONSUMO DE PROGRAMAS
// =====================================================

<<<<<<< HEAD
// GET /api/programacoes - Listar programações publicadas para instrutores
=======
// Initialize MWB Parser
const mwbParser = new MWBParser();

// GET /api/programacoes/mock - Mock week data using MWB Parser
router.get('/mock', async (req, res) => {
  try {
    const { semana, mes, ano } = req.query;
    
    if (semana) {
      // Get specific week program
      const program = mwbParser.getProgramForWeek(semana);
      if (program) {
        res.json({
          semana: program.semana,
          data_inicio: program.data_inicio,
          partes: program.partes,
          pdf_source: program.pdf_source
        });
      } else {
        res.status(404).json({ success: false, error: 'Semana não encontrada' });
      }
    } else if (mes && ano) {
      // Get all programs for month
      const programs = mwbParser.getProgramsForMonth(ano, mes);
      res.json({ programs });
    } else {
      // Default: current week
      const program = mwbParser.getProgramForWeek('2024-12-02');
      res.json({
        semana: program.semana,
        data_inicio: program.data_inicio,
        partes: program.partes,
        pdf_source: program.pdf_source
      });
    }
  } catch (error) {
    console.error('Error in /mock route:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/programacoes/pdfs - List available PDFs
router.get('/pdfs', async (req, res) => {
  try {
    const availablePDFs = mwbParser.getAvailablePDFs();
    res.json({
      success: true,
      pdfs: availablePDFs,
      total: availablePDFs.portuguese.length + availablePDFs.english.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/programacoes - List programacoes
>>>>>>> cb5069e52f66eca9951404975794c3c89748f090
router.get('/', async (req, res) => {
  try {
    const { congregacao_id, semana, periodo, status = 'published' } = req.query;
    
    console.log('📋 Buscando programações:', { congregacao_id, semana, periodo, status });

    let query = supabase
      .from('programas_ministeriais')
      .select(`
        *,
        partes:partes(
          id,
          secao,
          titulo,
          tipo,
          duracao,
          referencias,
          genero_requerido,
          ordem,
          observacoes,
          designacoes:designacoes(
            id,
            estudante_id,
            data_reuniao,
            confirmada,
            estudantes:estudantes(
              id,
              nome,
              genero
            )
          )
        )
      `)
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (status === 'published') {
      query = query.eq('publicado', true);
    } else if (status === 'all') {
      // Não aplicar filtro de publicado
    }

    if (congregacao_id) {
      query = query.or(`congregacao_id.eq.${congregacao_id},congregacao_id.is.null`);
    }

    if (semana) {
      query = query.ilike('semana', `%${semana}%`);
    }

    if (periodo) {
      query = query.ilike('periodo', `%${periodo}%`);
    }

    const { data: programas, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar programas: ${error.message}`);
    }

    // Transformar dados para formato esperado pelo frontend
    const programacoesFormatadas = programas.map(programa => ({
      id: programa.id,
      semana: programa.semana,
      periodo: programa.periodo,
      tema: programa.tema,
      pdf_url: programa.pdf_url,
      publicado: programa.publicado,
      created_at: programa.created_at,
      partes: programa.partes
        .sort((a, b) => a.ordem - b.ordem)
        .map(parte => ({
          id: parte.id,
          secao: parte.secao,
          titulo: parte.titulo,
          tipo: parte.tipo,
          duracao: parte.duracao,
          referencias: parte.referencias || {},
          genero_requerido: parte.genero_requerido,
          ordem: parte.ordem,
          observacoes: parte.observacoes,
          designacao: parte.designacoes.length > 0 ? {
            id: parte.designacoes[0].id,
            estudante: parte.designacoes[0].estudantes,
            data_reuniao: parte.designacoes[0].data_reuniao,
            confirmada: parte.designacoes[0].confirmada
          } : null
        }))
    }));

    console.log(`✅ Encontradas ${programacoesFormatadas.length} programações`);

    res.json({
      success: true,
      programacoes: programacoesFormatadas,
      total: programacoesFormatadas.length,
      message: `${programacoesFormatadas.length} programações encontradas`
    });

  } catch (error) {
    console.error('❌ Erro ao listar programações:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// GET /api/programacoes/:id - Buscar programação específica com partes
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔍 Buscando programação: ${id}`);

    const { data: programa, error } = await supabase
      .from('programas_ministeriais')
      .select(`
        *,
        partes:partes(
          id,
          secao,
          titulo,
          tipo,
          duracao,
          referencias,
          genero_requerido,
          ordem,
          observacoes,
          designacoes:designacoes(
            id,
            estudante_id,
            data_reuniao,
            confirmada,
            estudantes:estudantes(
              id,
              nome,
              genero
            )
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Programação não encontrada'
        });
      }
      throw new Error(`Erro ao buscar programação: ${error.message}`);
    }

    // Formatar para o frontend
    const programacaoFormatada = {
      id: programa.id,
      semana: programa.semana,
      periodo: programa.periodo,
      tema: programa.tema,
      pdf_url: programa.pdf_url,
      publicado: programa.publicado,
      created_at: programa.created_at,
      partes: programa.partes
        .sort((a, b) => a.ordem - b.ordem)
        .map(parte => ({
          id: parte.id,
          secao: parte.secao,
          titulo: parte.titulo,
          tipo: parte.tipo,
          duracao: parte.duracao,
          referencias: parte.referencias || {},
          genero_requerido: parte.genero_requerido,
          ordem: parte.ordem,
          observacoes: parte.observacoes,
          designacao: parte.designacoes.length > 0 ? {
            id: parte.designacoes[0].id,
            estudante: parte.designacoes[0].estudantes,
            data_reuniao: parte.designacoes[0].data_reuniao,
            confirmada: parte.designacoes[0].confirmada
          } : null
        }))
    };

    console.log(`✅ Programação encontrada: ${programa.semana}`);

    res.json({
      success: true,
      programacao: programacaoFormatada
    });

  } catch (error) {
    console.error('❌ Erro ao buscar programação:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// =====================================================
// ROTAS DE APOIO
// =====================================================

// GET /api/programacoes/periodos/list - Listar períodos disponíveis
router.get('/periodos/list', async (req, res) => {
  try {
    const { data: periodos, error } = await supabase
      .from('programas_ministeriais')
      .select('periodo')
      .eq('publicado', true)
      .order('periodo');

    if (error) {
      throw new Error(`Erro ao listar períodos: ${error.message}`);
    }

    const periodosUnicos = [...new Set(periodos.map(p => p.periodo))];

    res.json({
      success: true,
      periodos: periodosUnicos,
      total: periodosUnicos.length
    });

  } catch (error) {
    console.error('❌ Erro ao listar períodos:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// GET /api/programacoes/stats - Estatísticas das programações
router.get('/stats', async (req, res) => {
  try {
    const { congregacao_id } = req.query;

    let queryProgramas = supabase
      .from('programas_ministeriais')
      .select('id, publicado');

    let queryPartes = supabase
      .from('partes')
      .select('id');

    let queryDesignacoes = supabase
      .from('designacoes')
      .select('id, confirmada');

    if (congregacao_id) {
      queryProgramas = queryProgramas.or(`congregacao_id.eq.${congregacao_id},congregacao_id.is.null`);
    }

    const [
      { data: programas, error: errorProgramas },
      { data: partes, error: errorPartes },
      { data: designacoes, error: errorDesignacoes }
    ] = await Promise.all([
      queryProgramas,
      queryPartes,
      queryDesignacoes
    ]);

    if (errorProgramas || errorPartes || errorDesignacoes) {
      throw new Error('Erro ao buscar estatísticas');
    }

    const stats = {
      total_programas: programas.length,
      programas_publicados: programas.filter(p => p.publicado).length,
      total_partes: partes.length,
      total_designacoes: designacoes.length,
      designacoes_confirmadas: designacoes.filter(d => d.confirmada).length
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

module.exports = router;
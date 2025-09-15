const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// =====================================================
// API DE DESIGNAÇÕES - NOVA ARQUITETURA SIMPLIFICADA
// =====================================================

// POST /api/designacoes/generate - Gerar designações automáticas (S-38)
router.post('/generate', async (req, res) => {
  try {
    const { programacao_id, congregacao_id } = req.body;

    if (!programacao_id || !congregacao_id) {
      return res.status(400).json({
        success: false,
        error: 'programacao_id e congregacao_id são obrigatórios'
      });
    }

    console.log('🎯 Gerando designações:', { programacao_id, congregacao_id });

    // 1. Buscar programação e itens
    const { data: programacao, error: progError } = await supabase
      .from('programacoes')
      .select('*')
      .eq('id', programacao_id)
      .single();

    if (progError || !programacao) {
      return res.status(404).json({
        success: false,
        error: 'Programação não encontrada'
      });
    }

    const { data: itens, error: itensError } = await supabase
      .from('programacao_itens')
      .select('*')
      .eq('programacao_id', programacao_id)
      .order('order');

    if (itensError) {
      throw new Error(`Erro ao buscar itens: ${itensError.message}`);
    }

    // 2. Buscar estudantes elegíveis da congregação
    const { data: estudantes, error: estudantesError } = await supabase
      .from('estudantes')
      .select('*')
      .eq('congregacao_id', congregacao_id)
      .eq('ativo', true);

    if (estudantesError) {
      throw new Error(`Erro ao buscar estudantes: ${estudantesError.message}`);
    }

    if (!estudantes || estudantes.length === 0) {
      return res.json({
        success: true,
        message: 'Nenhum estudante elegível encontrado para esta congregação',
        designacoes: [],
        itens: []
      });
    }

    // 3. Aplicar regras S-38 simplificadas
    const designacoesGeradas = [];
    
    for (const item of itens) {
      let estudanteElegivel = null;
      let assistenteElegivel = null;

      // Filtrar estudantes por tipo de parte (regras S-38)
      const estudantesFiltrados = estudantes.filter(est => {
        switch (item.type) {
          case 'bible_reading':
            return est.genero === 'masculino' && (est.reading === true);
          case 'starting':
          case 'following':
          case 'making_disciples':
            return est.starting === true || est.following === true || est.making === true;
          case 'talk':
            return est.genero === 'masculino' && (est.talk === true || est.explaining === true);
          case 'treasures':
            return est.genero === 'masculino' && (est.treasures === true);
          case 'gems':
            return est.genero === 'masculino' && (est.gems === true);
          default:
            return est.ativo === true;
        }
      });

      // Selecionar primeiro elegível (algoritmo simples)
      if (estudantesFiltrados.length > 0) {
        estudanteElegivel = estudantesFiltrados[0];
        
        // Para partes de ministério, tentar encontrar assistente
        if (['starting', 'following', 'making_disciples'].includes(item.type)) {
          const assistentesFiltrados = estudantesFiltrados.filter(est => 
            est.id !== estudanteElegivel.id && 
            (est.genero === estudanteElegivel.genero || est.family_member === true)
          );
          if (assistentesFiltrados.length > 0) {
            assistenteElegivel = assistentesFiltrados[0];
          }
        }
      }

      // Criar entrada de designação
      const designacao = {
        programacao_item_id: item.id,
        principal_estudante_id: estudanteElegivel?.id || null,
        assistente_estudante_id: assistenteElegivel?.id || null,
        status: estudanteElegivel ? 'OK' : 'PENDING',
        observacoes: estudanteElegivel ? null : 'Nenhum estudante elegível encontrado'
      };

      designacoesGeradas.push(designacao);
    }

    // 4. Salvar designações no banco (limpar existentes primeiro)
    await supabase
      .from('designacao_itens')
      .delete()
      .eq('programacao_id', programacao_id);

    if (designacoesGeradas.length > 0) {
      const { error: insertError } = await supabase
        .from('designacao_itens')
        .insert(designacoesGeradas.map(d => ({
          ...d,
          programacao_id: programacao_id,
          congregacao_id: congregacao_id
        })));

      if (insertError) {
        throw new Error(`Erro ao salvar designações: ${insertError.message}`);
      }
    }

    console.log(`✅ Geradas ${designacoesGeradas.length} designações`);

    res.json({
      success: true,
      message: `Designações geradas com sucesso`,
      designacoes: designacoesGeradas,
      summary: {
        total_itens: itens.length,
        designacoes_ok: designacoesGeradas.filter(d => d.status === 'OK').length,
        designacoes_pendentes: designacoesGeradas.filter(d => d.status === 'PENDING').length
      }
    });

  } catch (error) {
    console.error('❌ Erro ao gerar designações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// GET /api/designacoes - Listar designações geradas
router.get('/', async (req, res) => {
  try {
    const { programacao_id, congregacao_id } = req.query;

    if (!programacao_id || !congregacao_id) {
      return res.status(400).json({
        success: false,
        error: 'programacao_id e congregacao_id são obrigatórios'
      });
    }

    console.log('📋 Listando designações:', { programacao_id, congregacao_id });

    // Buscar designações com joins
    const { data: itens, error } = await supabase
      .from('designacao_itens')
      .select(`
        *,
        principal_estudante:estudantes!principal_estudante_id(id, nome, genero),
        assistente_estudante:estudantes!assistente_estudante_id(id, nome, genero)
      `)
      .eq('programacao_id', programacao_id)
      .eq('congregacao_id', congregacao_id);

    if (error) {
      throw new Error(`Erro ao buscar designações: ${error.message}`);
    }

    res.json({
      success: true,
      itens: itens || [],
      total: (itens || []).length
    });

  } catch (error) {
    console.error('❌ Erro ao listar designações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// POST /api/designacoes - Salvar/atualizar designações manualmente
router.post('/', async (req, res) => {
  try {
    const { programacao_id, congregacao_id, itens } = req.body;

    if (!programacao_id || !congregacao_id || !Array.isArray(itens)) {
      return res.status(400).json({
        success: false,
        error: 'programacao_id, congregacao_id e itens são obrigatórios'
      });
    }

    console.log('💾 Salvando designações manuais:', { programacao_id, congregacao_id, count: itens.length });

    // Atualizar itens existentes
    for (const item of itens) {
      const { error: updateError } = await supabase
        .from('designacao_itens')
        .update({
          principal_estudante_id: item.principal_estudante_id,
          assistente_estudante_id: item.assistente_estudante_id,
          status: item.status || 'OK',
          observacoes: item.observacoes
        })
        .eq('programacao_item_id', item.programacao_item_id)
        .eq('programacao_id', programacao_id);

      if (updateError) {
        console.warn('⚠️ Erro ao atualizar item:', updateError.message);
      }
    }

    res.json({
      success: true,
      message: 'Designações salvas com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao salvar designações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

module.exports = router;
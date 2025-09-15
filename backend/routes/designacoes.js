const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// =====================================================
// API DE DESIGNAÇÕES - INSTRUTORES ATRIBUEM ESTUDANTES
// =====================================================

// GET /api/designacoes - Listar designações (com filtros)
router.get('/', async (req, res) => {
  try {
    const { 
      congregacao_id, 
      estudante_id, 
      programa_id,
      data_inicio,
      data_fim,
      confirmada
    } = req.query;

    console.log('📋 Buscando designações:', req.query);

    let query = supabase
      .from('designacoes')
      .select(`
        *,
        partes:partes(
          id,
          secao,
          titulo,
          tipo,
          duracao,
          genero_requerido,
          programa_id,
          programas_ministeriais:programas_ministeriais(
            id,
            semana,
            periodo,
            tema
          )
        ),
        estudantes:estudantes(
          id,
          nome,
          genero,
          congregacao_id
        )
      `)
      .order('data_reuniao', { ascending: true });

    // Aplicar filtros
    if (estudante_id) {
      query = query.eq('estudante_id', estudante_id);
    }

    if (programa_id) {
      query = query.eq('partes.programa_id', programa_id);
    }

    if (data_inicio) {
      query = query.gte('data_reuniao', data_inicio);
    }

    if (data_fim) {
      query = query.lte('data_reuniao', data_fim);
    }

    if (confirmada !== undefined) {
      query = query.eq('confirmada', confirmada === 'true');
    }

    const { data: designacoes, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar designações: ${error.message}`);
    }

    // Filtrar por congregação se necessário (fazer no JS já que é join)
    let designacoesFiltradas = designacoes;
    if (congregacao_id) {
      designacoesFiltradas = designacoes.filter(d => 
        d.estudantes.congregacao_id === congregacao_id
      );
    }

    console.log(`✅ Encontradas ${designacoesFiltradas.length} designações`);

    res.json({
      success: true,
      designacoes: designacoesFiltradas,
      total: designacoesFiltradas.length
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

// POST /api/designacoes - Criar nova designação
router.post('/', async (req, res) => {
  try {
    const { 
      parte_id, 
      estudante_id, 
      data_reuniao, 
      observacoes 
    } = req.body;

    if (!parte_id || !estudante_id || !data_reuniao) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: parte_id, estudante_id, data_reuniao'
      });
    }

    console.log('➕ Criando designação:', { parte_id, estudante_id, data_reuniao });

    // 1. Verificar se a parte existe e buscar requisitos
    const { data: parte, error: parteError } = await supabase
      .from('partes')
      .select('*')
      .eq('id', parte_id)
      .single();

    if (parteError || !parte) {
      return res.status(404).json({
        success: false,
        error: 'Parte não encontrada'
      });
    }

    // 2. Verificar se o estudante existe e buscar informações
    const { data: estudante, error: estudanteError } = await supabase
      .from('estudantes')
      .select('*')
      .eq('id', estudante_id)
      .single();

    if (estudanteError || !estudante) {
      return res.status(404).json({
        success: false,
        error: 'Estudante não encontrado'
      });
    }

    // 3. Validar compatibilidade de gênero
    if (parte.genero_requerido === 'masculino' && estudante.genero !== 'masculino') {
      return res.status(400).json({
        success: false,
        error: 'Esta parte requer um estudante do gênero masculino'
      });
    }

    if (parte.genero_requerido === 'feminino' && estudante.genero !== 'feminino') {
      return res.status(400).json({
        success: false,
        error: 'Esta parte requer um estudante do gênero feminino'
      });
    }

    // 4. Verificar se já existe designação para esta parte
    const { data: designacaoExistente, error: checkError } = await supabase
      .from('designacoes')
      .select('id')
      .eq('parte_id', parte_id)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Erro ao verificar designação existente: ${checkError.message}`);
    }

    if (designacaoExistente) {
      return res.status(409).json({
        success: false,
        error: 'Já existe uma designação para esta parte'
      });
    }

    // 5. Verificar se o estudante já tem designação na mesma data
    const { data: designacaoMesmaData, error: sameDataError } = await supabase
      .from('designacoes')
      .select('id')
      .eq('estudante_id', estudante_id)
      .eq('data_reuniao', data_reuniao)
      .maybeSingle();

    if (sameDataError && sameDataError.code !== 'PGRST116') {
      throw new Error(`Erro ao verificar conflito de data: ${sameDataError.message}`);
    }

    if (designacaoMesmaData) {
      return res.status(409).json({
        success: false,
        error: 'Estudante já possui uma designação nesta data'
      });
    }

    // 6. Criar a designação
    const { data: novaDesignacao, error: createError } = await supabase
      .from('designacoes')
      .insert({
        parte_id,
        estudante_id,
        data_reuniao,
        observacoes: observacoes || null,
        confirmada: false
      })
      .select(`
        *,
        partes:partes(
          id,
          secao,
          titulo,
          tipo,
          duracao,
          genero_requerido,
          programas_ministeriais:programas_ministeriais(
            id,
            semana,
            periodo,
            tema
          )
        ),
        estudantes:estudantes(
          id,
          nome,
          genero
        )
      `)
      .single();

    if (createError) {
      throw new Error(`Erro ao criar designação: ${createError.message}`);
    }

    console.log('✅ Designação criada:', novaDesignacao.id);

    res.json({
      success: true,
      message: 'Designação criada com sucesso',
      designacao: novaDesignacao
    });

  } catch (error) {
    console.error('❌ Erro ao criar designação:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// PUT /api/designacoes/:id - Atualizar designação existente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      estudante_id, 
      data_reuniao, 
      confirmada, 
      observacoes 
    } = req.body;

    console.log(`📝 Atualizando designação: ${id}`);

    // Verificar se a designação existe
    const { data: designacaoExistente, error: checkError } = await supabase
      .from('designacoes')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError || !designacaoExistente) {
      return res.status(404).json({
        success: false,
        error: 'Designação não encontrada'
      });
    }

    // Preparar dados para atualização
    const updateData = {};
    
    if (estudante_id !== undefined) {
      // Validar se o novo estudante existe
      const { data: estudante, error: estudanteError } = await supabase
        .from('estudantes')
        .select('*')
        .eq('id', estudante_id)
        .single();

      if (estudanteError || !estudante) {
        return res.status(404).json({
          success: false,
          error: 'Estudante não encontrado'
        });
      }

      // Verificar compatibilidade com a parte
      const { data: parte, error: parteError } = await supabase
        .from('partes')
        .select('genero_requerido')
        .eq('id', designacaoExistente.parte_id)
        .single();

      if (parteError) {
        throw new Error('Erro ao verificar requisitos da parte');
      }

      if (parte.genero_requerido === 'masculino' && estudante.genero !== 'masculino') {
        return res.status(400).json({
          success: false,
          error: 'Esta parte requer um estudante do gênero masculino'
        });
      }

      if (parte.genero_requerido === 'feminino' && estudante.genero !== 'feminino') {
        return res.status(400).json({
          success: false,
          error: 'Esta parte requer um estudante do gênero feminino'
        });
      }

      updateData.estudante_id = estudante_id;
    }

    if (data_reuniao !== undefined) {
      updateData.data_reuniao = data_reuniao;
    }

    if (confirmada !== undefined) {
      updateData.confirmada = confirmada;
    }

    if (observacoes !== undefined) {
      updateData.observacoes = observacoes;
    }

    // Realizar atualização
    const { data: designacaoAtualizada, error: updateError } = await supabase
      .from('designacoes')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        partes:partes(
          id,
          secao,
          titulo,
          tipo,
          duracao,
          genero_requerido,
          programas_ministeriais:programas_ministeriais(
            id,
            semana,
            periodo,
            tema
          )
        ),
        estudantes:estudantes(
          id,
          nome,
          genero
        )
      `)
      .single();

    if (updateError) {
      throw new Error(`Erro ao atualizar designação: ${updateError.message}`);
    }

    console.log('✅ Designação atualizada:', designacaoAtualizada.id);

    res.json({
      success: true,
      message: 'Designação atualizada com sucesso',
      designacao: designacaoAtualizada
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar designação:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// DELETE /api/designacoes/:id - Remover designação
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Removendo designação: ${id}`);

    const { error } = await supabase
      .from('designacoes')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Designação não encontrada'
        });
      }
      throw new Error(`Erro ao remover designação: ${error.message}`);
    }

    console.log('✅ Designação removida');

    res.json({
      success: true,
      message: 'Designação removida com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao remover designação:', error);
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

// GET /api/designacoes/estudante/:estudante_id - Histórico do estudante
router.get('/estudante/:estudante_id', async (req, res) => {
  try {
    const { estudante_id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    console.log(`📚 Buscando histórico do estudante: ${estudante_id}`);

    const { data: designacoes, error } = await supabase
      .from('designacoes')
      .select(`
        *,
        partes:partes(
          id,
          secao,
          titulo,
          tipo,
          duracao,
          programas_ministeriais:programas_ministeriais(
            id,
            semana,
            periodo,
            tema
          )
        )
      `)
      .eq('estudante_id', estudante_id)
      .order('data_reuniao', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Erro ao buscar histórico: ${error.message}`);
    }

    res.json({
      success: true,
      designacoes,
      total: designacoes.length
    });

  } catch (error) {
    console.error('❌ Erro ao buscar histórico:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// GET /api/designacoes/programa/:programa_id - Designações de um programa
router.get('/programa/:programa_id', async (req, res) => {
  try {
    const { programa_id } = req.params;

    console.log(`📋 Buscando designações do programa: ${programa_id}`);

    const { data: designacoes, error } = await supabase
      .from('designacoes')
      .select(`
        *,
        partes:partes(
          id,
          secao,
          titulo,
          tipo,
          duracao,
          genero_requerido,
          ordem
        ),
        estudantes:estudantes(
          id,
          nome,
          genero
        )
      `)
      .eq('partes.programa_id', programa_id)
      .order('data_reuniao');

    if (error) {
      throw new Error(`Erro ao buscar designações do programa: ${error.message}`);
    }

    res.json({
      success: true,
      designacoes,
      total: designacoes.length
    });

  } catch (error) {
    console.error('❌ Erro ao buscar designações do programa:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// POST /api/designacoes/bulk - Criar múltiplas designações de uma vez
router.post('/bulk', async (req, res) => {
  try {
    const { designacoes } = req.body;

    if (!Array.isArray(designacoes) || designacoes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Array de designações é obrigatório'
      });
    }

    console.log(`➕ Criando ${designacoes.length} designações em lote`);

    const results = [];
    const errors = [];

    for (const [index, designacao] of designacoes.entries()) {
      try {
        const { parte_id, estudante_id, data_reuniao, observacoes } = designacao;

        if (!parte_id || !estudante_id || !data_reuniao) {
          errors.push({
            index,
            error: 'Campos obrigatórios ausentes',
            designacao
          });
          continue;
        }

        // TODO: Implementar validações similares ao POST individual
        
        const { data: novaDesignacao, error: createError } = await supabase
          .from('designacoes')
          .insert({
            parte_id,
            estudante_id,
            data_reuniao,
            observacoes: observacoes || null,
            confirmada: false
          })
          .select('id')
          .single();

        if (createError) {
          errors.push({
            index,
            error: createError.message,
            designacao
          });
        } else {
          results.push(novaDesignacao);
        }

      } catch (error) {
        errors.push({
          index,
          error: error.message,
          designacao
        });
      }
    }

    console.log(`✅ Lote processado: ${results.length} sucessos, ${errors.length} erros`);

    res.json({
      success: true,
      message: `Processadas ${designacoes.length} designações`,
      results,
      errors,
      summary: {
        total: designacoes.length,
        successful: results.length,
        failed: errors.length
      }
    });

  } catch (error) {
    console.error('❌ Erro no processamento em lote:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// =====================================================
// ROTA PARA LISTAR ESTUDANTES (apoio às designações)
// =====================================================

// GET /api/designacoes/estudantes - Listar estudantes disponíveis para designação
router.get('/estudantes', async (req, res) => {
  try {
    const { congregacao_id, genero, ativo = true } = req.query;

    console.log('👥 Buscando estudantes para designação:', { congregacao_id, genero, ativo });

    let query = supabase
      .from('estudantes')
      .select('*')
      .order('nome');

    if (ativo !== undefined) {
      query = query.eq('ativo', ativo === 'true');
    }

    if (congregacao_id) {
      query = query.eq('congregacao_id', congregacao_id);
    }

    if (genero) {
      query = query.eq('genero', genero);
    }

    const { data: estudantes, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar estudantes: ${error.message}`);
    }

    console.log(`✅ Encontrados ${estudantes.length} estudantes`);

    res.json({
      success: true,
      estudantes,
      total: estudantes.length
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estudantes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

module.exports = router;
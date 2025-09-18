const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const NotificationService = require('../services/notificationService');
const S38Algorithm = require('../services/s38Algorithm');

// Instanciar serviço de notificações
const notificationService = new NotificationService();

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
    let programacao, itens;
    
    // First try to get from database
    const { data: dbProgramacao, error: progError } = await supabase
      .from('programacoes')
      .select('*')
      .eq('id', programacao_id)
      .single();

    if (!progError && dbProgramacao) {
      programacao = dbProgramacao;
      
      const { data: dbItens, error: itensError } = await supabase
        .from('programacao_itens')
        .select('*')
        .eq('programacao_id', programacao_id)
        .order('order', { ascending: true });

      if (itensError) {
        throw new Error(`Erro ao buscar itens: ${itensError.message}`);
      }
      
      itens = dbItens;
    } else {
      // If not found in database, try to load from JSON files
      console.log('Programação não encontrada no banco, tentando carregar do JSON...');
      
      // Load from JSON files
      const fs = require('fs');
      const path = require('path');
      
      const jsonPath = path.join(__dirname, '../../docs/Oficial/programacoes-json');
      const files = fs.readdirSync(jsonPath).filter(file => file.endsWith('.json'));
      
      let programaData = null;
      
      for (const file of files) {
        try {
          const filePath = path.join(jsonPath, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const jsonData = JSON.parse(content);
          
          // Check if this file contains the program we're looking for
          if (Array.isArray(jsonData)) {
            const programa = jsonData.find(p => p.idSemana === programacao_id);
            if (programa) {
              programaData = programa;
              break;
            }
          } else if (jsonData.idSemana === programacao_id) {
            programaData = jsonData;
            break;
          }
        } catch (fileError) {
          console.warn(`⚠️ Erro ao processar arquivo ${file}:`, fileError.message);
        }
      }
      
      if (!programaData) {
        return res.status(404).json({
          success: false,
          error: 'Programação não encontrada'
        });
      }
      
      // Create programacao object from JSON data
      programacao = {
        id: programaData.idSemana,
        titulo: programaData.semanaLabel,
        tema: programaData.tema,
        data: programaData.idSemana
      };
      
      // Create itens array from JSON data
      itens = [];
      if (programaData.programacao) {
        programaData.programacao.forEach((secao, secaoIndex) => {
          secao.partes.forEach((parte, parteIndex) => {
            itens.push({
              id: `${programacao_id}-${secaoIndex}-${parteIndex}`,
              programacao_id: programacao_id,
              titulo: parte.titulo,
              tipo: parte.tipo,
              tempo: parte.duracaoMin,
              ordem: parte.idParte,
              secao: secao.secao,
              regras_papel: {
                genero: parte.restricoes?.genero || parte.restricoes?.genero_requerido || 'qualquer',
                assistente_necessario: parte.restricoes?.assistente_necessario || false
              }
            });
          });
        });
      }
    }

    // 2. Buscar estudantes elegíveis da congregação (com fallback mock)
    let mockMode = false;
    let estudantes = [];
    try {
      const { data: estData, error: estudantesError } = await supabase
        .from('estudantes')
        .select('*')
        .eq('congregacao_id', congregacao_id)
        .eq('ativo', true);
      
      if (estudantesError) {
        throw estudantesError;
      }
      estudantes = estData || [];
    } catch (e) {
      console.warn('⚠️ Erro ao buscar estudantes, ativando fallback mock:', e?.message || e);
      mockMode = true;
      estudantes = [
        { id: 'est1', nome: 'João Silva', genero: 'masculino', ativo: true, qualificacoes: { reading: true, starting: true, following: true, making: true, explaining: true }, privileges: ['elder'] },
        { id: 'est2', nome: 'Pedro Santos', genero: 'masculino', ativo: true, qualificacoes: { starting: true, following: true, making: true }, privileges: [] },
        { id: 'est3', nome: 'Maria Oliveira', genero: 'feminino', ativo: true, qualificacoes: { starting: true, following: true, making: true, explaining: true }, privileges: [] },
        { id: 'est4', nome: 'Ana Costa', genero: 'feminino', ativo: true, qualificacoes: { starting: true, following: true }, privileges: [] },
        { id: 'est5', nome: 'Carlos Ferreira', genero: 'masculino', ativo: true, qualificacoes: { reading: true, explaining: true }, privileges: ['elder'] },
      ];
    }
    
    console.log(`🧑‍🎓 Encontrados ${estudantes?.length || 0} estudantes ativos na congregação${mockMode ? ' (mock)' : ''}`);
    
    if (!estudantes || estudantes.length === 0) {
      console.warn('⚠️ Nenhum estudante no banco; usando fallback mock.');
      mockMode = true;
      estudantes = [
        { id: 'est1', nome: 'João Silva', genero: 'masculino', ativo: true, qualificacoes: { reading: true, starting: true, following: true, making: true, explaining: true, talk: true, gems: true, treasures: true, congregation_study: true }, privileges: ['elder'] },
        { id: 'est2', nome: 'Pedro Santos', genero: 'masculino', ativo: true, qualificacoes: { starting: true, following: true, making: true, talk: true, gems: true, treasures: true }, privileges: ['ministerial_servant'] },
        { id: 'est3', nome: 'Maria Oliveira', genero: 'feminino', ativo: true, qualificacoes: { starting: true, following: true, making: true, explaining: true }, privileges: [] },
        { id: 'est4', nome: 'Ana Costa', genero: 'feminino', ativo: true, qualificacoes: { starting: true, following: true }, privileges: [] },
        { id: 'est5', nome: 'Carlos Ferreira', genero: 'masculino', ativo: true, qualificacoes: { reading: true, explaining: true }, privileges: [] },
      ];
    }
    
    // Log para depuração - verificar estrutura dos estudantes
    if (estudantes.length > 0) {
      console.log('Exemplo de estudante:', JSON.stringify(estudantes[0], null, 2));
    }

    // 3. Buscar histórico de designações para fairness
    let assignmentHistory = [];
    try {
      const { data: historyData, error: historyError } = await supabase
        .from('designacao_itens')
        .select(`
          principal_estudante_id,
          assistente_estudante_id,
          created_at,
          programacao_itens!inner(tipo)
        `)
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()); // Last 90 days
      
      if (!historyError && historyData) {
        assignmentHistory = historyData.map(h => ({
          ...h,
          tipo: h.programacao_itens?.tipo || 'unknown'
        }));
      }
    } catch (historyError) {
      console.warn('⚠️ Could not load assignment history:', historyError.message);
    }

    // 4. Aplicar algoritmo S-38 completo
    console.log('🎯 Applying comprehensive S-38 algorithm...');
    const designacoesGeradas = S38Algorithm.generateAssignments(
      itens,
      estudantes,
      assignmentHistory,
      congregacao_id
    );

    // Se estamos em modo mock, retornar sem persistir em banco
    if (mockMode) {
      console.log(`✅ Generated ${designacoesGeradas.length} assignments (mock mode, no persistence)`);
      return res.json({
        success: true,
        message: 'Designações geradas com sucesso usando algoritmo S-38 (modo mock)',
        designacoes: designacoesGeradas,
        algorithm: 'S-38 Comprehensive',
        summary: {
          total_itens: itens.length,
          designacoes_ok: designacoesGeradas.filter(d => d.status === 'OK').length,
          designacoes_pendentes: designacoesGeradas.filter(d => d.status === 'PENDING').length,
          fallbacks_applied: designacoesGeradas.filter(d => d.observacoes && d.observacoes !== null).length
        }
      });
    }

    // 4. Salvar designações no banco (limpar existentes primeiro)
    let designacaoId;
    
    try {
      const { data: designacaoExistente, error: designacaoError } = await supabase
        .from('designacoes')
        .select('id')
        .eq('programacao_id', programacao_id)
        .eq('congregacao_id', congregacao_id)
        .single();

      if (designacaoError || !designacaoExistente) {
        // Criar nova designação
        const { data: novaDesignacao, error: createError } = await supabase
          .from('designacoes')
          .insert({
            programacao_id: programacao_id,
            congregacao_id: congregacao_id
          })
          .select()
          .single();
        
        if (createError) {
          // Handle schema cache issues specifically
          if (createError.message && (createError.message.includes('schema cache') || 
              createError.message.includes('congregacao_id') || 
              createError.message.includes('programacao_id') ||
              createError.message.includes('column') ||
              createError.message.includes('PGRST'))) {
            console.warn('⚠️ Schema cache issue detected, falling back to mock mode');
            return res.json({
              success: true,
              message: 'Designações geradas com sucesso usando algoritmo S-38 (modo mock - schema cache issue)',
              designacoes: designacoesGeradas,
              algorithm: 'S-38 Comprehensive',
              summary: {
                total_itens: itens.length,
                designacoes_ok: designacoesGeradas.filter(d => d.status === 'OK').length,
                designacoes_pendentes: designacoesGeradas.filter(d => d.status === 'PENDING').length,
                fallbacks_applied: designacoesGeradas.filter(d => d.observacoes && d.observacoes !== null).length
              }
            });
          }
          throw new Error(`Erro ao criar designação: ${createError.message}`);
        }
        
        designacaoId = novaDesignacao.id;
      } else {
        designacaoId = designacaoExistente.id;
        // Limpar itens existentes
        await supabase
          .from('designacao_itens')
          .delete()
          .eq('designacao_id', designacaoId);
      }

      // Inserir itens de designação
      if (designacoesGeradas.length > 0) {
        const itensParaInserir = designacoesGeradas.map(d => ({
          designacao_id: designacaoId,
          programacao_item_id: d.programacao_item_id,
          principal_estudante_id: d.principal_estudante_id,
          assistente_estudante_id: d.assistente_estudante_id,
          observacoes: d.observacoes
        }));

        const { error: insertError } = await supabase
          .from('designacao_itens')
          .insert(itensParaInserir);

        if (insertError) {
          // Handle schema cache issues for designacao_itens table
          if (insertError.message && (insertError.message.includes('schema cache') || 
              insertError.message.includes('column') ||
              insertError.message.includes('PGRST'))) {
            console.warn('⚠️ Schema cache issue in designacao_itens, falling back to mock mode');
            return res.json({
              success: true,
              message: 'Designações geradas com sucesso usando algoritmo S-38 (modo mock - schema cache issue)',
              designacoes: designacoesGeradas,
              algorithm: 'S-38 Comprehensive',
              summary: {
                total_itens: itens.length,
                designacoes_ok: designacoesGeradas.filter(d => d.status === 'OK').length,
                designacoes_pendentes: designacoesGeradas.filter(d => d.status === 'PENDING').length,
                fallbacks_applied: designacoesGeradas.filter(d => d.observacoes && d.observacoes !== null).length
              }
            });
          }
          throw new Error(`Erro ao salvar designações: ${insertError.message}`);
        }
      }

      console.log(`✅ Generated ${designacoesGeradas.length} assignments using S-38 algorithm`);
      console.log(`📊 Summary: ${designacoesGeradas.filter(d => d.status === 'OK').length} OK, ${designacoesGeradas.filter(d => d.status === 'PENDING').length} PENDING`);

      // Enviar notificações de confirmação
      const designacoesComNomes = await Promise.all(designacoesGeradas.map(async (d) => {
        try {
          const principalEstudante = await supabase
            .from('estudantes')
            .select('*')
            .eq('id', d.principal_estudante_id)
            .single();
            
          const assistenteEstudante = await supabase
            .from('estudantes')
            .select('*')
            .eq('id', d.assistente_estudante_id)
            .single();
            
          return {
            ...d,
            principal_estudante: principalEstudante.data,
            assistente_estudante: assistenteEstudante.data
          };
        } catch (error) {
          console.warn('⚠️ Erro ao buscar dados do estudante:', error.message);
          return d;
        }
      }));

      // Enviar notificações para cada designação
      for (const designacao of designacoesComNomes) {
        if (designacao.principal_estudante || designacao.assistente_estudante) {
          try {
            await notificationService.sendAssignmentConfirmation(designacao, designacao, programacao);
          } catch (error) {
            console.warn('⚠️ Erro ao enviar notificação:', error.message);
          }
        }
      }

      // Buscar os itens de designação recém-criados para retornar ao frontend
      const { data: itensDesignacao, error: itensDesignacaoError } = await supabase
        .from('designacao_itens')
        .select(`
          id,
          programacao_item_id,
          principal_estudante_id,
          assistente_estudante_id,
          observacoes,
          programacao_itens:programacao_item_id(id, titulo, tipo, tempo, ordem)
        `)
        .eq('designacao_id', designacaoId);

      if (itensDesignacaoError) {
        console.warn('⚠️ Erro ao buscar itens de designação:', itensDesignacaoError.message);
      }

      res.json({
        success: true,
        message: 'Designações geradas com sucesso usando algoritmo S-38',
        designacoes: itensDesignacao || designacoesGeradas,
        algorithm: 'S-38 Comprehensive',
        summary: {
          total_itens: itens.length,
          designacoes_ok: designacoesGeradas.filter(d => d.status === 'OK').length,
          designacoes_pendentes: designacoesGeradas.filter(d => d.status === 'PENDING').length,
          fallbacks_applied: designacoesGeradas.filter(d => d.observacoes && d.observacoes !== null).length
        }
      });
    } catch (dbError) {
      // Handle database errors with graceful fallback
      console.error('❌ Database error in designacoes generation:', dbError.message);
      
      // If it's a schema cache issue, fall back to mock mode
      if (dbError.message && (dbError.message.includes('schema cache') || 
          dbError.message.includes('congregacao_id') || 
          dbError.message.includes('programacao_id') ||
          dbError.message.includes('column') ||
          dbError.message.includes('PGRST'))) {
        console.warn('⚠️ Schema cache issue detected, falling back to mock mode');
        return res.json({
          success: true,
          message: 'Designações geradas com sucesso usando algoritmo S-38 (modo mock - schema cache issue)',
          designacoes: designacoesGeradas,
          algorithm: 'S-38 Comprehensive',
          summary: {
            total_itens: itens.length,
            designacoes_ok: designacoesGeradas.filter(d => d.status === 'OK').length,
            designacoes_pendentes: designacoesGeradas.filter(d => d.status === 'PENDING').length,
            fallbacks_applied: designacoesGeradas.filter(d => d.observacoes && d.observacoes !== null).length
          }
        });
      }
      
      // For other errors, return error response
      throw dbError;
    }

  } catch (error) {
    console.error('❌ Error in designacoes generation:', error);
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

    // Buscar designação principal
    const { data: designacao, error: designacaoError } = await supabase
      .from('designacoes')
      .select('id')
      .eq('programacao_id', programacao_id)
      .eq('congregacao_id', congregacao_id)
      .single();

    if (designacaoError || !designacao) {
      return res.json({
        success: true,
        itens: [],
        total: 0
      });
    }

    // Buscar itens de designação com joins
    const { data: itens, error } = await supabase
      .from('designacao_itens')
      .select(`
        *,
        principal_estudante:estudantes!principal_estudante_id(id, nome, genero),
        assistente_estudante:estudantes!assistente_estudante_id(id, nome, genero)
      `)
      .eq('designacao_id', designacao.id);

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

    // Verificar se já existe uma designação para este programa e congregação
    const { data: designacaoExistente, error: designacaoError } = await supabase
      .from('designacoes')
      .select('id')
      .eq('programacao_id', programacao_id)
      .eq('congregacao_id', congregacao_id)
      .single();

    let designacaoId;
    if (designacaoError || !designacaoExistente) {
      // Criar nova designação
      let createError;
      let novaDesignacao;
      
      try {
        const result = await supabase
          .from('designacoes')
          .insert({
            programacao_id: programacao_id,
            congregacao_id: congregacao_id
          })
          .select()
          .single();
        
        createError = result.error;
        novaDesignacao = result.data;
      } catch (insertError) {
        // Handle schema cache issues specifically
        if (insertError.message && (insertError.message.includes('schema cache') || insertError.message.includes('congregacao_id'))) {
          return res.status(503).json({
            success: false,
            error: 'Sistema temporariamente indisponível',
            details: 'O sistema está passando por uma atualização de esquema. Por favor, tente novamente em alguns minutos.',
            retryAfter: 300 // 5 minutes
          });
        }
        throw insertError;
      }
      
      if (createError) {
        // Check if it's a schema cache error
        if (createError.message && (createError.message.includes('schema cache') || createError.message.includes('congregacao_id'))) {
          return res.status(503).json({
            success: false,
            error: 'Sistema temporariamente indisponível',
            details: 'O sistema está passando por uma atualização de esquema. Por favor, tente novamente em alguns minutos.',
            retryAfter: 300 // 5 minutes
          });
        }
        throw new Error(`Erro ao criar designação: ${createError.message}`);
      }
      
      designacaoId = novaDesignacao.id;
    } else {
      designacaoId = designacaoExistente.id;
    }

    // Atualizar ou inserir itens
    for (const item of itens) {
      // Verificar se já existe
      const { data: itemExistente, error: itemError } = await supabase
        .from('designacao_itens')
        .select('id')
        .eq('designacao_id', designacaoId)
        .eq('programacao_item_id', item.programacao_item_id)
        .single();

      if (itemExistente) {
        // Atualizar item existente
        const { error: updateError } = await supabase
          .from('designacao_itens')
          .update({
            principal_estudante_id: item.principal_estudante_id,
            assistente_estudante_id: item.assistente_estudante_id,
            observacoes: item.observacoes
          })
          .eq('id', itemExistente.id);

        if (updateError) {
          console.warn('⚠️ Erro ao atualizar item:', updateError.message);
        }
      } else {
        // Inserir novo item
        const { error: insertError } = await supabase
          .from('designacao_itens')
          .insert({
            designacao_id: designacaoId,
            programacao_item_id: item.programacao_item_id,
            principal_estudante_id: item.principal_estudante_id,
            assistente_estudante_id: item.assistente_estudante_id,
            observacoes: item.observacoes
          });

        if (insertError) {
          console.warn('⚠️ Erro ao inserir item:', insertError.message);
          // Handle schema cache errors specifically for item insertion
          if (insertError.message && (insertError.message.includes('schema cache') || insertError.message.includes('congregacao_id'))) {
            return res.status(503).json({
              success: false,
              error: 'Sistema temporariamente indisponível',
              details: 'O sistema está passando por uma atualização de esquema. Por favor, tente novamente em alguns minutos.',
              retryAfter: 300 // 5 minutes
            });
          }
        }
      }
    }

    res.json({
      success: true,
      message: 'Designações salvas com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao salvar designações:', error);
    
    // Handle schema cache errors specifically
    if (error.message && (error.message.includes('schema cache') || error.message.includes('congregacao_id'))) {
      return res.status(503).json({
        success: false,
        error: 'Sistema temporariamente indisponível',
        details: 'O sistema está passando por uma atualização de esquema. Por favor, tente novamente em alguns minutos.',
        retryAfter: 300 // 5 minutes
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// POST /api/designacoes/:id/confirm - Confirmar designação
router.post('/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    const { estudante_id, tipo } = req.body; // tipo: 'principal' ou 'assistente'
    
    // Buscar a designação
    const { data: designacao, error } = await supabase
      .from('designacao_itens')
      .select(`
        *,
        principal_estudante:estudantes!principal_estudante_id(*),
        assistente_estudante:estudantes!assistente_estudante_id(*),
        programacao_item:programacao_itens(*),
        programacao:programacoes(*)
      `)
      .eq('id', id)
      .single();

    if (error || !designacao) {
      return res.status(404).json({
        success: false,
        error: 'Designação não encontrada'
      });
    }

    // Atualizar status de confirmação
    const updateData = {};
    if (tipo === 'principal') {
      updateData.principal_confirmado = true;
      updateData.principal_confirmado_em = new Date().toISOString();
    } else if (tipo === 'assistente') {
      updateData.assistente_confirmado = true;
      updateData.assistente_confirmado_em = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('designacao_itens')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      throw new Error(`Erro ao confirmar designação: ${updateError.message}`);
    }

    // Enviar notificação de confirmação de recebimento
    await notificationService.sendConfirmationReceipt(designacao, designacao, designacao.programacao);

    res.json({
      success: true,
      message: 'Designação confirmada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao confirmar designação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

module.exports = router;
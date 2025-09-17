const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const NotificationService = require('../services/notificationService');

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
                genero: 'qualquer',
                assistente_necessario: false
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
        { id: 'est1', nome: 'João Silva', genero: 'masculino', ativo: true, qualificacoes: { reading: true, starting: true, following: true, making: true, explaining: true }, privileges: ['elder'] },
        { id: 'est2', nome: 'Pedro Santos', genero: 'masculino', ativo: true, qualificacoes: { starting: true, following: true, making: true }, privileges: [] },
        { id: 'est3', nome: 'Maria Oliveira', genero: 'feminino', ativo: true, qualificacoes: { starting: true, following: true, making: true, explaining: true }, privileges: [] },
        { id: 'est4', nome: 'Ana Costa', genero: 'feminino', ativo: true, qualificacoes: { starting: true, following: true }, privileges: [] },
        { id: 'est5', nome: 'Carlos Ferreira', genero: 'masculino', ativo: true, qualificacoes: { reading: true, explaining: true }, privileges: ['elder'] },
      ];
    }
    
    // Log para depuração - verificar estrutura dos estudantes
    if (estudantes.length > 0) {
      console.log('Exemplo de estudante:', JSON.stringify(estudantes[0], null, 2));
    }

    // 3. Aplicar regras S-38 completas
    const designacoesGeradas = [];
    
    for (const item of itens) {
      let estudanteElegivel = null;
      let assistenteElegivel = null;

      // Normalizar campos de item (schema antigo/novo)
      const itemType = item.type || item.tipo;
      const itemRulesRaw = item.rules || item.regras_s38 || item.regras_papel || {};
      const genderRule = itemRulesRaw.genero || itemRulesRaw.gender || itemRulesRaw.sexo;
      const assistantRequired = itemRulesRaw.assistente_necessario || itemRulesRaw.assistant_required || itemRulesRaw.assistente === true;

      // Filtrar estudantes por tipo de parte (regras S-38)
      console.log(`Filtrando estudantes para item tipo: ${item.tipo}`);
      const estudantesFiltrados = estudantes.filter(est => {
        // Verificar gênero - regras_papel pode não existir em todos os itens
        const generoRequerido = item.regras_papel?.genero || 'qualquer';
        const generoCorreto = generoRequerido === 'masculino' ? est.genero === 'masculino' : true;
        
        if (!generoCorreto) return false;

        // Verificar qualificações específicas
        switch (item.tipo) {
          case 'bible_reading':
            return est.genero === 'masculino' && est.qualificacoes?.reading === true;
            
          case 'starting':
            return est.qualificacoes?.starting === true;
            
          case 'following':
            return est.qualificacoes?.following === true;
            
          case 'making_disciples':
            return est.qualificacoes?.making === true;
            
          case 'initial_call':
          case 'return_visit':
          case 'bible_study':
            // Verificar se tem as qualificações necessárias
            const hasQualification = 
              est.qualificacoes?.starting === true || 
              est.qualificacoes?.following === true || 
              est.qualificacoes?.making === true ||
              est.qualificacoes?.explaining === true;
            return hasQualification;
            
          case 'talk':
            // Apenas homens qualificados
            return est.genero === 'masculino' && (est.talk === true || est.treasures === true);
            
          case 'spiritual_gems':
            return est.genero === 'masculino' && est.gems === true;
            
          case 'treasures':
            return est.genero === 'masculino' && est.treasures === true;
            
          case 'congregation_study':
            // Apenas anciãos qualificados
            {
              const privs = Array.isArray(est.privileges) ? est.privileges : (Array.isArray(est.privilegios) ? est.privilegios : []);
              return est.genero === 'masculino' && (privs.includes('anciao') || privs.includes('elder'));
            }
            
          default:
            return est.ativo === true;
        }
      });

      // Selecionar primeiro elegível (algoritmo simples)
      if (estudantesFiltrados.length > 0) {
        estudanteElegivel = estudantesFiltrados[0];
        
        // Para partes que requerem assistente, tentar encontrar assistente
        if (assistantRequired) {
          const assistentesFiltrados = estudantesFiltrados.filter(est => 
            est.id !== estudanteElegivel.id && 
            (est.genero === estudanteElegivel.genero || 
             est.id_pai === estudanteElegivel.id || 
             est.id_mae === estudanteElegivel.id ||
             estudanteElegivel.id_pai === est.id ||
             estudanteElegivel.id_mae === est.id)
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

    // Se estamos em modo mock, retornar sem persistir em banco
    if (mockMode) {
      console.log(`✅ Geradas ${designacoesGeradas.length} designações (mock, sem persistência)`);
      return res.json({
        success: true,
        message: 'Designações geradas com sucesso (modo mock)',
        designacoes: designacoesGeradas,
        summary: {
          total_itens: itens.length,
          designacoes_ok: designacoesGeradas.filter(d => d.status === 'OK').length,
          designacoes_pendentes: designacoesGeradas.filter(d => d.status === 'PENDING').length
        }
      });
    }

    // 4. Salvar designações no banco (limpar existentes primeiro)
    const { data: designacaoExistente, error: designacaoError } = await supabase
      .from('designacoes')
      .select('id')
      .eq('programacao_id', programacao_id)
      .eq('congregacao_id', congregacao_id)
      .single();

    let designacaoId;
    if (designacaoError || !designacaoExistente) {
      // Criar nova designação
      let designacaoId;
      
      // Try the standard insert first
      try {
        const { data: novaDesignacao, error: createError } = await supabase
          .from('designacoes')
          .insert({
            programacao_id: programacao_id,
            congregacao_id: congregacao_id
          })
          .select()
          .single();
        
        if (createError) {
          // Check if it's a schema cache error
          if (createError.message && (createError.message.includes('schema cache') || createError.message.includes('congregacao_id'))) {
            // For schema cache issues, we'll return a more user-friendly error
            // In a production environment, you'd want to implement a proper solution
            throw new Error('O sistema está passando por uma atualização de esquema. Por favor, tente novamente em alguns minutos.');
          }
          throw new Error(`Erro ao criar designação: ${createError.message}`);
        }
        
        designacaoId = novaDesignacao.id;
      } catch (insertError) {
        // Handle schema cache issues specifically
        if (insertError.message && (insertError.message.includes('schema cache') || insertError.message.includes('congregacao_id'))) {
          throw new Error('O sistema está temporariamente indisponível devido a uma atualização de esquema. Por favor, tente novamente em alguns minutos.');
        }
        throw insertError;
      }
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
        throw new Error(`Erro ao salvar designações: ${insertError.message}`);
      }
    }

    console.log(`✅ Geradas ${designacoesGeradas.length} designações`);

    // Enviar notificações de confirmação
    const designacoesComNomes = await Promise.all(designacoesGeradas.map(async (d) => {
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
    }));

    // Enviar notificações para cada designação
    for (const designacao of designacoesComNomes) {
      if (designacao.principal_estudante || designacao.assistente_estudante) {
        await notificationService.sendAssignmentConfirmation(designacao, designacao, programacao);
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
      message: `Designações geradas com sucesso`,
      designacoes: itensDesignacao || designacoesGeradas, // Retornar os itens com detalhes ou fallback para designacoesGeradas
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
          throw new Error('O sistema está temporariamente indisponível devido a uma atualização de esquema. Por favor, tente novamente em alguns minutos.');
        }
        throw insertError;
      }
      
      if (createError) {
        // Check if it's a schema cache error
        if (createError.message && (createError.message.includes('schema cache') || createError.message.includes('congregacao_id'))) {
          throw new Error('O sistema está temporariamente indisponível devido a uma atualização de esquema. Por favor, tente novamente em alguns minutos.');
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
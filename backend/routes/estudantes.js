const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// =====================================================
// API DE ESTUDANTES - COM SUPORTE A REGRAS S-38
// =====================================================

// GET /api/estudantes - Listar todos os estudantes
router.get('/', async (req, res) => {
  try {
    const { congregacao_id, ativo } = req.query;
    
    let query = supabase
      .from('estudantes')
      .select('*');

    if (congregacao_id) {
      query = query.eq('congregacao_id', congregacao_id);
    }
    
    if (ativo !== undefined) {
      query = query.eq('ativo', ativo === 'true');
    }

    const { data: estudantes, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar estudantes: ${error.message}`);
    }

    res.json({
      success: true,
      estudantes: estudantes || [],
      total: (estudantes || []).length
    });

  } catch (error) {
    console.error('❌ Erro ao listar estudantes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// GET /api/estudantes/:id - Obter estudante específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: estudante, error } = await supabase
      .from('estudantes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Estudante não encontrado'
      });
    }

    res.json({
      success: true,
      estudante
    });

  } catch (error) {
    console.error('❌ Erro ao obter estudante:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// POST /api/estudantes - Criar novo estudante
router.post('/', async (req, res) => {
  try {
    const estudanteData = req.body;
    
    // Validar dados obrigatórios
    if (!estudanteData.nome || !estudanteData.genero) {
      return res.status(400).json({
        success: false,
        error: 'Nome e gênero são obrigatórios'
      });
    }

    // Validar gênero
    if (!['masculino', 'feminino'].includes(estudanteData.genero)) {
      return res.status(400).json({
        success: false,
        error: 'Gênero deve ser masculino ou feminino'
      });
    }

    // Validar qualificações S-38
    const s38Validations = validateS38Qualifications(estudanteData);
    if (!s38Validations.valid) {
      return res.status(400).json({
        success: false,
        error: 'Erro nas qualificações S-38',
        details: s38Validations.errors
      });
    }

    const { data: estudante, error } = await supabase
      .from('estudantes')
      .insert(estudanteData)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar estudante: ${error.message}`);
    }

    res.status(201).json({
      success: true,
      message: 'Estudante criado com sucesso',
      estudante
    });

  } catch (error) {
    console.error('❌ Erro ao criar estudante:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// PUT /api/estudantes/:id - Atualizar estudante
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const estudanteData = req.body;
    
    // Validar qualificações S-38 se fornecidas
    if (Object.keys(estudanteData).some(key => 
      ['reading', 'treasures', 'gems', 'talk', 'explaining', 'starting', 'following', 'making', 'congregation_study'].includes(key))) {
      
      const s38Validations = validateS38Qualifications(estudanteData);
      if (!s38Validations.valid) {
        return res.status(400).json({
          success: false,
          error: 'Erro nas qualificações S-38',
          details: s38Validations.errors
        });
      }
    }

    const { data: estudante, error } = await supabase
      .from('estudantes')
      .update(estudanteData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Estudante não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Estudante atualizado com sucesso',
      estudante
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar estudante:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// DELETE /api/estudantes/:id - Excluir estudante (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: estudante, error } = await supabase
      .from('estudantes')
      .update({ ativo: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Estudante não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Estudante desativado com sucesso',
      estudante
    });

  } catch (error) {
    console.error('❌ Erro ao desativar estudante:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// GET /api/estudantes/:id/qualifications - Obter qualificações S-38 do estudante
router.get('/:id/qualifications', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: estudante, error } = await supabase
      .from('estudantes')
      .select(`
        id,
        nome,
        genero,
        reading,
        treasures,
        gems,
        talk,
        explaining,
        starting,
        following,
        making,
        congregation_study,
        privileges
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Estudante não encontrado'
      });
    }

    // Formatar qualificações para exibição
    const qualifications = formatS38Qualifications(estudante);
    
    res.json({
      success: true,
      estudante: {
        id: estudante.id,
        nome: estudante.nome,
        genero: estudante.genero
      },
      qualifications
    });

  } catch (error) {
    console.error('❌ Erro ao obter qualificações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// Função para validar qualificações S-38
function validateS38Qualifications(estudanteData) {
  const errors = [];
  const validations = {
    valid: true,
    errors: []
  };

  // Validar Leitura da Bíblia (apenas homens)
  if (estudanteData.reading === true && estudanteData.genero !== 'masculino') {
    errors.push('Leitura da Bíblia é permitida apenas para homens');
  }

  // Validar partes que requerem qualificação masculina
  const maleOnlyParts = ['treasures', 'gems', 'talk'];
  for (const part of maleOnlyParts) {
    if (estudanteData[part] === true && estudanteData.genero !== 'masculino') {
      errors.push(`${part} é permitido apenas para homens`);
    }
  }

  // Validar Estudo Bíblico de Congregação (apenas anciãos)
  if (estudanteData.congregation_study === true) {
    const privileges = Array.isArray(estudanteData.privileges) ? estudanteData.privileges : [];
    if (!privileges.includes('anciao') && !privileges.includes('elder')) {
      errors.push('Estudo Bíblico de Congregação requer privilégio de ancião');
    }
  }

  if (errors.length > 0) {
    validations.valid = false;
    validations.errors = errors;
  }

  return validations;
}

// Função para formatar qualificações S-38
function formatS38Qualifications(estudante) {
  const qualifications = [];
  
  if (estudante.reading) {
    qualifications.push({
      id: 'reading',
      nome: 'Leitura da Bíblia',
      descricao: 'Pode fazer leitura da Bíblia (apenas homens)',
      tipo: 'parte_especial'
    });
  }
  
  if (estudante.treasures) {
    qualifications.push({
      id: 'treasures',
      nome: 'Discursos em Tesouros',
      descricao: 'Pode dar discursos na seção Tesouros (apenas homens qualificados)',
      tipo: 'discurso'
    });
  }
  
  if (estudante.gems) {
    qualifications.push({
      id: 'gems',
      nome: 'Joias Espirituais',
      descricao: 'Pode dar Joias Espirituais (apenas homens qualificados)',
      tipo: 'discurso'
    });
  }
  
  if (estudante.talk) {
    qualifications.push({
      id: 'talk',
      nome: 'Discursos Gerais',
      descricao: 'Pode dar discursos gerais (apenas homens qualificados)',
      tipo: 'discurso'
    });
  }
  
  if (estudante.explaining) {
    qualifications.push({
      id: 'explaining',
      nome: 'Explicando suas Crenças',
      descricao: 'Pode fazer demonstrações de Explicando suas Crenças',
      tipo: 'demonstracao'
    });
  }
  
  if (estudante.starting) {
    qualifications.push({
      id: 'starting',
      nome: 'Iniciando Conversas',
      descricao: 'Pode fazer demonstrações de Iniciando Conversas',
      tipo: 'demonstracao'
    });
  }
  
  if (estudante.following) {
    qualifications.push({
      id: 'following',
      nome: 'Cultivando Interesse',
      descricao: 'Pode fazer demonstrações de Cultivando Interesse',
      tipo: 'demonstracao'
    });
  }
  
  if (estudante.making) {
    qualifications.push({
      id: 'making',
      nome: 'Fazendo Discípulos',
      descricao: 'Pode fazer demonstrações de Fazendo Discípulos',
      tipo: 'demonstracao'
    });
  }
  
  if (estudante.congregation_study) {
    qualifications.push({
      id: 'congregation_study',
      nome: 'Estudo Bíblico de Congregação',
      descricao: 'Pode conduzir Estudo Bíblico de Congregação (apenas anciãos)',
      tipo: 'estudo'
    });
  }
  
  // Adicionar privilégios
  if (Array.isArray(estudante.privileges) && estudante.privileges.length > 0) {
    estudante.privileges.forEach(privilege => {
      qualifications.push({
        id: `privilege_${privilege}`,
        nome: getPrivilegeName(privilege),
        descricao: getPrivilegeDescription(privilege),
        tipo: 'privilégio'
      });
    });
  }
  
  return qualifications;
}

// Funções auxiliares para privilégios
function getPrivilegeName(privilege) {
  const names = {
    'anciao': 'Ancião',
    'elder': 'Ancião',
    'servo_ministerial': 'Servo Ministerial',
    'ministerial_servant': 'Servo Ministerial',
    'pioneiro_regular': 'Pioneiro Regular',
    'regular_pioneer': 'Pioneiro Regular',
    'pioneiro_auxiliar': 'Pioneiro Auxiliar',
    'auxiliary_pioneer': 'Pioneiro Auxiliar',
    'pioneiro_especial': 'Pioneiro Especial',
    'special_pioneer': 'Pioneiro Especial'
  };
  
  return names[privilege] || privilege;
}

function getPrivilegeDescription(privilege) {
  const descriptions = {
    'anciao': 'Privilégio de ancião na congregação',
    'elder': 'Privilégio de ancião na congregação',
    'servo_ministerial': 'Privilégio de servo ministerial',
    'ministerial_servant': 'Privilégio de servo ministerial',
    'pioneiro_regular': 'Serviço pioneiro regular',
    'regular_pioneer': 'Serviço pioneiro regular',
    'pioneiro_auxiliar': 'Serviço pioneiro auxiliar',
    'auxiliary_pioneer': 'Serviço pioneiro auxiliar',
    'pioneiro_especial': 'Serviço pioneiro especial',
    'special_pioneer': 'Serviço pioneiro especial'
  };
  
  return descriptions[privilege] || `Privilégio: ${privilege}`;
}

module.exports = router;
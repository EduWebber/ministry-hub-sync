const express = require('express');
const router = express.Router();
let mockDesignacoes = [];
let mockDesignacaoItens = [];

// Clear function to reset state
function clearMockData() {
  mockDesignacoes = [];
  mockDesignacaoItens = [];
}

// POST /api/designacoes/generate - Generate assignments (simplified)
router.post('/generate', async (req, res) => {
  try {
    const { programacao_id, congregacao_id, semana } = req.body;
    
    // Simplified mock response for frontend
    const mockAssignments = [
      {
        id: generateId(),
        parte_numero: 1,
        parte_titulo: 'Tesouros da Palavra de Deus',
        parte_tempo: 10,
        parte_tipo: 'consideracao',
        principal_estudante_id: 'est1',
        status: 'confirmada'
      },
      {
        id: generateId(),
        parte_numero: 2,
        parte_titulo: 'Joias espirituais',
        parte_tempo: 10,
        parte_tipo: 'joias',
        principal_estudante_id: 'est2',
        status: 'confirmada'
      },
      {
        id: generateId(),
        parte_numero: 3,
        parte_titulo: 'Leitura da Bíblia',
        parte_tempo: 4,
        parte_tipo: 'leitura',
        principal_estudante_id: 'est5',
        status: 'confirmada'
      },
      {
        id: generateId(),
        parte_numero: 4,
        parte_titulo: 'Iniciando conversas',
        parte_tempo: 3,
        parte_tipo: 'demonstracao',
        principal_estudante_id: 'est3',
        assistente_estudante_id: 'est4',
        status: 'confirmada'
      }
    ];

    // Create designacao record
    const designacao = {
      id: generateId(),
      programacao_id: programacao_id || 'mock-program',
      congregacao_id: congregacao_id || 'mock-congregation',
      semana: semana || '7-13 de julho 2025',
      status: 'gerada',
      created_at: new Date().toISOString()
    };
    
    // Store in mock data
    clearMockData();
    mockDesignacoes.push(designacao);
    mockDesignacaoItens.push(...mockAssignments);

    res.json({
      success: true,
      designacao,
      itens: mockAssignments,
      message: `${mockAssignments.length} designações geradas com sucesso`
    });
  } catch (error) {
    console.error('Error generating assignments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/designacoes - List assignments
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      designacoes: mockDesignacoes,
      itens: mockDesignacaoItens,
      total: mockDesignacoes.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

module.exports = router;
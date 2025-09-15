const express = require('express');
const router = express.Router();

let mockDesignacoes = [];
let mockDesignacaoItens = [];

// POST /api/designacoes/generate - Generate assignments
router.post('/generate', async (req, res) => {
  try {
    const { programacao_id, congregacao_id } = req.body;
    
    if (!programacao_id || !congregacao_id) {
      return res.status(400).json({
        success: false,
        error: 'programacao_id e congregacao_id são obrigatórios'
      });
    }

    // Mock assignment generation
    const designacao = {
      id: generateId(),
      programacao_id,
      congregacao_id,
      status: 'rascunho',
      created_at: new Date().toISOString()
    };
    
    mockDesignacoes.push(designacao);

    const mockItens = [
      {
        id: generateId(),
        designacao_id: designacao.id,
        programacao_item_id: 'item1',
        principal_estudante_id: 'est1',
        assistente_estudante_id: null,
        status: 'OK'
      }
    ];
    
    mockDesignacaoItens.push(...mockItens);

    res.json({
      success: true,
      designacao,
      itens: mockItens,
      message: 'Designações geradas com sucesso'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
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
const express = require('express');
const router = express.Router();

// Mock data for programacoes
let mockProgramacoes = [];
let mockProgramacaoItens = [];

// GET /api/programacoes - List programacoes
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      programacoes: mockProgramacoes,
      total: mockProgramacoes.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// POST /api/programacoes - Create programacao
router.post('/', async (req, res) => {
  try {
    const { week_start, week_end, items = [] } = req.body;
    
    const programacao = {
      id: generateId(),
      week_start,
      week_end,
      status: 'publicada',
      created_at: new Date().toISOString()
    };
    
    mockProgramacoes.push(programacao);
    
    const newItens = items.map((item, index) => ({
      id: generateId(),
      programacao_id: programacao.id,
      order: item.order || (index + 1),
      section: item.section || 'LIVING',
      type: item.type || 'talk',
      minutes: item.minutes || 0,
      lang: item.lang || { pt: { title: `Parte ${index + 1}` } }
    }));
    
    mockProgramacaoItens.push(...newItens);

    res.json({
      success: true,
      programacao,
      itens: newItens
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

module.exports = router;
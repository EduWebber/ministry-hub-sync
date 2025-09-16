const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// GET /api/congregacoes - Listar todas as congregações
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('congregacoes')
      .select('*')
      .order('nome');

    if (error) {
      throw new Error(`Erro ao buscar congregações: ${error.message}`);
    }

    res.json({
      success: true,
      congregacoes: data || [],
    });

  } catch (error) {
    console.error('❌ Erro ao listar congregações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

module.exports = router;
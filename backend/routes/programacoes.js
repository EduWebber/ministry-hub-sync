const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Mock data for programs
const mockPrograms = [
  {
    id: 1,
    titulo: "2-8 de dezembro de 2024",
    mes: "dezembro de 2024",
    partes: 4,
    data: "02/12/2024",
    detalhes: {
      tesouros: "Tesouros da Palavra de Deus",
      ministerio: "Seja Aperfeiçoado no Seu Ministério",
      vida: "Nossa Vida Cristã"
    }
  }
];

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

// GET /api/programacoes/pdfs - Listar PDFs disponíveis
router.get('/pdfs', async (req, res) => {
  try {
    // Importar o PDFParser
    const PDFParser = require('../services/pdfParser');
    const pdfParser = new PDFParser();
    
    // Escanear a pasta oficial em busca de PDFs
    const pdfs = await pdfParser.scanOfficialDirectory();
    
    res.json({
      success: true,
      pdfs: pdfs,
      total: pdfs.length
    });
  } catch (error) {
    console.error('❌ Erro ao listar PDFs:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

module.exports = router;
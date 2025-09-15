const express = require('express');
const router = express.Router();
const MWBParser = require('../services/mwbParser');

// Mock data for programacoes
let mockProgramacoes = [];
let mockProgramacaoItens = [];

// Initialize MWB Parser
const mwbParser = new MWBParser();

// GET /api/programacoes/mock - Mock week data using MWB Parser
router.get('/mock', async (req, res) => {
  try {
    const { semana, mes, ano } = req.query;
    
    if (semana) {
      // Get specific week program
      const program = mwbParser.getProgramForWeek(semana);
      if (program) {
        res.json({
          semana: program.semana,
          data_inicio: program.data_inicio,
          partes: program.partes,
          pdf_source: program.pdf_source
        });
      } else {
        res.status(404).json({ success: false, error: 'Semana não encontrada' });
      }
    } else if (mes && ano) {
      // Get all programs for month
      const programs = mwbParser.getProgramsForMonth(ano, mes);
      res.json({ programs });
    } else {
      // Default: current week
      const program = mwbParser.getProgramForWeek('2024-12-02');
      res.json({
        semana: program.semana,
        data_inicio: program.data_inicio,
        partes: program.partes,
        pdf_source: program.pdf_source
      });
    }
  } catch (error) {
    console.error('Error in /mock route:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/programacoes/pdfs - List available PDFs
router.get('/pdfs', async (req, res) => {
  try {
    const availablePDFs = mwbParser.getAvailablePDFs();
    res.json({
      success: true,
      pdfs: availablePDFs,
      total: availablePDFs.portuguese.length + availablePDFs.english.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

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
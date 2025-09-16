const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { supabase } = require('../config/supabase');

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

// POST /api/programacoes/parse-pdf - Parse and save a PDF
router.post('/parse-pdf', async (req, res) => {
  try {
    const { pdfPath } = req.body;
    
    if (!pdfPath) {
      return res.status(400).json({
        success: false,
        error: 'Caminho do PDF é obrigatório'
      });
    }

    // Verificar se o arquivo existe
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        success: false,
        error: 'Arquivo PDF não encontrado'
      });
    }

    // Importar o PDFParser
    const PDFParser = require('../services/pdfParser');
    const pdfParser = new PDFParser();
    
    // Parsear o PDF
    const programData = await pdfParser.parsePDFContent(pdfPath);
    
    // Salvar no banco de dados
    const savedProgram = await saveProgramToDatabase(programData);
    
    res.json({
      success: true,
      message: 'PDF processado e salvo com sucesso',
      program: savedProgram
    });
  } catch (error) {
    console.error('❌ Erro ao processar PDF:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Função para salvar programa no banco de dados
async function saveProgramToDatabase(programData) {
  try {
    const programas = [];
    
    for (const week of programData.weeks) {
      // Criar programa ministerial
      const { data: programa, error: programaError } = await supabase
        .from('programas_ministeriais')
        .insert({
          periodo: programData.period,
          semana: week.week,
          tema: week.theme,
          pdf_url: programData.metadata.sourceFile,
          pdf_filename: programData.metadata.sourceFile,
          publicado: true
        })
        .select()
        .single();

      if (programaError) {
        throw new Error(`Erro ao salvar programa: ${programaError.message}`);
      }

      // Criar partes do programa
      const partes = [];
      for (const part of week.parts) {
        const { data: parte, error: parteError } = await supabase
          .from('partes')
          .insert({
            programa_id: programa.id,
            secao: part.section,
            titulo: part.title,
            tipo: part.type,
            duracao: part.duration,
            referencias: part.references,
            genero_requerido: part.gender === 'male' ? 'masculino' : 'ambos',
            ordem: part.order,
            observacoes: part.notes
          })
          .select()
          .single();

        if (parteError) {
          throw new Error(`Erro ao salvar parte: ${parteError.message}`);
        }

        partes.push(parte);
      }

      programas.push({
        ...programa,
        partes: partes
      });
    }

    return {
      period: programData.period,
      semanas: programas,
      metadata: programData.metadata
    };
  } catch (error) {
    console.error('❌ Erro ao salvar programa no banco:', error);
    throw error;
  }
}

// GET /api/programacoes/json-files - Listar arquivos JSON de programações
router.get('/json-files', async (req, res) => {
  try {
    const jsonPath = path.join(__dirname, '../../docs/Oficial/programacoes-json');
    
    if (!fs.existsSync(jsonPath)) {
      return res.json({
        success: true,
        programas: [],
        message: 'Pasta de programações JSON não encontrada'
      });
    }
    
    const files = fs.readdirSync(jsonPath).filter(file => file.endsWith('.json'));
    const programas = [];
    
    for (const file of files) {
      try {
        const filePath = path.join(jsonPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(content);
        
        // Se é um array, adicionar todos os itens
        if (Array.isArray(jsonData)) {
          programas.push(...jsonData);
        } else {
          // Se é um objeto único, adicionar como item
          programas.push(jsonData);
        }
      } catch (fileError) {
        console.warn(`⚠️ Erro ao processar arquivo ${file}:`, fileError.message);
      }
    }
    
    console.log(`✅ Carregados ${programas.length} programas de ${files.length} arquivos JSON`);
    
    res.json({
      success: true,
      programas: programas,
      total: programas.length,
      files: files.length
    });
    
  } catch (error) {
    console.error('❌ Erro ao carregar arquivos JSON:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const JWDownloader = require('../services/jwDownloader');
const ProgramGenerator = require('../services/programGenerator');
const MaterialManager = require('../services/materialManager');
const PDFParser = require('../services/pdfParser');

// Instanciar serviços
const jwDownloader = new JWDownloader();
const programGenerator = new ProgramGenerator();
const materialManager = new MaterialManager();
const pdfParser = new PDFParser();

// Middleware de autenticação (simplificado para desenvolvimento)
const requireAuth = (req, res, next) => {
  // Em produção, implementar JWT validation
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticação necessário' });
  }
  next();
};

// =====================================================
// ROTAS DE STATUS E SISTEMA
// =====================================================

// Status geral do sistema
router.get('/status', requireAuth, async (req, res) => {
  try {
    const status = {
      system: 'online',
      timestamp: new Date().toISOString(),
      services: {
        jwDownloader: 'active',
        programGenerator: 'active',
        materialManager: 'active'
      },
      storage: await materialManager.getStorageInfo(),
      lastSync: await materialManager.getLastSyncInfo()
    };

    res.json(status);
  } catch (error) {
    console.error('❌ Erro ao obter status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// =====================================================
// ROTAS DE DOWNLOAD DE MATERIAIS
// =====================================================

// Verificar atualizações disponíveis
router.post('/check-updates', requireAuth, async (req, res) => {
  try {
    console.log('🔍 Verificando atualizações...');
    
    const results = await jwDownloader.checkAndDownloadAll();
    
    res.json({
      success: true,
      message: 'Verificação concluída',
      results
    });
  } catch (error) {
    console.error('❌ Erro ao verificar atualizações:', error);
    res.status(500).json({ 
      error: 'Erro ao verificar atualizações',
      details: error.message 
    });
  }
});

// Baixar material específico por URL
router.post('/download-material', requireAuth, async (req, res) => {
  try {
    const { url, language } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL é obrigatória' });
    }

    console.log(`📥 Baixando material: ${url}`);
    const result = await jwDownloader.downloadByUrl(url, language || 'pt-BR');
    
    res.json({
      success: true,
      message: 'Material baixado com sucesso',
      material: result
    });
  } catch (error) {
    console.error('❌ Erro ao baixar material:', error);
    res.status(500).json({ 
      error: 'Erro ao baixar material',
      details: error.message 
    });
  }
});

// Listar materiais baixados
router.get('/materials', requireAuth, async (req, res) => {
  try {
    const materials = await jwDownloader.listDownloadedMaterials();
    
    res.json({
      success: true,
      materials,
      total: materials.length
    });
  } catch (error) {
    console.error('❌ Erro ao listar materiais:', error);
    res.status(500).json({ 
      error: 'Erro ao listar materiais',
      details: error.message 
    });
  }
});

// =====================================================
// ROTAS DE GERAÇÃO DE PROGRAMAS
// =====================================================

// Gerar programa baseado em material
router.post('/generate-program', requireAuth, async (req, res) => {
  try {
    const { materialId, materialInfo } = req.body;
    
    if (!materialInfo && !materialId) {
      return res.status(400).json({ error: 'Informações do material são obrigatórias' });
    }

    let material;
    if (materialId) {
      // Buscar material por ID
      const materials = await jwDownloader.listDownloadedMaterials();
      material = materials.find(m => m.filename === materialId);
      if (!material) {
        return res.status(404).json({ error: 'Material não encontrado' });
      }
    } else {
      material = materialInfo;
    }

    console.log(`📋 Gerando programa para: ${material.filename}`);
    const program = await programGenerator.generateWeeklyProgram(material);
    
    res.json({
      success: true,
      message: 'Programa gerado com sucesso',
      program
    });
  } catch (error) {
    console.error('❌ Erro ao gerar programa:', error);
    res.status(500).json({ 
      error: 'Erro ao gerar programa',
      details: error.message 
    });
  }
});

// Publicar programa
router.post('/publish-program/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`📢 Publicando programa: ${id}`);
    const program = await programGenerator.publishProgram(id);
    
    res.json({
      success: true,
      message: 'Programa publicado com sucesso',
      program
    });
  } catch (error) {
    console.error('❌ Erro ao publicar programa:', error);
    res.status(500).json({ 
      error: 'Erro ao publicar programa',
      details: error.message 
    });
  }
});

// Listar programas
router.get('/programs', requireAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const programs = await programGenerator.listPrograms(status);
    
    res.json({
      success: true,
      programs,
      total: programs.length
    });
  } catch (error) {
    console.error('❌ Erro ao listar programas:', error);
    res.status(500).json({ 
      error: 'Erro ao listar programas',
      details: error.message 
    });
  }
});

// =====================================================
// ROTAS DE CONFIGURAÇÃO
// =====================================================

// Obter configurações de download
router.get('/download-config', requireAuth, async (req, res) => {
  try {
    const mwbSources = require('../config/mwbSources.json');
    
    res.json({
      success: true,
      config: mwbSources
    });
  } catch (error) {
    console.error('❌ Erro ao obter configurações:', error);
    res.status(500).json({ 
      error: 'Erro ao obter configurações',
      details: error.message 
    });
  }
});

// Atualizar configurações de download
router.put('/download-config', requireAuth, async (req, res) => {
  try {
    const { config } = req.body;
    
    if (!config) {
      return res.status(400).json({ error: 'Configuração é obrigatória' });
    }

    // Em produção, validar e salvar no banco
    console.log('⚙️ Atualizando configurações de download');
    
    res.json({
      success: true,
      message: 'Configurações atualizadas com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar configurações:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar configurações',
      details: error.message 
    });
  }
});

// =====================================================
// ROTAS DE MANUTENÇÃO
// =====================================================

// Limpar materiais antigos
router.post('/cleanup-materials', requireAuth, async (req, res) => {
  try {
    const { daysToKeep } = req.body;
    
    console.log(`🗑️ Limpando materiais antigos (mais de ${daysToKeep || 90} dias)`);
    const result = await jwDownloader.cleanupOldMaterials(daysToKeep);
    
    res.json({
      success: true,
      message: 'Limpeza concluída com sucesso',
      result
    });
  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
    res.status(500).json({ 
      error: 'Erro na limpeza',
      details: error.message 
    });
  }
});

// Verificar saúde do sistema
router.get('/health', requireAuth, async (req, res) => {
  try {
    const health = await materialManager.checkSystemHealth();
    
    res.json({
      success: true,
      health
    });
  } catch (error) {
    console.error('❌ Erro no health check:', error);
    res.status(500).json({ 
      error: 'Erro no health check',
      details: error.message 
    });
  }
});

// =====================================================
// ROTAS DE TESTE (desenvolvimento)
// =====================================================

// Gerar programa de teste
router.post('/test/generate-program', requireAuth, async (req, res) => {
  try {
    console.log('🧪 Gerando programa de teste...');
    const program = await programGenerator.generateTestProgram();
    
    res.json({
      success: true,
      message: 'Programa de teste gerado com sucesso',
      program
    });
  } catch (error) {
    console.error('❌ Erro ao gerar programa de teste:', error);
    res.status(500).json({ 
      error: 'Erro ao gerar programa de teste',
      details: error.message 
    });
  }
});

// Testar download de material
router.post('/test/download', requireAuth, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL é obrigatória' });
    }

    console.log('🧪 Testando download...');
    const result = await jwDownloader.downloadByUrl(url, 'pt-BR');
    
    res.json({
      success: true,
      message: 'Teste de download concluído',
      result
    });
  } catch (error) {
    console.error('❌ Erro no teste de download:', error);
    res.status(500).json({ 
      error: 'Erro no teste de download',
      details: error.message 
    });
  }
});

// =====================================================
// ROTAS DE PDF PARSING
// =====================================================

// Escanear PDFs na pasta oficial
router.get('/scan-pdfs', requireAuth, async (req, res) => {
  try {
    console.log('🔍 Escaneando PDFs na pasta oficial...');
    const pdfs = await pdfParser.scanOfficialDirectory();
    
    res.json({
      success: true,
      message: 'PDFs escaneados com sucesso',
      pdfs,
      total: pdfs.length
    });
  } catch (error) {
    console.error('❌ Erro ao escanear PDFs:', error);
    res.status(500).json({ 
      error: 'Erro ao escanear PDFs',
      details: error.message 
    });
  }
});

// Extrair programação de um PDF específico
router.post('/parse-pdf', requireAuth, async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'Caminho do arquivo é obrigatório' });
    }

    console.log('📖 Extraindo programação do PDF:', filePath);
    const programming = await pdfParser.parsePDFContent(filePath);
    
    res.json({
      success: true,
      message: 'Programação extraída com sucesso',
      programming
    });
  } catch (error) {
    console.error('❌ Erro ao extrair programação:', error);
    res.status(500).json({ 
      error: 'Erro ao extrair programação',
      details: error.message 
    });
  }
});

// Validar PDF específico
router.post('/validate-pdf', requireAuth, async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'Caminho do arquivo é obrigatório' });
    }

    console.log('✅ Validando PDF:', filePath);
    const isValid = await pdfParser.validatePDF(filePath);
    
    res.json({
      success: true,
      message: 'PDF validado com sucesso',
      isValid,
      filePath
    });
  } catch (error) {
    console.error('❌ Erro ao validar PDF:', error);
    res.status(500).json({ 
      error: 'Erro ao validar PDF',
      details: error.message 
    });
  }
});

// Salvar programação extraída
router.post('/save-programming', requireAuth, async (req, res) => {
  try {
    const { programming } = req.body;
    
    if (!programming) {
      return res.status(400).json({ error: 'Dados de programação são obrigatórios' });
    }

    console.log('💾 Salvando programação extraída...');
    
    // TODO: Implementar salvamento no banco de dados
    // Por enquanto, apenas simular salvamento
    const savedProgramming = {
      ...programming,
      id: `prog_${Date.now()}`,
      savedAt: new Date().toISOString(),
      status: 'draft'
    };
    
    res.json({
      success: true,
      message: 'Programação salva com sucesso',
      programming: savedProgramming
    });
  } catch (error) {
    console.error('❌ Erro ao salvar programação:', error);
    res.status(500).json({ 
      error: 'Erro ao salvar programação',
      details: error.message 
    });
  }
});

// Listar programações salvas
router.get('/programmings', requireAuth, async (req, res) => {
  try {
    const { status } = req.query;
    
    console.log('📋 Listando programações salvas...');
    
    // TODO: Implementar busca no banco de dados
    // Por enquanto, retornar lista vazia
    const programmings = [];
    
    res.json({
      success: true,
      message: 'Programações listadas com sucesso',
      programmings,
      total: programmings.length
    });
  } catch (error) {
    console.error('❌ Erro ao listar programações:', error);
    res.status(500).json({ 
      error: 'Erro ao listar programações',
      details: error.message 
    });
  }
});

// =====================================================
// ROTAS PARA BUCKET PORTUGUESMEET - SISTEMA MINISTERIAL
// =====================================================

// Listar PDFs disponíveis no bucket portuguesmeet
router.get('/pdfs/list', requireAuth, async (req, res) => {
  try {
    console.log('📋 Listando PDFs do bucket portuguesmeet...');
    
    const { data: files, error } = await supabase.storage
      .from('portuguesmeet')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      throw new Error(`Erro ao listar arquivos: ${error.message}`);
    }

    // Filtrar apenas PDFs
    const pdfFiles = files
      .filter(file => file.name.toLowerCase().endsWith('.pdf'))
      .map(file => ({
        name: file.name,
        size: file.metadata?.size || 0,
        created_at: file.created_at,
        updated_at: file.updated_at,
        download_url: `${process.env.SUPABASE_URL}/storage/v1/object/public/portuguesmeet/${file.name}`
      }));

    res.json({
      success: true,
      message: `${pdfFiles.length} PDFs encontrados`,
      pdfs: pdfFiles,
      total: pdfFiles.length
    });

  } catch (error) {
    console.error('❌ Erro ao listar PDFs:', error);
    res.status(500).json({ 
      error: 'Erro ao listar PDFs do bucket',
      details: error.message 
    });
  }
});

// Processar PDF específico e salvar no banco
router.post('/pdfs/process', requireAuth, async (req, res) => {
  try {
    const { filename, congregacao_id } = req.body;
    
    if (!filename) {
      return res.status(400).json({ error: 'Nome do arquivo é obrigatório' });
    }

    console.log(`📖 Processando PDF: ${filename}`);
    
    // 1. Fazer download do PDF do bucket
    const { data: pdfData, error: downloadError } = await supabase.storage
      .from('portuguesmeet')
      .download(filename);

    if (downloadError) {
      throw new Error(`Erro ao baixar PDF: ${downloadError.message}`);
    }

    // 2. Converter para buffer e parsear conteúdo
    const pdfBuffer = Buffer.from(await pdfData.arrayBuffer());
    const programming = await pdfParser.parsePDFBuffer(pdfBuffer);
    
    if (!programming || !programming.weeks || programming.weeks.length === 0) {
      throw new Error('Não foi possível extrair programação do PDF');
    }

    console.log(`📊 Extraídas ${programming.weeks.length} semanas do PDF`);

    // 3. Salvar cada semana no banco de dados
    const savedPrograms = [];
    
    for (const week of programming.weeks) {
      // 3a. Criar programa ministerial
      const { data: programa, error: programError } = await supabase
        .from('programas_ministeriais')
        .insert({
          periodo: programming.period || 'Período não identificado',
          semana: week.week,
          tema: week.theme,
          pdf_url: `${process.env.SUPABASE_URL}/storage/v1/object/public/portuguesmeet/${filename}`,
          pdf_filename: filename,
          publicado: false,
          congregacao_id: congregacao_id || null
        })
        .select()
        .single();

      if (programError) {
        console.error('❌ Erro ao salvar programa:', programError);
        continue;
      }

      console.log(`✅ Programa salvo: ${programa.semana}`);

      // 3b. Salvar partes da semana
      if (week.parts && week.parts.length > 0) {
        const partsToInsert = week.parts.map((part, index) => ({
          programa_id: programa.id,
          secao: mapSecao(part.section),
          titulo: part.title,
          tipo: mapTipoParte(part.type),
          duracao: part.duration || 0,
          referencias: part.references || {},
          genero_requerido: mapGenero(part.gender),
          ordem: index + 1,
          observacoes: part.notes
        }));

        const { data: partes, error: partesError } = await supabase
          .from('partes')
          .insert(partsToInsert)
          .select();

        if (partesError) {
          console.error('❌ Erro ao salvar partes:', partesError);
        } else {
          console.log(`✅ ${partes.length} partes salvas para ${programa.semana}`);
        }
      }

      savedPrograms.push({
        ...programa,
        parts_count: week.parts?.length || 0
      });
    }

    res.json({
      success: true,
      message: `PDF processado com sucesso! ${savedPrograms.length} programas salvos.`,
      processed_file: filename,
      programs: savedPrograms,
      total_programs: savedPrograms.length
    });

  } catch (error) {
    console.error('❌ Erro ao processar PDF:', error);
    res.status(500).json({ 
      error: 'Erro ao processar PDF',
      details: error.message 
    });
  }
});

// Publicar programa para congregações
router.post('/programs/:id/publish', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`📢 Publicando programa: ${id}`);
    
    const { data: programa, error } = await supabase
      .from('programas_ministeriais')
      .update({ publicado: true })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao publicar programa: ${error.message}`);
    }

    res.json({
      success: true,
      message: 'Programa publicado com sucesso',
      program: programa
    });

  } catch (error) {
    console.error('❌ Erro ao publicar programa:', error);
    res.status(500).json({ 
      error: 'Erro ao publicar programa',
      details: error.message 
    });
  }
});

// Listar programas salvos (com filtros)
router.get('/programs', requireAuth, async (req, res) => {
  try {
    const { status, congregacao_id, periodo } = req.query;
    
    let query = supabase
      .from('programas_ministeriais')
      .select(`
        *,
        partes:partes(
          id, secao, titulo, tipo, duracao, genero_requerido, ordem
        )
      `)
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (status === 'published') {
      query = query.eq('publicado', true);
    } else if (status === 'draft') {
      query = query.eq('publicado', false);
    }

    if (congregacao_id) {
      query = query.or(`congregacao_id.eq.${congregacao_id},congregacao_id.is.null`);
    }

    if (periodo) {
      query = query.ilike('periodo', `%${periodo}%`);
    }

    const { data: programs, error } = await query;

    if (error) {
      throw new Error(`Erro ao listar programas: ${error.message}`);
    }

    res.json({
      success: true,
      programs,
      total: programs.length,
      message: `${programs.length} programas encontrados`
    });

  } catch (error) {
    console.error('❌ Erro ao listar programas:', error);
    res.status(500).json({ 
      error: 'Erro ao listar programas',
      details: error.message 
    });
  }
});

// Listar congregações
router.get('/congregations', requireAuth, async (req, res) => {
  try {
    const { data: congregacoes, error } = await supabase
      .from('congregacoes')
      .select('*')
      .order('nome');

    if (error) {
      throw new Error(`Erro ao listar congregações: ${error.message}`);
    }

    res.json({
      success: true,
      congregations: congregacoes,
      total: congregacoes.length
    });

  } catch (error) {
    console.error('❌ Erro ao listar congregações:', error);
    res.status(500).json({ 
      error: 'Erro ao listar congregações',
      details: error.message 
    });
  }
});

// =====================================================
// FUNÇÕES HELPER PARA MAPEAMENTO
// =====================================================

function mapSecao(section) {
  const sectionMap = {
    'treasures': 'Tesouros da Palavra de Deus',
    'ministry': 'Ministério',
    'living': 'Vida Cristã',
    'tesouros': 'Tesouros da Palavra de Deus',
    'ministerio': 'Ministério',  
    'vida': 'Vida Cristã'
  };
  
  return sectionMap[section?.toLowerCase()] || 'Vida Cristã';
}

function mapTipoParte(type) {
  const typeMap = {
    'talk': 'discurso_tesouros',
    'gems': 'joias_espirituais',
    'reading': 'leitura_biblica',
    'initial': 'apresentacao_inicial',
    'return_visit': 'revisita',
    'bible_study': 'estudo_biblico',
    'living_talk': 'discurso_vida',
    'congregation_study': 'estudo_congregacao',
    'song_comments': 'comentarios_cantarel',
    'prayer': 'oracao_final'
  };
  
  return typeMap[type?.toLowerCase()] || 'discurso_vida';
}

function mapGenero(gender) {
  const genderMap = {
    'male': 'masculino',
    'female': 'feminino',
    'both': 'ambos',
    'm': 'masculino',
    'f': 'feminino',
    'all': 'ambos'
  };
  
  return genderMap[gender?.toLowerCase()] || 'ambos';
}

module.exports = router;

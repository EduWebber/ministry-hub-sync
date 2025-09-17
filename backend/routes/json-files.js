const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

// GET /api/programacoes/json-files - Lista e retorna programas em JSON
router.get('/', async (req, res) => {
  try {
    console.log('📁 Requisição para listar arquivos JSON de programação');
    
    const jsonDir = path.join(__dirname, '../../docs/Oficial/programacoes-json');
    
    // Verificar se o diretório existe
    try {
      await fs.access(jsonDir);
    } catch (error) {
      console.log('📁 Diretório não encontrado, criando...');
      await fs.mkdir(jsonDir, { recursive: true });
      return res.json({ programas: [], message: 'Nenhum programa encontrado. Diretório criado.' });
    }

    // Listar arquivos JSON
    const files = await fs.readdir(jsonDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      return res.json({ programas: [], message: 'Nenhum programa JSON encontrado' });
    }

    console.log(`📁 Encontrados ${jsonFiles.length} arquivos: ${jsonFiles.join(', ')}`);

    // Ler e consolidar todos os programas
    const programas = [];
    
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(jsonDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(content);
        
        // Se data é array, adicionar todos os itens
        if (Array.isArray(data)) {
          programas.push(...data);
        } else {
          // Se é objeto único, adicionar como item
          programas.push(data);
        }
        
        console.log(`✅ Arquivo ${file} carregado com sucesso`);
      } catch (error) {
        console.error(`❌ Erro ao ler arquivo ${file}:`, error);
      }
    }

    console.log(`📊 Total de programas carregados: ${programas.length}`);

    res.json({ 
      programas,
      total: programas.length,
      arquivos: jsonFiles
    });
    
  } catch (error) {
    console.error('❌ Erro ao listar programas JSON:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor', 
      details: error.message 
    });
  }
});

module.exports = router;
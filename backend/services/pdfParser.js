const fs = require('fs-extra');
const path = require('path');
const pdfParse = require('pdf-parse');

/**
 * PDF Parser Service para extrair programações MWB
 * Responsável por escanear pasta oficial e extrair dados estruturados
 */
class PDFParser {
  constructor() {
    this.officialPath = path.join(__dirname, '../../docs/Oficial');
    this.supportedLanguages = ['pt', 'en'];
    this.mwbPattern = /mwb_[ET]_(\d{6})\.pdf/i;
  }

  /**
   * Escaneia a pasta oficial em busca de PDFs MWB
   * @returns {Promise<Array>} Lista de PDFs encontrados
   */
  async scanOfficialDirectory() {
    try {
      console.log('🔍 Escaneando pasta oficial:', this.officialPath);
      
      // Verificar se a pasta existe
      if (!await fs.pathExists(this.officialPath)) {
        console.log('⚠️ Pasta oficial não encontrada:', this.officialPath);
        return [];
      }

      // Scan recursively for PDF files
      const pdfFiles = await this.scanForPDFs(this.officialPath);
      
      console.log(`📄 Encontrados ${pdfFiles.length} arquivos PDF`);
      
      const pdfMetadata = await Promise.all(
        pdfFiles.map(file => this.extractPDFMetadata(file))
      );

      // Filtrar apenas PDFs MWB válidos
      const validMWBs = pdfMetadata.filter(pdf => pdf.isValid);
      
      console.log(`✅ ${validMWBs.length} PDFs MWB válidos encontrados`);
      
      return validMWBs;
    } catch (error) {
      console.error('❌ Erro ao escanear pasta oficial:', error);
      throw new Error(`Falha ao escanear pasta oficial: ${error.message}`);
    }
  }

  /**
   * Scan recursively for PDF files in a directory
   * @param {string} dirPath Directory path to scan
   * @returns {Promise<Array>} List of PDF file paths
   */
  async scanForPDFs(dirPath) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const pdfFiles = [];
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          const subDirPDFs = await this.scanForPDFs(fullPath);
          pdfFiles.push(...subDirPDFs);
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
          // Add PDF files to the list
          pdfFiles.push(fullPath);
        }
      }
      
      return pdfFiles;
    } catch (error) {
      console.error(`❌ Erro ao escanear diretório ${dirPath}:`, error);
      return [];
    }
  }

  /**
   * Extrai metadados de um arquivo PDF
   * @param {string} filePath Caminho completo do arquivo
   * @returns {Promise<Object>} Metadados do PDF
   */
  async extractPDFMetadata(filePath) {
    try {
      const fileName = path.basename(filePath);
      const stats = await fs.stat(filePath);
      
      // Verificar se é um PDF MWB válido
      const mwbMatch = fileName.match(this.mwbPattern);
      if (!mwbMatch) {
        return {
          fileName,
          filePath,
          size: stats.size,
          lastModified: stats.mtime,
          isValid: false,
          reason: 'Não é um PDF MWB válido'
        };
      }

      // Extrair informações do nome do arquivo
      const [, dateCode] = mwbMatch;
      const year = parseInt(dateCode.substring(0, 4));
      const month = parseInt(dateCode.substring(4, 6));
      const language = fileName.includes('_E_') ? 'en' : 'pt';

      return {
        fileName,
        filePath,
        size: stats.size,
        lastModified: stats.mtime,
        language,
        year,
        month,
        isValid: true,
        dateCode
      };
    } catch (error) {
      console.error(`❌ Erro ao extrair metadados de ${filePath}:`, error);
      return {
        fileName: path.basename(filePath),
        filePath,
        size: 0,
        lastModified: new Date(),
        isValid: false,
        reason: `Erro ao processar: ${error.message}`
      };
    }
  }

  /**
   * Extrai conteúdo de programação de um PDF específico
   * @param {string} filePath Caminho para o arquivo PDF
   * @returns {Promise<Object>} Dados de programação extraídos
   */
  async parsePDFContent(filePath) {
    try {
      console.log('📖 Extraindo conteúdo do PDF:', path.basename(filePath));
      
      const pdfBuffer = await fs.readFile(filePath);
      const pdfData = await pdfParse(pdfBuffer);
      
      console.log(`📄 PDF carregado: ${pdfData.numpages} páginas, ${pdfData.text.length} caracteres`);
      
      const programmingData = this.extractProgrammingStructure(pdfData.text, filePath);
      
      console.log(`✅ Programação extraída: ${programmingData.weeks.length} semanas`);
      
      return programmingData;
    } catch (error) {
      console.error('❌ Erro ao extrair conteúdo do PDF:', error);
      throw new Error(`Falha ao extrair programação: ${error.message}`);
    }
  }

  /**
   * Extrai conteúdo de programação de um buffer PDF (para Supabase Storage)
   * @param {Buffer} pdfBuffer Buffer do arquivo PDF
   * @returns {Promise<Object>} Dados de programação extraídos
   */
  async parsePDFBuffer(pdfBuffer) {
    try {
      console.log('📖 Extraindo conteúdo do PDF buffer...');
      
      const pdfData = await pdfParse(pdfBuffer);
      
      console.log(`📄 PDF carregado: ${pdfData.numpages} páginas, ${pdfData.text.length} caracteres`);
      
      const programmingData = this.extractProgrammingStructure(pdfData.text, 'buffer');
      
      console.log(`✅ Programação extraída: ${programmingData.weeks.length} semanas`);
      
      return programmingData;
    } catch (error) {
      console.error('❌ Erro ao extrair conteúdo do PDF buffer:', error);
      throw new Error(`Falha ao extrair programação: ${error.message}`);
    }
  }

  /**
   * Extrai estrutura de programação do texto do PDF
   * @param {string} text Texto extraído do PDF
   * @param {string} filePath Caminho do arquivo
   * @returns {Object} Dados estruturados da programação
   */
  extractProgrammingStructure(text, filePath) {
    try {
      const fileName = path.basename(filePath);
      const language = this.detectLanguage(text);
      
      // Extrair período/mês da programação
      const period = this.extractPeriod(text, language);
      
      // Extrair semanas da programação
      const rawWeeks = this.extractWeeks(text, language);
      
      // Estruturar cada semana com suas partes
      const structuredWeeks = rawWeeks.map(week => {
        const sections = this.extractSections(text, week, language);
        
        // Converter seções para partes planas
        const parts = [];
        let partOrder = 1;
        
        Object.keys(sections).forEach(sectionKey => {
          sections[sectionKey].forEach(part => {
            parts.push({
              section: this.mapSectionToStandard(sectionKey),
              title: part.title,
              type: part.type,
              duration: part.duration,
              gender: this.mapGenderFromRequirements(part.requirements),
              references: this.extractReferences(text, part.title),
              notes: part.notes,
              order: partOrder++,
              s38_rules: this.extractS38Rules(part, sectionKey)
            });
          });
        });
        
        return {
          week: week.startDate && week.endDate ? 
            `${week.startDate} - ${week.endDate}` : 
            `${week.title}`,
          theme: this.extractWeekTheme(text, week, language),
          parts: parts
        };
      });

      return {
        period: period,
        weeks: structuredWeeks,
        metadata: {
          sourceFile: fileName,
          language,
          extractedAt: new Date(),
          version: '1.0',
          totalWeeks: structuredWeeks.length
        }
      };
    } catch (error) {
      console.error('❌ Erro ao estruturar programação:', error);
      throw new Error(`Falha ao estruturar dados: ${error.message}`);
    }
  }

  /**
   * Extrai regras S-38 para uma parte específica
   * @param {Object} part Parte da programação
   * @param {string} sectionKey Seção da parte
   * @returns {Object} Regras S-38 aplicáveis
   */
  extractS38Rules(part, sectionKey) {
    const rules = {};
    
    // Regras baseadas no tipo de parte
    switch (part.type) {
      case 'bible_reading':
        rules.gender = 'male_only';
        rules.assistant_required = false;
        rules.introduction_allowed = false;
        rules.conclusion_allowed = false;
        break;
        
      case 'starting':
      case 'following':
      case 'making_disciples':
        rules.gender = 'both';
        rules.assistant_required = true;
        rules.assistant_gender = 'same_or_family';
        break;
        
      case 'talk':
        rules.gender = 'male_only';
        rules.assistant_required = false;
        rules.qualification_required = true;
        break;
        
      case 'spiritual_gems':
        rules.gender = 'male_only';
        rules.assistant_required = false;
        rules.qualification_required = true;
        break;
        
      case 'treasures':
        rules.gender = 'male_only';
        rules.assistant_required = false;
        rules.qualification_required = true;
        break;
        
      case 'congregation_study':
        rules.gender = 'male_only';
        rules.assistant_required = false;
        rules.qualification_required = 'elder';
        break;
        
      default:
        rules.gender = 'both';
        rules.assistant_required = false;
    }
    
    return rules;
  }

  /**
   * Extrai período da programação (mês/ano)
   * @param {string} text Texto do PDF
   * @param {string} language Idioma
   * @returns {string} Período identificado
   */
  extractPeriod(text, language) {
    const monthPatterns = {
      en: {
        january: 'January', february: 'February', march: 'March', april: 'April',
        may: 'May', june: 'June', july: 'July', august: 'August',
        september: 'September', october: 'October', november: 'November', december: 'December'
      },
      pt: {
        janeiro: 'Janeiro', fevereiro: 'Fevereiro', março: 'Março', abril: 'Abril',
        maio: 'Maio', junho: 'Junho', julho: 'Julho', agosto: 'Agosto',
        setembro: 'Setembro', outubro: 'Outubro', novembro: 'Novembro', dezembro: 'Dezembro'
      }
    };

    const months = monthPatterns[language] || monthPatterns.pt;
    const currentYear = new Date().getFullYear();
    
    for (const [key, value] of Object.entries(months)) {
      if (text.toLowerCase().includes(key.toLowerCase())) {
        return `${value} ${currentYear}`;
      }
    }
    
    return `Período ${currentYear}`;
  }

  /**
   * Extrai tema da semana específica
   * @param {string} text Texto do PDF
   * @param {Object} week Dados da semana
   * @param {string} language Idioma
   * @returns {string} Tema da semana
   */
  extractWeekTheme(text, week, language) {
    // Padrões para identificar temas semanais
    const themePatterns = {
      pt: [
        /tema\s*da\s*semana[:\s]*([^\n\r]+)/gi,
        /título[:\s]*([^\n\r]+)/gi,
        /assunto[:\s]*([^\n\r]+)/gi
      ],
      en: [
        /weekly\s*theme[:\s]*([^\n\r]+)/gi,
        /title[:\s]*([^\n\r]+)/gi,
        /subject[:\s]*([^\n\r]+)/gi
      ]
    };

    const patterns = themePatterns[language] || themePatterns.pt;
    
    for (const pattern of patterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        return matches[0][1].trim();
      }
    }
    
    // Tema padrão se não encontrar
    return language === 'pt' ? 
      'Sirva a Jeová com coração completo' : 
      'Serve Jehovah with a Complete Heart';
  }

  /**
   * Mapeia seção para formato padrão
   * @param {string} sectionKey Chave da seção
   * @returns {string} Seção padronizada
   */
  mapSectionToStandard(sectionKey) {
    const sectionMap = {
      opening: 'treasures',
      treasures: 'treasures', 
      ministry: 'ministry',
      living: 'living',
      closing: 'living'
    };
    
    return sectionMap[sectionKey] || 'living';
  }

  /**
   * Mapeia gênero baseado em requisitos
   * @param {Object} requirements Requisitos da parte
   * @returns {string} Gênero mapeado
   */
  mapGenderFromRequirements(requirements) {
    if (requirements?.requires_male || requirements?.elders_only) {
      return 'male';
    }
    return 'both';
  }

  /**
   * Extrai referências bíblicas de uma parte
   * @param {string} text Texto do PDF
   * @param {string} partTitle Título da parte
   * @returns {Object} Referências encontradas
   */
  extractReferences(text, partTitle) {
    const references = {
      biblical: [],
      wol: []
    };
    
    // Padrões para referências bíblicas
    const biblicalPattern = /(\d*\s*[A-Za-z]+\s+\d+[:]\d+(?:-\d+)?)/g;
    const matches = [...text.matchAll(biblicalPattern)];
    
    matches.forEach(match => {
      const ref = match[1].trim();
      if (ref.length > 3) {
        references.biblical.push(ref);
      }
    });
    
    // Remover duplicatas
    references.biblical = [...new Set(references.biblical)];
    
    return references;
  }

  /**
   * Detecta o idioma do conteúdo
   * @param {string} text Texto para análise
   * @returns {string} Idioma detectado
   */
  detectLanguage(text) {
    const englishIndicators = [
      'meeting workbook', 'opening comments', 'spiritual gems', 
      'bible reading', 'starting a conversation', 'following up',
      'making disciples', 'local needs', 'congregation bible study'
    ];
    
    const portugueseIndicators = [
      'apostila da reunião', 'comentários iniciais', 'joias espirituais',
      'leitura da bíblia', 'iniciando conversas', 'cultivando o interesse',
      'fazendo discípulos', 'necessidades locais', 'estudo bíblico de congregação'
    ];

    const englishCount = englishIndicators.reduce((count, indicator) => 
      count + (text.toLowerCase().includes(indicator) ? 1 : 0), 0);
    
    const portugueseCount = portugueseIndicators.reduce((count, indicator) => 
      count + (text.toLowerCase().includes(indicator) ? 1 : 0), 0);

    return englishCount > portugueseCount ? 'en' : 'pt';
  }

  /**
   * Extrai semanas da programação
   * @param {string} text Texto do PDF
   * @param {string} language Idioma detectado
   * @returns {Array} Lista de semanas
   */
  extractWeeks(text, language) {
    const weeks = [];
    
    // Padrões mais robustos para detectar semanas em PDFs MWB
    const weekPatterns = {
      en: [
        /week\s+(\d+)/gi,
        /(\d+)\s*st\s+week/gi,
        /(\d+)\s*nd\s+week/gi,
        /(\d+)\s*rd\s+week/gi,
        /(\d+)\s*th\s+week/gi,
        /july\s+(\d+)/gi,
        /august\s+(\d+)/gi,
        /september\s+(\d+)/gi,
        /october\s+(\d+)/gi,
        /november\s+(\d+)/gi,
        /december\s+(\d+)/gi
      ],
      pt: [
        /semana\s+(\d+)/gi,
        /(\d+)\s*ª\s*semana/gi,
        /julho\s+(\d+)/gi,
        /agosto\s+(\d+)/gi,
        /setembro\s+(\d+)/gi,
        /outubro\s+(\d+)/gi,
        /novembro\s+(\d+)/gi,
        /dezembro\s+(\d+)/gi
      ]
    };

    const patterns = weekPatterns[language] || weekPatterns.en;
    const foundWeeks = new Set();

    // Tentar todos os padrões
    patterns.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        const weekNumber = parseInt(match[1]);
        if (weekNumber && weekNumber >= 1 && weekNumber <= 52) {
          foundWeeks.add(weekNumber);
        }
      });
    });

    // Se não encontrou semanas específicas, criar semanas baseadas no mês
    if (foundWeeks.size === 0) {
      const monthPatterns = {
        en: {
          july: 7, august: 8, september: 9, october: 10, november: 11, december: 12
        },
        pt: {
          julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12
        }
      };

      const months = monthPatterns[language] || monthPatterns.en;
      Object.keys(months).forEach(monthName => {
        if (text.toLowerCase().includes(monthName)) {
          const month = months[monthName];
          // Criar 4 semanas para o mês
          for (let i = 1; i <= 4; i++) {
            foundWeeks.add(i);
          }
        }
      });
    }

    // Converter para array e criar objetos de semana
    Array.from(foundWeeks).forEach(weekNumber => {
      const startDate = this.calculateWeekStartDate(weekNumber, language);
      const endDate = this.calculateWeekEndDate(startDate);

      weeks.push({
        weekNumber,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        title: `${language === 'pt' ? 'Semana' : 'Week'} ${weekNumber}`
      });
    });

    return weeks;
  }

  /**
   * Extrai seções de uma semana específica
   * @param {string} text Texto do PDF
   * @param {Object} week Dados da semana
   * @param {string} language Idioma
   * @returns {Object} Seções da semana
   */
  extractSections(text, week, language) {
    const sections = {
      opening: [],
      treasures: [],
      ministry: [],
      living: [],
      closing: []
    };

    // Padrões mais robustos para diferentes seções
    const sectionPatterns = {
      en: {
        opening: ['opening comments', 'song', 'opening prayer', 'welcome', 'song no', 'song number'],
        treasures: ['spiritual gems', 'bible reading', 'talk', 'treasures from god\'s word', 'bible highlights'],
        ministry: ['starting a conversation', 'following up', 'making disciples', 'ministry', 'service', 'field service'],
        living: ['local needs', 'congregation bible study', 'living as christians', 'local announcements'],
        closing: ['concluding comments', 'song', 'closing prayer', 'conclusion', 'closing song']
      },
      pt: {
        opening: ['comentários iniciais', 'cântico', 'oração inicial', 'boas-vindas', 'cântico nº'],
        treasures: ['joias espirituais', 'leitura da bíblia', 'discurso', 'tesouros da palavra de deus'],
        ministry: ['iniciando conversas', 'cultivando o interesse', 'fazendo discípulos', 'ministério', 'serviço'],
        living: ['necessidades locais', 'estudo bíblico de congregação', 'vivendo como cristãos'],
        closing: ['comentários finais', 'cântico', 'oração final', 'conclusão', 'cântico final']
      }
    };

    const patterns = sectionPatterns[language] || sectionPatterns.en;

    // Extrair partes de cada seção
    Object.keys(sections).forEach(sectionKey => {
      const sectionParts = patterns[sectionKey] || [];
      sectionParts.forEach(part => {
        const partData = this.extractPartData(text, part, language);
        if (partData) {
          sections[sectionKey].push(partData);
        }
      });
    });

    // Se não encontrou seções específicas, criar seções padrão
    if (Object.values(sections).every(arr => arr.length === 0)) {
      const defaultSections = {
        opening: [{ 
          title: language === 'pt' ? 'Comentários Iniciais' : 'Opening Comments', 
          description: language === 'pt' ? 'Abertura da reunião' : 'Meeting opening',
          duration: '3 min', 
          type: 'opening' 
        }],
        treasures: [{ 
          title: language === 'pt' ? 'Joias Espirituais' : 'Spiritual Gems', 
          description: language === 'pt' ? 'Tesouros da Palavra de Deus' : 'Treasures from God\'s Word',
          duration: '10 min', 
          type: 'treasures' 
        }],
        ministry: [{ 
          title: language === 'pt' ? 'Ministério' : 'Ministry', 
          description: language === 'pt' ? 'Serviço de Campo' : 'Field Service',
          duration: '15 min', 
          type: 'ministry' 
        }],
        living: [{ 
          title: language === 'pt' ? 'Vivendo como Cristãos' : 'Living as Christians', 
          description: language === 'pt' ? 'Necessidades Locais' : 'Local Needs',
          duration: '10 min', 
          type: 'living' 
        }],
        closing: [{ 
          title: language === 'pt' ? 'Comentários Finais' : 'Concluding Comments', 
          description: language === 'pt' ? 'Encerramento' : 'Meeting conclusion',
          duration: '3 min', 
          type: 'closing' 
        }]
      };
      
      Object.keys(sections).forEach(key => {
        sections[key] = defaultSections[key] || [];
      });
    }

    return sections;
  }

  /**
   * Extrai dados de uma parte específica
   * @param {string} text Texto do PDF
   * @param {string} partName Nome da parte
   * @param {string} language Idioma
   * @returns {Object|null} Dados da parte
   */
  extractPartData(text, partName, language) {
    try {
      // Buscar referências à parte no texto
      const partRegex = new RegExp(partName, 'gi');
      const matches = [...text.matchAll(partRegex)];

      if (matches.length === 0) return null;

      // Extrair informações básicas
      const duration = this.extractDuration(text, partName);
      const requirements = this.extractRequirements(text, partName);

      return {
        title: this.capitalizeFirst(partName),
        type: this.mapPartType(partName, language),
        duration: duration || 5, // Default 5 minutos
        requirements: requirements || {},
        notes: this.extractNotes(text, partName),
        order: this.extractOrder(text, partName)
      };
    } catch (error) {
      console.error(`❌ Erro ao extrair dados da parte ${partName}:`, error);
      return null;
    }
  }

  /**
   * Extrai duração de uma parte
   * @param {string} text Texto do PDF
   * @param {string} partName Nome da parte
   * @returns {number|null} Duração em minutos
   */
  extractDuration(text, partName) {
    const durationPattern = /(\d+)\s*min/gi;
    const matches = [...text.matchAll(durationPattern)];
    
    if (matches.length > 0) {
      return parseInt(matches[0][1]);
    }
    
    return null;
  }

  /**
   * Extrai requisitos de uma parte
   * @param {string} text Texto do PDF
   * @param {string} partName Nome da parte
   * @returns {Object} Requisitos da parte
   */
  extractRequirements(text, partName) {
    const requirements = {};
    
    // Verificar requisitos específicos
    if (text.toLowerCase().includes('male') || text.toLowerCase().includes('masculino')) {
      requirements.requires_male = true;
    }
    
    if (text.toLowerCase().includes('assistant') || text.toLowerCase().includes('assistente')) {
      requirements.allows_assistant = true;
    }
    
    if (text.toLowerCase().includes('elder') || text.toLowerCase().includes('ancião')) {
      requirements.elders_only = true;
    }
    
    return requirements;
  }

  /**
   * Extrai notas de uma parte
   * @param {string} text Texto do PDF
   * @param {string} partName Nome da parte
   * @returns {string} Notas da parte
   */
  extractNotes(text, partName) {
    // Implementar lógica para extrair notas específicas
    // Por enquanto, retorna string vazia
    return '';
  }

  /**
   * Extrai ordem de uma parte
   * @param {string} text Texto do PDF
   * @param {string} partName Nome da parte
   * @returns {number} Ordem da parte
   */
  extractOrder(text, partName) {
    // Implementar lógica para determinar ordem
    // Por enquanto, retorna ordem baseada no tipo
    const orderMap = {
      'opening comments': 1,
      'comentários iniciais': 1,
      'song': 2,
      'cântico': 2,
      'spiritual gems': 3,
      'joias espirituais': 3,
      'bible reading': 4,
      'leitura da bíblia': 4
    };
    
    return orderMap[partName.toLowerCase()] || 99;
  }

  /**
   * Mapeia tipo de parte para formato padrão
   * @param {string} partName Nome da parte
   * @param {string} language Idioma
   * @returns {string} Tipo mapeado
   */
  mapPartType(partName, language) {
    const typeMap = {
      'opening comments': 'opening_comments',
      'comentários iniciais': 'opening_comments',
      'song': 'song',
      'cântico': 'song',
      'spiritual gems': 'spiritual_gems',
      'joias espirituais': 'spiritual_gems',
      'bible reading': 'bible_reading',
      'leitura da bíblia': 'bible_reading',
      'talk': 'talk',
      'discurso': 'talk',
      'starting a conversation': 'starting',
      'iniciando conversas': 'starting',
      'following up': 'following',
      'cultivando o interesse': 'following',
      'making disciples': 'making_disciples',
      'fazendo discípulos': 'making_disciples',
      'congregation bible study': 'congregation_study',
      'estudo bíblico de congregação': 'congregation_study'
    };
    
    return typeMap[partName.toLowerCase()] || 'unknown';
  }

  /**
   * Calcula data de início da semana
   * @param {number} weekNumber Número da semana
   * @param {string} language Idioma
   * @returns {Date} Data de início
   */
  calculateWeekStartDate(weekNumber, language) {
    // Implementação simplificada - assumir semanas de janeiro
    const year = new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const daysToAdd = (weekNumber - 1) * 7;
    
    return new Date(startOfYear.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  }

  /**
   * Calcula data de fim da semana
   * @param {Date} startDate Data de início
   * @returns {Date} Data de fim
   */
  calculateWeekEndDate(startDate) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    return endDate;
  }

  /**
   * Capitaliza primeira letra
   * @param {string} str String para capitalizar
   * @returns {string} String capitalizada
   */
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Valida se um PDF é um MWB válido
   * @param {string} filePath Caminho do arquivo
   * @returns {boolean} Se é válido
   */
  async validatePDF(filePath) {
    try {
      const fileName = path.basename(filePath);
      return this.mwbPattern.test(fileName);
    } catch (error) {
      console.error('❌ Erro ao validar PDF:', error);
      return false;
    }
  }
}

module.exports = PDFParser;
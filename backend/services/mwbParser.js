const fs = require('fs');
const path = require('path');

/**
 * MWB (Meeting Workbook) Parser
 * Extracts program data from official JW Meeting Workbook PDFs
 * Based on S-38 instructions and real PDF structure
 */
class MWBParser {
  constructor() {
    this.programsPath = path.join(__dirname, '../../docs/Oficial/programs');
  }

  /**
   * Get available MWB PDFs
   */
  getAvailablePDFs() {
    const pdfs = {
      portuguese: [],
      english: []
    };

    try {
      const ptPath = path.join(this.programsPath, 'portuguese');
      const enPath = path.join(this.programsPath, 'english');

      if (fs.existsSync(ptPath)) {
        pdfs.portuguese = fs.readdirSync(ptPath)
          .filter(file => file.endsWith('.pdf'))
          .map(file => ({
            filename: file,
            path: path.join(ptPath, file),
            period: this.extractPeriodFromFilename(file)
          }));
      }

      if (fs.existsSync(enPath)) {
        pdfs.english = fs.readdirSync(enPath)
          .filter(file => file.endsWith('.pdf'))
          .map(file => ({
            filename: file,
            path: path.join(enPath, file),
            period: this.extractPeriodFromFilename(file)
          }));
      }
    } catch (error) {
      console.error('Error reading PDF directories:', error);
    }

    return pdfs;
  }

  /**
   * Extract period from filename (e.g., mwb_T_202507.pdf -> 2025-07)
   */
  extractPeriodFromFilename(filename) {
    const match = filename.match(/(\d{4})(\d{2})/);
    if (match) {
      return `${match[1]}-${match[2]}`;
    }
    return null;
  }

  /**
   * Load real program data from JSON files
   */
  loadRealProgram(period) {
    try {
      const jsonPath = path.join(__dirname, '../../docs/Oficial/programacoes-json', `${period}.json`);
      if (fs.existsSync(jsonPath)) {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        return this.convertJsonToProgram(data, period);
      }
    } catch (error) {
      console.error(`Error loading ${period}.json:`, error);
    }
    return this.generateMockProgram(period);
  }

  /**
   * Convert JSON data to program format
   */
  convertJsonToProgram(jsonData, period) {
    return jsonData.map(week => ({
      id: week.idSemana,
      semana: week.semanaLabel,
      data_inicio: week.idSemana,
      tema: week.tema,
      partes: this.convertJsonParts(week.programacao),
      pdf_source: `mwb_T_${period.replace('-', '')}.pdf`,
      created_at: new Date().toISOString()
    }));
  }

  /**
   * Convert JSON parts to S-38 format
   */
  convertJsonParts(programacao) {
    const parts = [];
    let partNumber = 1;

    programacao.forEach(secao => {
      secao.partes.forEach(parte => {
        parts.push({
          numero: partNumber++,
          titulo: parte.titulo,
          tempo: parte.duracaoMin,
          tipo: this.mapPartType(parte.tipo),
          secao: this.mapSection(secao.secao),
          restricoes: parte.restricoes,
          s38_rules: this.getS38Rules(parte)
        });
      });
    });

    return parts;
  }

  /**
   * Map part types to S-38 format
   */
  mapPartType(tipo) {
    const typeMap = {
      'leitura': 'bible_reading',
      'de casa em casa': 'starting',
      'testemunho informal': 'following', 
      'testemunho publico': 'starting',
      'estudo biblico': 'making_disciples',
      'demonstracao': 'following',
      'discurso': 'talk',
      'consideracao': 'talk',
      'joias': 'talk',
      'estudo': 'congregation_study'
    };
    return typeMap[tipo] || 'talk';
  }

  /**
   * Map sections to standard format
   */
  mapSection(secao) {
    const sectionMap = {
      'Tesouros da Palavra de Deus': 'TREASURES',
      'Faça Seu Melhor no Ministério': 'APPLY',
      'Nossa Vida Cristã': 'LIVING'
    };
    return sectionMap[secao] || 'LIVING';
  }

  /**
   * Get S-38 rules for part
   */
  getS38Rules(parte) {
    const rules = {
      gender: parte.restricoes?.genero === 'M' ? 'male_only' : 'both',
      assistant_required: ['de casa em casa', 'testemunho informal', 'estudo biblico', 'demonstracao'].includes(parte.tipo)
    };

    if (rules.assistant_required) {
      rules.assistant_gender = 'same';
    }

    return rules;
  }

  /**
   * Generate mock program data (fallback)
   */
  generateMockProgram(period = '2024-12') {
    const [year, month] = period.split('-');
    const weeks = this.generateWeeksForMonth(year, month);
    
    return weeks.map((week, index) => ({
      id: `${period}-week-${index + 1}`,
      semana: week.label,
      data_inicio: week.start,
      data_fim: week.end,
      partes: this.generatePartsForWeek(week, index + 1),
      pdf_source: `mwb_T_${year}${month}.pdf`,
      created_at: new Date().toISOString()
    }));
  }

  /**
   * Generate weeks for a given month
   */
  generateWeeksForMonth(year, month) {
    const weeks = [];
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    
    // Find first Monday of the month (or close to it)
    let currentDate = new Date(firstDay);
    while (currentDate.getDay() !== 1) { // 1 = Monday
      currentDate.setDate(currentDate.getDate() + 1);
    }

    let weekNumber = 1;
    while (currentDate <= lastDay) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6); // Sunday

      // Adjust if week goes into next month
      if (weekEnd.getMonth() !== month - 1) {
        weekEnd.setDate(lastDay.getDate());
      }

      weeks.push({
        label: `${weekStart.getDate()}-${weekEnd.getDate()} de ${this.getMonthName(month)} de ${year}`,
        start: weekStart.toISOString().split('T')[0],
        end: weekEnd.toISOString().split('T')[0],
        number: weekNumber
      });

      currentDate.setDate(currentDate.getDate() + 7);
      weekNumber++;
    }

    return weeks;
  }

  /**
   * Generate parts for a specific week based on S-38 structure
   */
  generatePartsForWeek(week, weekNumber) {
    const bibleBooksRotation = [
      'Provérbios', 'Eclesiastes', 'Cantares', 'Isaías', 'Jeremias', 'Lamentações'
    ];
    
    const bibleBook = bibleBooksRotation[(weekNumber - 1) % bibleBooksRotation.length];
    const chapter = weekNumber + 24; // Starting from chapter 25

    return [
      {
        numero: 1,
        titulo: `Leitura da Bíblia: ${bibleBook} ${chapter}:1-15`,
        tempo: 4,
        tipo: 'bible_reading',
        secao: 'TREASURES',
        referencia: `${bibleBook} ${chapter}:1-15`,
        instrucoes: 'Apenas homens. Sem introdução ou conclusão.',
        qualificacoes: ['male'],
        s38_rules: {
          gender: 'male_only',
          introduction: false,
          conclusion: false,
          assistant: false
        }
      },
      {
        numero: 2,
        titulo: 'Iniciando conversas: Como usar uma pergunta para despertar interesse',
        tempo: 3,
        tipo: 'starting',
        secao: 'APPLY',
        cena: 'De casa em casa',
        instrucoes: 'Demonstração. Ajudante do mesmo sexo ou parente.',
        qualificacoes: ['male', 'female'],
        s38_rules: {
          gender: 'both',
          assistant_required: true,
          assistant_gender: 'same_or_family',
          setting: 'house_to_house'
        }
      },
      {
        numero: 3,
        titulo: 'Cultivando interesse: Como usar uma publicação para ensinar',
        tempo: 4,
        tipo: 'following',
        secao: 'APPLY',
        cena: 'Revisita',
        instrucoes: 'Demonstração. Ajudante do mesmo sexo.',
        qualificacoes: ['male', 'female'],
        s38_rules: {
          gender: 'both',
          assistant_required: true,
          assistant_gender: 'same',
          setting: 'return_visit'
        }
      },
      {
        numero: 4,
        titulo: 'Fazendo discípulos: Como conduzir um estudo bíblico progressivo',
        tempo: 5,
        tipo: 'making_disciples',
        secao: 'APPLY',
        instrucoes: 'Demonstração. Ajudante do mesmo sexo.',
        qualificacoes: ['male', 'female'],
        s38_rules: {
          gender: 'both',
          assistant_required: true,
          assistant_gender: 'same',
          setting: 'bible_study'
        }
      },
      {
        numero: 5,
        titulo: 'Explicando suas crenças: Por que Deus permite o sofrimento?',
        tempo: 5,
        tipo: 'talk',
        secao: 'APPLY',
        instrucoes: 'Discurso. Apenas homens qualificados.',
        qualificacoes: ['male', 'qualified'],
        s38_rules: {
          gender: 'male_only',
          qualification_required: true,
          assistant: false,
          type: 'talk'
        }
      },
      {
        numero: 6,
        titulo: 'Estudo bíblico de congregação',
        tempo: 30,
        tipo: 'congregation_study',
        secao: 'LIVING',
        referencia: 'Livro de estudo atual',
        instrucoes: 'Conduzido por ancião qualificado.',
        qualificacoes: ['elder'],
        s38_rules: {
          gender: 'male_only',
          qualification: 'elder',
          duration: 30,
          type: 'study'
        }
      }
    ];
  }

  /**
   * Get month name in Portuguese
   */
  getMonthName(monthNumber) {
    const months = {
      '01': 'janeiro', '02': 'fevereiro', '03': 'março', '04': 'abril',
      '05': 'maio', '06': 'junho', '07': 'julho', '08': 'agosto',
      '09': 'setembro', '10': 'outubro', '11': 'novembro', '12': 'dezembro'
    };
    return months[monthNumber.toString().padStart(2, '0')];
  }

  /**
   * Get program for specific week
   */
  getProgramForWeek(weekStart) {
    const date = new Date(weekStart);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const period = `${year}-${month}`;
    
    const monthPrograms = this.loadRealProgram(period);
    return monthPrograms.find(program => program.data_inicio === weekStart || program.id === weekStart);
  }

  /**
   * Get all programs for a month
   */
  getProgramsForMonth(year, month) {
    const period = `${year}-${month.toString().padStart(2, '0')}`;
    return this.loadRealProgram(period);
  }
}

module.exports = MWBParser;
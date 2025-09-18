/**
 * Enhanced Spreadsheet Processor - Comprehensive import system
 */

import * as XLSX from 'xlsx';
import { 
  ColumnMapping, 
  SmartValidationResult, 
  FamilyAnalysis, 
  EnhancedStudentData, 
  ProcessingResult,
  EnhancedProcessingOptions,
  DetectedFormat
} from '@/types/enhanced-import';

// Enhanced column mapping with multiple aliases
export const ENHANCED_COLUMN_MAPPING: ColumnMapping = {
  nome: ['nome', 'Nome Completo', 'name', 'full_name'],
  familia: ['familia', 'Família / Agrupamento', 'family', 'surname'],
  idade: ['idade', 'Idade', 'age', 'years'],
  genero: ['genero', 'Gênero (M/F)', 'gender', 'sex'],
  email: ['email', 'E-mail', 'e-mail', 'mail'],
  telefone: ['telefone', 'Telefone', 'phone', 'celular'],
  data_nascimento: ['data_nascimento', 'Data de Nascimento', 'birth_date'],
  data_batismo: ['data_batismo', 'Data de Batismo', 'baptism_date'],
  data_de_matricula: ['data_de_matricula', 'Data de Matrícula', 'enrollment_date'],
  cargo: ['cargo', 'Cargo Congregacional', 'position', 'role'],
  tempo: ['tempo', 'Tempo de Serviço', 'service_time'],
  ativo: ['ativo', 'Status (Ativo/Inativo)', 'active', 'status'],
  observacoes: ['observacoes', 'Observações', 'notes', 'comments'],
  estado_civil: ['estado_civil', 'Estado Civil', 'marital_status'],
  papel_familiar: ['papel_familiar', 'Papel Familiar', 'family_role'],
  id_pai: ['id_pai', 'ID Pai', 'father_id'],
  id_mae: ['id_mae', 'ID Mãe', 'mother_id'],
  id_conjuge: ['id_conjuge', 'ID Cônjuge', 'spouse_id'],
  coabitacao: ['coabitacao', 'Coabitação', 'cohabitation'],
  chairman: ['chairman', 'Presidente', 'chairperson'],
  pray: ['pray', 'Oração', 'prayer'],
  tresures: ['tresures', 'treasures', 'Tesouros da Palavra'],
  gems: ['gems', 'Joias Espirituais', 'spiritual_gems'],
  reading: ['reading', 'Leitura da Bíblia', 'bible_reading'],
  starting: ['starting', 'Primeira Conversa', 'initial_call'],
  following: ['following', 'Revisita', 'return_visit'],
  making: ['making', 'Estudo Bíblico', 'bible_study'],
  explaining: ['explaining', 'Explicando as Escrituras'],
  talk: ['talk', 'Discurso', 'student_talk'],
  responsavel_primario: ['responsavel_primario', 'Parente Responsável', 'primary_guardian'],
  responsavel_secundario: ['responsavel_secundario', 'Responsável Secundário', 'secondary_guardian'],
  parentesco: ['parentesco', 'Parentesco', 'relationship'],
  menor: ['menor', 'Menor de Idade', 'minor', 'underage'],
  created_at: ['created_at', 'Data de Criação', 'creation_date'],
  updated_at: ['updated_at', 'Data de Atualização', 'update_date']
};

// Smart format detection
export class FormatDetector {
  static detectFormat(headers: string[]): DetectedFormat[] {
    const formats = [
      {
        name: 'docs/Oficial Enhanced Format',
        required: ['nome', 'familia', 'idade', 'genero'],
        pattern: /^(nome|familia|idade|genero)/i
      },
      {
        name: 'Legacy SpreadsheetRow Format', 
        required: ['Nome Completo', 'Gênero (M/F)', 'Família / Agrupamento'],
        pattern: /^(Nome Completo|Gênero)/i
      }
    ];

    return formats.map(format => {
      const matches = format.required.filter(req => 
        headers.some(h => h.toLowerCase().includes(req.toLowerCase()))
      ).length;
      const confidence = matches / format.required.length;
      
      return {
        name: format.name,
        confidence,
        matchedColumns: {},
        missingColumns: format.required.filter(req => 
          !headers.some(h => h.toLowerCase().includes(req.toLowerCase()))
        ),
        extraColumns: [],
        suggestions: []
      };
    }).filter(f => f.confidence > 0.3).sort((a, b) => b.confidence - a.confidence);
  }
}

// Smart validation system
export class SmartValidator {
  static validateRow(row: any, lineNumber: number): SmartValidationResult[] {
    const results: SmartValidationResult[] = [];
    
    // Required field validations
    if (!row.nome || String(row.nome).trim().length < 2) {
      results.push({
        isValid: false,
        severity: 'error',
        field: 'nome',
        message: `Linha ${lineNumber}: Nome completo é obrigatório`,
        autoFixable: false
      });
    }

    if (!row.familia || String(row.familia).trim().length === 0) {
      results.push({
        isValid: false,
        severity: 'error', 
        field: 'familia',
        message: `Linha ${lineNumber}: Família/Agrupamento é obrigatório`,
        autoFixable: false
      });
    }

    if (!['M', 'F', 'masculino', 'feminino'].includes(String(row.genero || '').trim())) {
      results.push({
        isValid: false,
        severity: 'error',
        field: 'genero',
        message: `Linha ${lineNumber}: Gênero deve ser M ou F`,
        suggestedFix: String(row.genero).toLowerCase().includes('f') ? 'F' : 'M',
        autoFixable: true
      });
    }

    // Minor without guardian warning
    const idade = parseInt(String(row.idade || 0));
    if (idade < 18 && (!row.responsavel_primario || String(row.responsavel_primario).trim() === '')) {
      results.push({
        isValid: true,
        severity: 'warning',
        field: 'responsavel_primario',
        message: `Linha ${lineNumber}: Menor de idade sem responsável definido`,
        autoFixable: false
      });
    }

    return results;
  }
}

// Family analysis system
export class FamilyAnalyzer {
  static analyzeFamily(students: any[]): FamilyAnalysis {
    const familyGroups = new Map<string, any[]>();
    
    // Group by family name
    students.forEach(student => {
      const familyName = String(student.familia || '').trim().toLowerCase();
      if (familyName) {
        if (!familyGroups.has(familyName)) {
          familyGroups.set(familyName, []);
        }
        familyGroups.get(familyName)!.push(student);
      }
    });

    const families = Array.from(familyGroups.entries())
      .filter(([_, members]) => members.length > 1)
      .map(([surname, members]) => ({
        id: `family_${surname}`,
        surname,
        members: members.map(m => ({
          id: m.user_id || m.id || `temp_${m.nome}`,
          name: m.nome,
          role: parseInt(String(m.idade || 0)) < 18 ? 
            (String(m.genero).toUpperCase() === 'M' ? 'son' as const : 'daughter' as const) :
            (String(m.genero).toUpperCase() === 'M' ? 'father' as const : 'mother' as const),
          age: parseInt(String(m.idade || 0)),
          relationships: []
        })),
        structure: members.filter(m => parseInt(String(m.idade || 0)) >= 18).length > 1 ? 'nuclear' as const : 'single-parent' as const
      }));

    return {
      families,
      relationships: [],
      orphans: students.filter(s => !familyGroups.has(String(s.familia || '').toLowerCase())).map(s => s.id),
      suggestions: []
    };
  }
}

// Main processing engine
export class EnhancedSpreadsheetProcessor {
  static async processFile(file: File, options: EnhancedProcessingOptions): Promise<ProcessingResult> {
    const rawData = await this.readExcelFile(file);
    const headers = rawData.length > 0 ? Object.keys(rawData[0]) : [];
    const detectedFormats = FormatDetector.detectFormat(headers);
    
    // Validate data
    const validationResults: SmartValidationResult[] = [];
    if (options.enableSmartValidation) {
      rawData.forEach((row, i) => {
        const rowResults = SmartValidator.validateRow(row, i + 2);
        validationResults.push(...rowResults);
      });
    }
    
    // Analyze families
    let familyAnalysis: FamilyAnalysis = { families: [], relationships: [], orphans: [], suggestions: [] };
    if (options.detectFamilyRelationships) {
      familyAnalysis = FamilyAnalyzer.analyzeFamily(rawData);
    }
    
    // Convert to enhanced format
    const processedData: EnhancedStudentData[] = rawData.map((row, i) => 
      this.convertToEnhancedFormat(row, i + 2, options)
    );
    
    return {
      summary: {
        totalRows: rawData.length,
        validRows: rawData.length - validationResults.filter(v => v.severity === 'error').length,
        processedRows: processedData.length,
        errorsFixed: 0,
        warningsGenerated: validationResults.filter(v => v.severity === 'warning').length,
        familiesDetected: familyAnalysis.families.length,
        relationshipsLinked: familyAnalysis.relationships.length
      },
      validationResults,
      familyAnalysis,
      processedData,
      originalData: rawData,
      reports: {
        validationReport: this.generateValidationReport(validationResults),
        familyReport: this.generateFamilyReport(familyAnalysis),
        qualificationReport: '',
        processingLog: [`Processed ${rawData.length} records`]
      }
    };
  }

  private static async readExcelFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target?.result, { type: 'binary' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          const headers = jsonData[0];
          const rows = jsonData.slice(1);
          
          resolve(rows.map(row => {
            const obj: any = {};
            headers.forEach((header, index) => obj[header] = row[index] || '');
            return obj;
          }));
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsBinaryString(file);
    });
  }

  private static convertToEnhancedFormat(row: any, lineNumber: number, options: EnhancedProcessingOptions): EnhancedStudentData {
    const mappedData: any = {};
    
    // Smart column mapping
    for (const [targetField, possibleColumns] of Object.entries(ENHANCED_COLUMN_MAPPING)) {
      for (const column of possibleColumns) {
        if (row[column] !== undefined) {
          mappedData[targetField] = row[column];
          break;
        }
      }
    }
    
    const id = mappedData.id || `student_${lineNumber}_${Date.now()}`;
    
    return {
      id,
      family_id: `family_${mappedData.familia || 'unknown'}`,
      user_id: id,
      nome: String(mappedData.nome || '').trim(),
      familia: String(mappedData.familia || '').trim(),
      idade: parseInt(String(mappedData.idade || 0)),
      genero: String(mappedData.genero || 'M').toUpperCase().startsWith('F') ? 'F' : 'M',
      email: mappedData.email ? String(mappedData.email).trim() : undefined,
      telefone: mappedData.telefone ? String(mappedData.telefone).trim() : undefined,
      data_nascimento: mappedData.data_nascimento ? String(mappedData.data_nascimento) : undefined,
      data_batismo: mappedData.data_batismo ? String(mappedData.data_batismo) : undefined,
      tempo: parseInt(String(mappedData.tempo || 0)),
      cargo: String(mappedData.cargo || 'estudante_novo').toLowerCase(),
      ativo: this.parseBoolean(mappedData.ativo, true),
      menor: parseInt(String(mappedData.idade || 0)) < 18,
      responsavel_primario: mappedData.responsavel_primario ? String(mappedData.responsavel_primario) : undefined,
      qualifications: {
        chairman: this.parseBoolean(mappedData.chairman, false),
        pray: this.parseBoolean(mappedData.pray, false),
        tresures: this.parseBoolean(mappedData.tresures, false),
        gems: this.parseBoolean(mappedData.gems, false),
        reading: this.parseBoolean(mappedData.reading, false),
        starting: this.parseBoolean(mappedData.starting, false),
        following: this.parseBoolean(mappedData.following, false),
        making: this.parseBoolean(mappedData.making, false),
        explaining: this.parseBoolean(mappedData.explaining, false),
        talk: this.parseBoolean(mappedData.talk, false)
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      processingInfo: {
        originalRow: lineNumber,
        detectedFormat: 'enhanced',
        autoFixesApplied: [],
        validationWarnings: [],
        familyRelationships: []
      }
    };
  }

  private static parseBoolean(value: any, defaultValue: boolean): boolean {
    if (typeof value === 'boolean') return value;
    const str = String(value).toLowerCase();
    if (['true', '1', 'verdadeiro', 'sim', 'yes'].includes(str)) return true;
    if (['false', '0', 'falso', 'não', 'no'].includes(str)) return false;
    return defaultValue;
  }

  private static generateValidationReport(results: SmartValidationResult[]): string {
    const errors = results.filter(r => r.severity === 'error');
    const warnings = results.filter(r => r.severity === 'warning');
    
    return `Validation Report:
Errors: ${errors.length}
Warnings: ${warnings.length}
${results.map(r => `- ${r.message}`).join('\n')}`;
  }

  private static generateFamilyReport(analysis: FamilyAnalysis): string {
    return `Family Analysis:
Families detected: ${analysis.families.length}
Relationships: ${analysis.relationships.length}
Orphans: ${analysis.orphans.length}`;
  }

  static getDefaultOptions(): EnhancedProcessingOptions {
    return {
      autoDetectColumns: true,
      strictColumnMatching: false,
      fuzzyNameMatching: true,
      enableSmartValidation: true,
      autoFixMinorIssues: true,
      requiredFieldsStrict: true,
      detectFamilyRelationships: true,
      autoLinkFamilies: true,
      generateMissingGuardians: false,
      validateS38Qualifications: true,
      enforceBusinessRules: true,
      suggestQualificationUpdates: false,
      generateReport: true,
      createBackup: true,
      preserveOriginalData: true
    };
  }
}
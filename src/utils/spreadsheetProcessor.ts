import * as XLSX from 'xlsx';
import { format, parse, isValid } from 'date-fns';
import {
  SpreadsheetRow,
  ProcessedStudentData,
  ValidationResult,
  GENDER_MAPPING,
  CARGO_MAPPING,
  STATUS_MAPPING,
  BOOLEAN_MAPPING,
  TEMPLATE_COLUMNS,
  TEMPLATE_SAMPLE_DATA
} from '@/types/spreadsheet';

/**
 * Reads Excel file and returns raw data
 */
export const readExcelFile = (file: File): Promise<SpreadsheetRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const fileData = e.target?.result;
        const workbook = XLSX.read(fileData, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: ''
        }) as any[][];

        if (jsonData.length < 2) {
          throw new Error('Planilha deve conter pelo menos uma linha de cabeçalho e uma linha de dados');
        }

        const headers = jsonData[0];
        const rows = jsonData.slice(1);

        // Convert to objects
        const processedData: SpreadsheetRow[] = rows.map(row => {
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });

        resolve(processedData);
      } catch (error) {
        reject(new Error(`Erro ao ler arquivo Excel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };
    
    reader.readAsBinaryString(file);
  });
};

/**
 * Validates and processes a single row
 */
export const processRow = (row: SpreadsheetRow, index: number): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required fields validation
  if (!row["nome"] || typeof row["nome"] !== 'string' || row["nome"].trim().length < 2) {
    errors.push('Nome completo é obrigatório e deve ter pelo menos 2 caracteres');
  }
  
  if (!row["idade"] || typeof row["idade"] !== 'number' || row["idade"] < 1 || row["idade"] > 120) {
    errors.push('Idade deve ser um número entre 1 e 120');
  }
  
  if (!row["genero"] || !GENDER_MAPPING[row["genero"]]) {
    errors.push('Gênero deve ser masculino ou feminino');
  }
  
  if (!row["familia"] || typeof row["familia"] !== 'string') {
    errors.push('Família é obrigatório');
  }
  
  if (!row["cargo"] || !CARGO_MAPPING[row["cargo"]]) {
    errors.push(`Cargo congregacional inválido: ${row["cargo"]}`);
  }
  
  if (!row["ativo"] || STATUS_MAPPING[row["ativo"]] === undefined) {
    errors.push('Status deve ser VERDADEIRO ou FALSO');
  }
  
  // Email validation
  if (row["email"] && typeof row["email"] === 'string' && row["email"].trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row["email"].trim())) {
      errors.push('E-mail inválido');
    }
  }
  
  // Phone validation
  if (row["telefone"] && typeof row["telefone"] === 'string' && row["telefone"].trim()) {
    const phoneRegex = /^[\d\s\-()]+$/;
    if (!phoneRegex.test(row["telefone"].trim()) || row["telefone"].trim().length < 8) {
      errors.push('Telefone inválido');
    }
  }
  
  // Date validations
  let dataBatismo: string | undefined;
  if (row["data_batismo"] && typeof row["data_batismo"] === 'string' && row["data_batismo"].trim()) {
    try {
      // Check if it's already in YYYY-MM-DD format
      if (row["data_batismo"].match(/^\d{4}-\d{2}-\d{2}$/)) {
        dataBatismo = row["data_batismo"];
      } else {
        const parsedDate = parseBrazilianDate(row["data_batismo"]);
        if (parsedDate) {
          dataBatismo = format(parsedDate, 'yyyy-MM-dd');
        } else {
          warnings.push('Data de batismo inválida - será ignorada');
        }
      }
    } catch {
      warnings.push('Data de batismo inválida - será ignorada');
    }
  }
  
  // Age vs birth date consistency
  if (row["data_nascimento"] && typeof row["data_nascimento"] === 'string' && row["data_nascimento"].trim()) {
    try {
      let birthDate: Date | null = null;
      // Check if it's already in YYYY-MM-DD format
      if (row["data_nascimento"].match(/^\d{4}-\d{2}-\d{2}$/)) {
        birthDate = new Date(row["data_nascimento"]);
      } else {
        birthDate = parseBrazilianDate(row["data_nascimento"]);
      }
      
      if (birthDate) {
        const calculatedAge = new Date().getFullYear() - birthDate.getFullYear();
        const ageDiff = Math.abs(calculatedAge - (row["idade"] as number));
        if (ageDiff > 1) {
          warnings.push(`Idade informada (${row["idade"]}) não confere com data de nascimento`);
        }
      }
    } catch {
      warnings.push('Data de nascimento inválida');
    }
  }
  
  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      warnings,
      rowIndex: index
    };
  }
  
  // Process birth date
  let dataNascimento: string | undefined;
  if (row["data_nascimento"] && typeof row["data_nascimento"] === 'string' && row["data_nascimento"].trim()) {
    try {
      // Check if it's already in YYYY-MM-DD format
      if (row["data_nascimento"].match(/^\d{4}-\d{2}-\d{2}$/)) {
        dataNascimento = row["data_nascimento"];
      } else {
        const parsedDate = parseBrazilianDate(row["data_nascimento"]);
        if (parsedDate) {
          dataNascimento = format(parsedDate, 'yyyy-MM-dd');
        }
      }
    } catch {
      // Ignore invalid birth dates
    }
  }
  
  // Process valid data
  const processedData: ProcessedStudentData = {
    id: row["id"] && typeof row["id"] === 'string' ? row["id"].trim() || undefined : undefined,
    user_id: row["user_id"] && typeof row["user_id"] === 'string' ? row["user_id"].trim() || undefined : undefined,
    nome: (row["nome"] as string).trim(),
    familia: (row["familia"] as string).trim(),
    idade: row["idade"] as number,
    genero: GENDER_MAPPING[row["genero"]],
    email: row["email"] && typeof row["email"] === 'string' ? row["email"].trim() || undefined : undefined,
    telefone: row["telefone"] && typeof row["telefone"] === 'string' ? row["telefone"].trim() || undefined : undefined,
    data_batismo: dataBatismo,
    cargo: CARGO_MAPPING[row["cargo"]],
    id_pai_mae: row["id_pai_mae"] && typeof row["id_pai_mae"] === 'string' ? row["id_pai_mae"].trim() || undefined : undefined,
    ativo: STATUS_MAPPING[row["ativo"]],
    observacoes: row["observacoes"] && typeof row["observacoes"] === 'string' ? row["observacoes"].trim() || undefined : undefined,
    estado_civil: row["estado_civil"] && typeof row["estado_civil"] === 'string' ? row["estado_civil"].trim() || undefined : undefined,
    papel_familiar: row["papel_familiar"] && typeof row["papel_familiar"] === 'string' ? row["papel_familiar"].trim() || undefined : undefined,
    id_pai: row["id_pai"] && typeof row["id_pai"] === 'string' ? row["id_pai"].trim() || undefined : undefined,
    id_mae: row["id_mae"] && typeof row["id_mae"] === 'string' ? row["id_mae"].trim() || undefined : undefined,
    id_conjuge: row["id_conjuge"] && typeof row["id_conjuge"] === 'string' ? row["id_conjuge"].trim() || undefined : undefined,
    coabitacao: row["coabitacao"] ? BOOLEAN_MAPPING[row["coabitacao"]] || false : false,
    menor: row["menor"] ? BOOLEAN_MAPPING[row["menor"]] || false : false,
    responsavel_primario: row["responsavel_primario"] && typeof row["responsavel_primario"] === 'string' ? row["responsavel_primario"].trim() || undefined : undefined,
    responsavel_secundario: row["responsavel_secundario"] && typeof row["responsavel_secundario"] === 'string' ? row["responsavel_secundario"].trim() || undefined : undefined,
    chairman: row["chairman"] ? BOOLEAN_MAPPING[row["chairman"]] || false : false,
    pray: row["pray"] ? BOOLEAN_MAPPING[row["pray"]] || false : false,
    tresures: row["tresures"] ? BOOLEAN_MAPPING[row["tresures"]] || false : false,
    gems: row["gems"] ? BOOLEAN_MAPPING[row["gems"]] || false : false,
    reading: row["reading"] ? BOOLEAN_MAPPING[row["reading"]] || false : false,
    starting: row["starting"] ? BOOLEAN_MAPPING[row["starting"]] || false : false,
    following: row["following"] ? BOOLEAN_MAPPING[row["following"]] || false : false,
    making: row["making"] ? BOOLEAN_MAPPING[row["making"]] || false : false,
    explaining: row["explaining"] ? BOOLEAN_MAPPING[row["explaining"]] || false : false,
    talk: row["talk"] ? BOOLEAN_MAPPING[row["talk"]] || false : false,
    data_nascimento: dataNascimento
  };
  
  return {
    isValid: true,
    errors: [],
    warnings,
    data: processedData,
    rowIndex: index
  };
};

/**
 * Parses Brazilian date format (DD/MM/YYYY) to Date object
 */
export const parseBrazilianDate = (dateString: string): Date | null => {
  if (!dateString || typeof dateString !== 'string') return null;
  
  const cleanDate = dateString.trim();
  if (!cleanDate) return null;
  
  try {
    // Try DD/MM/YYYY format
    const parsed = parse(cleanDate, 'dd/MM/yyyy', new Date());
    if (isValid(parsed)) {
      return parsed;
    }
    
    // Try other common formats
    const formats = ['dd/MM/yy', 'dd-MM-yyyy', 'dd-MM-yy'];
    for (const format of formats) {
      const parsed = parse(cleanDate, format, new Date());
      if (isValid(parsed)) {
        return parsed;
      }
    }
    
    return null;
  } catch {
    return null;
  }
};

/**
 * Creates Excel template file
 */
export const createTemplate = (): Blob => {
  const workbook = XLSX.utils.book_new();

  // Create worksheet with headers and sample data
  const headers = [...TEMPLATE_COLUMNS] as (string | number)[];
  const data = [
    headers,
    ...TEMPLATE_SAMPLE_DATA.map(sample =>
      headers.map(col => (sample as any)[col as keyof typeof sample] || '')
    )
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  const colWidths = headers.map(col => ({ wch: Math.max((col as string).length, 15) }));
  worksheet['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Estudantes');

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

/**
 * Creates CSV error report for download
 */
export const createErrorReport = (validationResults: ValidationResult[]): Blob => {
  const errorResults = validationResults.filter(result => !result.isValid || result.warnings.length > 0);

  if (errorResults.length === 0) {
    // Create empty report
    const csvContent = 'Linha Excel,Tipo,Mensagem\n"Nenhum erro encontrado","Info","Todos os registros são válidos"';
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  // Create CSV header
  const headers = ['Linha Excel', 'Tipo', 'Mensagem'];
  let csvContent = headers.join(',') + '\n';

  // Add error rows
  errorResults.forEach(result => {
    const excelRow = result.rowIndex;

    // Add errors
    result.errors.forEach(error => {
      const row = [
        excelRow.toString(),
        'Erro',
        `"${error.replace(/"/g, '""')}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    // Add warnings
    result.warnings.forEach(warning => {
      const row = [
        excelRow.toString(),
        'Aviso',
        `"${warning.replace(/"/g, '""')}"`
      ];
      csvContent += row.join(',') + '\n';
    });
  });

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
};

/**
 * Creates enhanced error report with detailed information and statistics
 */
export const createEnhancedErrorReport = (
  validationResults: ValidationResult[],
  fileName: string = 'planilha'
): Blob => {
  const timestamp = format(new Date(), 'dd/MM/yyyy HH:mm:ss');

  let csvContent = '\uFEFF'; // BOM for UTF-8

  // Header with metadata
  csvContent += `Relatório de Erros - Importação de Estudantes\n`;
  csvContent += `Arquivo: ${fileName}\n`;
  csvContent += `Data/Hora: ${timestamp}\n`;
  csvContent += `Total de registros analisados: ${validationResults.length}\n`;

  const errorsCount = validationResults.filter(r => !r.isValid).length;
  const warningsCount = validationResults.filter(r => r.warnings.length > 0).length;

  csvContent += `Registros com erros: ${errorsCount}\n`;
  csvContent += `Registros com avisos: ${warningsCount}\n`;
  csvContent += `\n`;

  // Column headers
  csvContent += 'Linha,Tipo,Campo,Valor Original,Problema,Sugestão,Dados Completos\n';

  validationResults.forEach((result, index) => {
    const excelRow = index + 2; // Excel rows start at 1, plus header

    // Add errors
    result.errors.forEach(error => {
      const parts = error.split(':');
      const field = parts[0]?.trim() || 'Geral';
      const problem = parts.slice(1).join(':').trim() || error;

      // Get original value for the field
      const originalValue = getOriginalFieldValue(result.data, field);
      const suggestion = getSuggestionForError(field, problem);
      const completeData = formatCompleteData(result.data);

      const row = [
        excelRow.toString(),
        'Erro',
        `"${field.replace(/"/g, '""')}"`,
        `"${originalValue.replace(/"/g, '""')}"`,
        `"${problem.replace(/"/g, '""')}"`,
        `"${suggestion.replace(/"/g, '""')}"`,
        `"${completeData.replace(/"/g, '""')}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    // Add warnings
    result.warnings.forEach(warning => {
      const parts = warning.split(':');
      const field = parts[0]?.trim() || 'Geral';
      const problem = parts.slice(1).join(':').trim() || warning;

      const originalValue = getOriginalFieldValue(result.data, field);
      const suggestion = getSuggestionForWarning(field, problem);
      const completeData = formatCompleteData(result.data);

      const row = [
        excelRow.toString(),
        'Aviso',
        `"${field.replace(/"/g, '""')}"`,
        `"${originalValue.replace(/"/g, '""')}"`,
        `"${problem.replace(/"/g, '""')}"`,
        `"${suggestion.replace(/"/g, '""')}"`,
        `"${completeData.replace(/"/g, '""')}"`
      ];
      csvContent += row.join(',') + '\n';
    });
  });

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
};

/**
 * Gets original field value from processed data
 */
const getOriginalFieldValue = (data: ProcessedStudentData | undefined, field: string): string => {
  if (!data) return 'N/A';
  
  const fieldMap: Record<string, keyof ProcessedStudentData> = {
    'Nome': 'nome',
    'Família': 'familia',
    'Gênero': 'genero',
    'Cargo': 'cargo',
    'Email': 'email',
    'Telefone': 'telefone',
    'Status': 'ativo'
  };

  const key = fieldMap[field];
  if (key && data[key] !== undefined) {
    return String(data[key]);
  }

  return 'N/A';
};

/**
 * Provides suggestions for common errors
 */
const getSuggestionForError = (field: string, problem: string): string => {
  const suggestions: Record<string, string> = {
    'Nome': 'Verifique se o nome está completo e sem caracteres especiais',
    'Data de Nascimento': 'Use formato DD/MM/AAAA (ex: 15/03/1990)',
    'Gênero': 'Use "Masculino" ou "Feminino"',
    'Cargo': 'Use: Ancião, Servo Ministerial, Pioneiro Regular, Publicador Batizado, Publicador Não Batizado, Estudante Novo',
    'Email': 'Verifique se o email está no formato correto (ex: nome@dominio.com)',
    'Telefone': 'Use formato (XX) XXXXX-XXXX',
    'Status': 'Use "Ativo" ou "Inativo"'
  };

  if (problem.toLowerCase().includes('obrigatório')) {
    return 'Campo obrigatório - preencha com informação válida';
  }

  if (problem.toLowerCase().includes('formato')) {
    return suggestions[field] || 'Verifique o formato do campo';
  }

  if (problem.toLowerCase().includes('duplicado')) {
    return 'Nome já existe - verifique se é a mesma pessoa ou use nome completo';
  }

  return suggestions[field] || 'Verifique e corrija o valor';
};

/**
 * Provides suggestions for warnings
 */
const getSuggestionForWarning = (field: string, problem: string): string => {
  if (problem.toLowerCase().includes('duplicado')) {
    return 'Possível duplicata - verifique se é a mesma pessoa';
  }

  if (problem.toLowerCase().includes('responsável')) {
    return 'Verifique se o responsável está cadastrado ou será importado';
  }

  return 'Revisar informação';
};

/**
 * Formats complete data for debugging
 */
const formatCompleteData = (data: ProcessedStudentData | undefined): string => {
  if (!data) return 'N/A';
  return `Nome: ${data.nome || 'N/A'} | Família: ${data.familia || 'N/A'} | Batismo: ${data.data_batismo || 'N/A'} | Gênero: ${data.genero || 'N/A'} | Cargo: ${data.cargo || 'N/A'}`;
};

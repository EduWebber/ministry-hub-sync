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
 * Gets field value from row using multiple possible column names
 */
const getFieldValue = (row: any, fieldNames: string[]): any => {
  for (const fieldName of fieldNames) {
    if (row[fieldName] !== undefined && row[fieldName] !== null && row[fieldName] !== '') {
      return row[fieldName];
    }
  }
  return null;
};

/**
 * Validates and processes a single row
 */
export const processRow = (row: SpreadsheetRow, index: number): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Get field values using flexible column mapping
  const family_id = getFieldValue(row, ['family_id']);
  const user_id = getFieldValue(row, ['user_id']);
  const nome = getFieldValue(row, ['nome', 'Nome Completo', 'Nome', 'name']);
  const idade = getFieldValue(row, ['idade', 'Idade', 'age']);
  const genero = getFieldValue(row, ['genero', 'Gênero (M/F)', 'Gênero', 'Genero', 'gender']);
  const familia = getFieldValue(row, ['familia', 'Família / Agrupamento', 'Família', 'Familia', 'family']);
  const cargo = getFieldValue(row, ['cargo', 'Cargo Congregacional', 'Cargo', 'role']);
  const ativo = getFieldValue(row, ['ativo', 'Status (Ativo/Inativo)', 'Status', 'status', 'active']);
  const email = getFieldValue(row, ['email', 'E-mail', 'Email']);
  const telefone = getFieldValue(row, ['telefone', 'Telefone', 'phone']);
  const dataBatismo = getFieldValue(row, ['data_batismo', 'Data de Batismo', 'Batismo']);
  const observacoes = getFieldValue(row, ['observacoes', 'Observações', 'Observacoes', 'notes']);
  const estado_civil = getFieldValue(row, ['estado_civil']);
  const papel_familiar = getFieldValue(row, ['papel_familiar']);
  const id_pai = getFieldValue(row, ['id_pai']);
  const id_mae = getFieldValue(row, ['id_mae']);
  const id_conjuge = getFieldValue(row, ['id_conjuge']);
  const coabitacao = getFieldValue(row, ['coabitacao']);
  const menor = getFieldValue(row, ['menor']);
  const responsavel_primario = getFieldValue(row, ['responsavel_primario']);
  const responsavel_secundario = getFieldValue(row, ['responsavel_secundario']);
  const chairman = getFieldValue(row, ['chairman']);
  const pray = getFieldValue(row, ['pray']);
  const treasures = getFieldValue(row, ['treasures']);
  const gems = getFieldValue(row, ['gems']);
  const reading = getFieldValue(row, ['reading']);
  const starting = getFieldValue(row, ['starting']);
  const following = getFieldValue(row, ['following']);
  const making = getFieldValue(row, ['making']);
  const explaining = getFieldValue(row, ['explaining']);
  const talk = getFieldValue(row, ['talk']);
  
  // Required fields validation
  if (!nome || typeof nome !== 'string' || nome.trim().length < 2) {
    errors.push('Nome completo é obrigatório e deve ter pelo menos 2 caracteres');
  }
  
  if (!idade || typeof idade !== 'number' || idade < 1 || idade > 120) {
    errors.push('Idade deve ser um número entre 1 e 120');
  }
  
  if (!genero || !GENDER_MAPPING[genero]) {
    errors.push('Gênero deve ser M ou F');
  }
  
  if (!familia || typeof familia !== 'string') {
    errors.push('Família/Agrupamento é obrigatório');
  }
  
  // Cargo and status are optional in the new model; coerce if provided
  let processedCargo: string | undefined;
  if (cargo && CARGO_MAPPING[cargo]) {
    processedCargo = CARGO_MAPPING[cargo];
  }

  let processedAtivo: boolean = true;
  if (ativo !== null && ativo !== undefined && STATUS_MAPPING[String(ativo)] !== undefined) {
    processedAtivo = STATUS_MAPPING[String(ativo)];
  }
  
  // Email validation
  if (email && typeof email === 'string' && email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('E-mail inválido');
    }
  }
  
  // Phone validation
  if (telefone && typeof telefone === 'string' && telefone.trim()) {
    const phoneRegex = /^[\d\s\-()]+$/;
    if (!phoneRegex.test(telefone.trim()) || telefone.trim().length < 8) {
      errors.push('Telefone inválido');
    }
  }
  
  // Date validations
  let processedDataBatismo: string | undefined;
  if (dataBatismo && typeof dataBatismo === 'string' && dataBatismo.trim()) {
    try {
      const parsedDate = parseBrazilianDate(dataBatismo);
      if (parsedDate) {
        processedDataBatismo = format(parsedDate, 'yyyy-MM-dd');
      } else {
        warnings.push('Data de batismo inválida - será ignorada');
      }
    } catch {
      warnings.push('Data de batismo inválida - será ignorada');
    }
  }
  
  // Get birth date for validation
  const dataNascimento = getFieldValue(row, ['data_nascimento', 'Data de Nascimento', 'Nascimento']);
  let processedDataNascimento: string | undefined;
  if (dataNascimento && typeof dataNascimento === 'string' && dataNascimento.trim()) {
    try {
      const parsedDate = parseBrazilianOrIsoDate(dataNascimento);
      if (parsedDate) {
        processedDataNascimento = format(parsedDate, 'yyyy-MM-dd');
        // Age vs birth date consistency
        const calculatedAge = new Date().getFullYear() - parsedDate.getFullYear();
        const ageDiff = Math.abs(calculatedAge - idade);
        if (ageDiff > 1) {
          warnings.push(`Idade informada (${idade}) não confere com data de nascimento`);
        }
      }
    } catch {
      warnings.push('Data de nascimento inválida');
    }
  }
  
  // Minor validation
  const parenteResponsavel = getFieldValue(row, ['parente_responsavel', 'Parente Responsável', 'Responsavel', 'responsavel_primario']);
  const parentesco = getFieldValue(row, ['parentesco', 'Parentesco', 'relationship', 'papel_familiar']);
  const isMinor = idade < 18 || BOOLEAN_MAPPING[String(menor)] === true;
  if (isMinor && (!parenteResponsavel && !responsavel_primario)) {
    warnings.push('Menor de idade sem responsável definido');
  }
  
  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      warnings,
      rowIndex: index
    };
  }
  
  // Process valid data
  const processedData: ProcessedStudentData = {
    family_id: family_id || undefined,
    user_id: user_id || undefined,
    nome: nome.trim(),
    idade: idade,
    genero: GENDER_MAPPING[genero],
    email: email && typeof email === 'string' ? email.trim() || undefined : undefined,
    telefone: telefone && typeof telefone === 'string' ? telefone.trim() || undefined : undefined,
    data_batismo: processedDataBatismo,
    cargo: processedCargo as any,
    ativo: processedAtivo,
    observacoes: observacoes && typeof observacoes === 'string' ? observacoes.trim() || undefined : undefined,
    familia: familia?.trim?.() || '',
    estado_civil: estado_civil || undefined,
    papel_familiar: papel_familiar || undefined,
    id_pai: id_pai || undefined,
    id_mae: id_mae || undefined,
    id_conjuge: id_conjuge || undefined,
    coabitacao: BOOLEAN_MAPPING[String(coabitacao)] ?? undefined,
    menor: BOOLEAN_MAPPING[String(menor)] ?? undefined,
    responsavel_primario: responsavel_primario || parenteResponsavel || undefined,
    responsavel_secundario: responsavel_secundario || undefined,
    chairman: BOOLEAN_MAPPING[String(chairman)] ?? undefined,
    pray: BOOLEAN_MAPPING[String(pray)] ?? undefined,
    treasures: BOOLEAN_MAPPING[String(treasures)] ?? undefined,
    gems: BOOLEAN_MAPPING[String(gems)] ?? undefined,
    reading: BOOLEAN_MAPPING[String(reading)] ?? undefined,
    starting: BOOLEAN_MAPPING[String(starting)] ?? undefined,
    following: BOOLEAN_MAPPING[String(following)] ?? undefined,
    making: BOOLEAN_MAPPING[String(making)] ?? undefined,
    explaining: BOOLEAN_MAPPING[String(explaining)] ?? undefined,
    talk: BOOLEAN_MAPPING[String(talk)] ?? undefined,
    data_nascimento: processedDataNascimento
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
 * Parses Brazilian date or ISO-like "yyyy-MM-dd HH:mm:ss" to Date
 */
export const parseBrazilianOrIsoDate = (dateString: string): Date | null => {
  if (!dateString || typeof dateString !== 'string') return null;
  const cleanDate = dateString.trim();
  if (!cleanDate) return null;

  // Try ISO-like with time first
  try {
    const isoLike = parse(cleanDate, 'yyyy-MM-dd HH:mm:ss', new Date());
    if (isValid(isoLike)) return isoLike;
  } catch {}

  // Fallback to Brazilian formats
  return parseBrazilianDate(cleanDate);
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
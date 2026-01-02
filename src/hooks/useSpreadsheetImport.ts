import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { readExcelFile, processRow } from '@/utils/spreadsheetProcessor';
import { ValidationResult, ProcessedStudentData, ImportSummary } from '@/types/spreadsheet';

const BATCH_SIZE = 10; // Process in batches of 10

export interface UseSpreadsheetImportReturn {
  validationResults: ValidationResult[];
  isProcessing: boolean;
  isImporting: boolean;
  importSummary: ImportSummary | null;
  error: string | null;
  processFile: (file: File) => Promise<void>;
  importStudents: () => Promise<void>;
  reset: () => void;
  getStatistics: () => {
    total: number;
    valid: number;
    invalid: number;
    warnings: number;
    successRate: number;
  };
}

export function useSpreadsheetImport(): UseSpreadsheetImportReturn {
  const { user, profile } = useAuth();
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setValidationResults([]);
    setImportSummary(null);

    try {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel' // .xls
      ];
      
      if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        throw new Error('Arquivo inválido. Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
      }

      // Validate file size (10MB max)
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_SIZE) {
        throw new Error(`Arquivo muito grande. Limite máximo: 10MB`);
      }

      // Read Excel file
      const rows = await readExcelFile(file);

      if (!rows || rows.length === 0) {
        throw new Error('Planilha está vazia. Adicione pelo menos uma linha de dados.');
      }

      // Process each row
      const results: ValidationResult[] = rows.map((row, index) => processRow(row, index));

      setValidationResults(results);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao processar arquivo';
      setError(errorMessage);
      console.error('Error processing file:', err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const importStudents = useCallback(async () => {
    if (!user || !profile) {
      setError('Usuário não autenticado');
      return;
    }

    // Get valid students (only those that passed validation)
    const validResults = validationResults.filter(result => result.isValid && result.data);

    if (validResults.length === 0) {
      setError('Nenhum estudante válido para importar');
      return;
    }

    setIsImporting(true);
    setError(null);

    const validData = validResults.map(result => result.data!).filter(Boolean) as ProcessedStudentData[];
    let importedCount = 0;
    const importErrors: ValidationResult[] = [];

    try {
      // Process in batches
      for (let i = 0; i < validData.length; i += BATCH_SIZE) {
        const batch = validData.slice(i, i + BATCH_SIZE);

        // Map to Supabase schema
        const batchForInsert = batch.map(student => {
          // Build qualificacoes array from boolean fields
          const qualificacoes: string[] = [];
          if (student.chairman) qualificacoes.push('chairman');
          if (student.pray) qualificacoes.push('pray');
          if (student.treasures) qualificacoes.push('treasures');
          if (student.gems) qualificacoes.push('gems');
          if (student.reading) qualificacoes.push('reading');
          if (student.starting) qualificacoes.push('starting');
          if (student.following) qualificacoes.push('following');
          if (student.making) qualificacoes.push('making');
          if (student.explaining) qualificacoes.push('explaining');
          if (student.talk) qualificacoes.push('talk');

          return {
            nome: student.nome,
            idade: student.idade,
            genero: student.genero,
            email: student.email || null,
            telefone: student.telefone || null,
            data_batismo: student.data_batismo || null,
            data_nascimento: student.data_nascimento || null,
            cargo: student.cargo || 'estudante_novo',
            ativo: student.ativo !== undefined ? student.ativo : true,
            observacoes: student.observacoes || null,
            familia: student.familia || null,
            congregacao_id: profile.congregacao_id || null,
            instrutor_id: profile.id || null,
            qualificacoes: qualificacoes.length > 0 ? qualificacoes : [],
            // Note: parent_id and other relationship fields (id_pai, id_mae, etc.) would need
            // to be resolved by name lookup and are not included in initial import
          };
        });

        // Insert batch
        const { data, error: batchError } = await supabase
          .from('estudantes')
          .insert(batchForInsert)
          .select();

        if (batchError) {
          console.error('Batch import error:', batchError);
          // Record errors for this batch
          batch.forEach((student, batchIndex) => {
            importErrors.push({
              isValid: false,
              errors: [`Erro ao importar: ${batchError.message}`],
              warnings: [],
              rowIndex: i + batchIndex,
              data: student
            });
          });
        } else {
          importedCount += data?.length || 0;
        }

        // Small delay between batches to avoid overwhelming the database
        if (i + BATCH_SIZE < validData.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Create import summary
      const summary: ImportSummary = {
        totalRows: validationResults.length,
        validRows: validResults.length,
        invalidRows: validationResults.filter(r => !r.isValid).length,
        imported: importedCount,
        errors: [
          ...validationResults.filter(r => !r.isValid),
          ...importErrors
        ],
        warnings: validationResults.filter(r => r.warnings.length > 0)
      };

      setImportSummary(summary);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao importar';
      setError(errorMessage);
      console.error('Error importing students:', err);
    } finally {
      setIsImporting(false);
    }
  }, [validationResults, user, profile]);

  const reset = useCallback(() => {
    setValidationResults([]);
    setImportSummary(null);
    setError(null);
    setIsProcessing(false);
    setIsImporting(false);
  }, []);

  const getStatistics = useCallback(() => {
    const total = validationResults.length;
    const valid = validationResults.filter(r => r.isValid).length;
    const invalid = validationResults.filter(r => !r.isValid).length;
    const warnings = validationResults.filter(r => r.warnings.length > 0).length;
    const successRate = total > 0 ? Math.round((valid / total) * 100) : 0;

    return {
      total,
      valid,
      invalid,
      warnings,
      successRate
    };
  }, [validationResults]);

  return {
    validationResults,
    isProcessing,
    isImporting,
    importSummary,
    error,
    processFile,
    importStudents,
    reset,
    getStatistics
  };
}


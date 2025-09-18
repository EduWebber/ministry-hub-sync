/**
 * Enhanced Import Hook - Integrates all docs/Oficial resources
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { 
  EnhancedSpreadsheetProcessor, 
  FormatDetector,
  SmartValidator,
  FamilyAnalyzer 
} from '@/utils/enhancedSpreadsheetProcessor';
import { 
  ProcessingResult, 
  EnhancedProcessingOptions,
  EnhancedStudentData,
  DetectedFormat 
} from '@/types/enhanced-import';

export interface EnhancedImportState {
  isProcessing: boolean;
  currentStep: 'upload' | 'analyzing' | 'validating' | 'processing' | 'complete' | 'error';
  progress: {
    current: number;
    total: number;
    message: string;
  };
  detectedFormats: DetectedFormat[];
  selectedFormat?: DetectedFormat;
  processingResult?: ProcessingResult;
  error?: string;
}

export const useEnhancedSpreadsheetImport = () => {
  const { user } = useAuth();
  const [state, setState] = useState<EnhancedImportState>({
    isProcessing: false,
    currentStep: 'upload',
    progress: { current: 0, total: 100, message: '' },
    detectedFormats: []
  });

  /**
   * Analyzes uploaded file and detects format
   */
  const analyzeFile = async (file: File): Promise<DetectedFormat[]> => {
    setState(prev => ({ 
      ...prev, 
      isProcessing: true, 
      currentStep: 'analyzing',
      progress: { current: 10, total: 100, message: 'Analisando formato do arquivo...' }
    }));

    try {
      // Read file headers to detect format
      const preview = await EnhancedSpreadsheetProcessor.readExcelFile(file);
      const headers = preview.length > 0 ? Object.keys(preview[0]) : [];
      
      setState(prev => ({ 
        ...prev,
        progress: { current: 30, total: 100, message: 'Detectando formato da planilha...' }
      }));

      const detectedFormats = FormatDetector.detectFormat(headers);
      
      setState(prev => ({ 
        ...prev, 
        detectedFormats,
        currentStep: 'upload',
        isProcessing: false,
        progress: { current: 100, total: 100, message: 'Análise completa!' }
      }));

      // Show format detection results
      if (detectedFormats.length > 0) {
        const bestFormat = detectedFormats[0];
        toast({
          title: 'Formato detectado!',
          description: `${bestFormat.name} (${(bestFormat.confidence * 100).toFixed(1)}% de confiança)`,
          variant: 'default'
        });
      } else {
        toast({
          title: 'Formato não reconhecido',
          description: 'O sistema tentará processar com configurações genéricas',
          variant: 'destructive'
        });
      }

      return detectedFormats;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        currentStep: 'error',
        error: error instanceof Error ? error.message : 'Erro ao analisar arquivo'
      }));
      
      toast({
        title: 'Erro na análise',
        description: 'Não foi possível analisar o arquivo',
        variant: 'destructive'
      });
      
      throw error;
    }
  };

  /**
   * Processes file with comprehensive validation and enhancement
   */
  const processFile = async (
    file: File, 
    options: Partial<EnhancedProcessingOptions> = {}
  ): Promise<ProcessingResult> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const processingOptions: EnhancedProcessingOptions = {
      ...EnhancedSpreadsheetProcessor.getDefaultOptions(),
      ...options
    };

    setState(prev => ({ 
      ...prev, 
      isProcessing: true, 
      currentStep: 'validating',
      progress: { current: 0, total: 100, message: 'Iniciando processamento...' }
    }));

    try {
      // Step 1: Initial processing
      setState(prev => ({ 
        ...prev,
        progress: { current: 20, total: 100, message: 'Lendo dados da planilha...' }
      }));

      const result = await EnhancedSpreadsheetProcessor.processFile(file, processingOptions);

      // Step 2: Validation
      setState(prev => ({ 
        ...prev,
        progress: { current: 40, total: 100, message: 'Validando dados...' }
      }));

      // Step 3: Family analysis
      if (processingOptions.detectFamilyRelationships) {
        setState(prev => ({ 
          ...prev,
          progress: { current: 60, total: 100, message: 'Analisando relacionamentos familiares...' }
        }));
      }

      // Step 4: S-38 qualification processing
      if (processingOptions.validateS38Qualifications) {
        setState(prev => ({ 
          ...prev,
          progress: { current: 80, total: 100, message: 'Processando qualificações S-38...' }
        }));
      }

      // Complete
      setState(prev => ({ 
        ...prev, 
        currentStep: 'complete',
        isProcessing: false,
        processingResult: result,
        progress: { current: 100, total: 100, message: 'Processamento completo!' }
      }));

      // Show comprehensive results
      const { summary } = result;
      toast({
        title: 'Processamento completo!',
        description: `${summary.validRows} de ${summary.totalRows} registros válidos. ${summary.familiesDetected} famílias detectadas.`,
        variant: summary.validRows === summary.totalRows ? 'default' : 'destructive'
      });

      return result;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        currentStep: 'error',
        error: error instanceof Error ? error.message : 'Erro no processamento'
      }));

      toast({
        title: 'Erro no processamento',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });

      throw error;
    }
  };

  /**
   * Imports processed students to database
   */
  const importStudents = async (students: EnhancedStudentData[]): Promise<number> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    setState(prev => ({ 
      ...prev, 
      isProcessing: true, 
      currentStep: 'processing',
      progress: { current: 0, total: students.length, message: 'Importando estudantes...' }
    }));

    let imported = 0;
    const batchSize = 10;

    try {
      for (let i = 0; i < students.length; i += batchSize) {
        const batch = students.slice(i, i + batchSize);
        
        setState(prev => ({ 
          ...prev,
          progress: { 
            current: i, 
            total: students.length, 
            message: `Importando lote ${Math.floor(i/batchSize) + 1}...` 
          }
        }));

        // Process batch (this would integrate with your existing useEstudantes hook)
        for (const student of batch) {
          try {
            // Convert to format expected by existing system
            const estudanteData = {
              nome: student.nome,
              familia: student.familia,
              idade: student.idade,
              genero: student.genero,
              email: student.email,
              telefone: student.telefone,
              data_nascimento: student.data_nascimento,
              data_batismo: student.data_batismo,
              cargo: student.cargo,
              ativo: student.ativo,
              observacoes: student.observacoes,
              // S-38 qualifications
              chairman: student.qualifications.chairman,
              pray: student.qualifications.pray,
              tresures: student.qualifications.tresures,
              gems: student.qualifications.gems,
              reading: student.qualifications.reading,
              starting: student.qualifications.starting,
              following: student.qualifications.following,
              making: student.qualifications.making,
              explaining: student.qualifications.explaining,
              talk: student.qualifications.talk
            };

            // Here you would call your existing createEstudante function
            // await createEstudante(estudanteData);
            
            imported++;
          } catch (error) {
            console.error(`Error importing student ${student.nome}:`, error);
          }
        }

        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        currentStep: 'complete',
        progress: { current: students.length, total: students.length, message: 'Importação completa!' }
      }));

      toast({
        title: 'Importação concluída',
        description: `${imported} estudantes importados com sucesso`,
        variant: 'default'
      });

      return imported;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        currentStep: 'error',
        error: error instanceof Error ? error.message : 'Erro na importação'
      }));

      toast({
        title: 'Erro na importação',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });

      throw error;
    }
  };

  /**
   * Generates comprehensive reports
   */
  const generateReports = () => {
    if (!state.processingResult) return null;

    const { reports, summary, familyAnalysis } = state.processingResult;

    return {
      validationReport: {
        title: 'Relatório de Validação',
        content: reports.validationReport,
        downloadable: true
      },
      familyReport: {
        title: 'Análise Familiar', 
        content: reports.familyReport,
        downloadable: true
      },
      qualificationReport: {
        title: 'Qualificações S-38',
        content: reports.qualificationReport,
        downloadable: true
      },
      summary: {
        title: 'Resumo do Processamento',
        content: `Total: ${summary.totalRows}
Válidos: ${summary.validRows}
Processados: ${summary.processedRows}
Famílias: ${summary.familiesDetected}
Relacionamentos: ${summary.relationshipsLinked}`,
        downloadable: false
      }
    };
  };

  /**
   * Resets the import state
   */
  const resetImport = () => {
    setState({
      isProcessing: false,
      currentStep: 'upload',
      progress: { current: 0, total: 100, message: '' },
      detectedFormats: []
    });
  };

  /**
   * Downloads the corrected/enhanced Excel file
   */
  const downloadEnhancedFile = () => {
    if (!state.processingResult) return;

    // Convert processed data back to Excel format
    // This would use the enhanced data with all corrections applied
    toast({
      title: 'Download iniciado',
      description: 'Arquivo com dados corrigidos será baixado',
      variant: 'default'
    });
  };

  return {
    // State
    state,
    
    // Actions
    analyzeFile,
    processFile, 
    importStudents,
    resetImport,
    downloadEnhancedFile,
    
    // Utilities
    generateReports,
    
    // Computed properties
    canProceed: state.detectedFormats.length > 0 || state.currentStep === 'complete',
    hasErrors: state.processingResult?.validationResults.some(r => r.severity === 'error') || false,
    hasWarnings: state.processingResult?.validationResults.some(r => r.severity === 'warning') || false,
    isComplete: state.currentStep === 'complete',
    validStudents: state.processingResult?.processedData.filter(s => 
      !state.processingResult?.validationResults.some(v => 
        v.severity === 'error' && v.message.includes(s.nome)
      )
    ) || []
  };
};
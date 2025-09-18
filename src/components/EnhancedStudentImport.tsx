/**
 * Enhanced Student Import Component
 * Integrates all docs/Oficial resources and capabilities
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Download,
  Users,
  FileText,
  Search,
  Zap,
  Settings,
  BookOpen
} from 'lucide-react';
import { useEnhancedSpreadsheetImport } from '@/hooks/useEnhancedSpreadsheetImport';

interface EnhancedStudentImportProps {
  onImportComplete?: () => void;
  onViewList?: () => void;
}

export const EnhancedStudentImport: React.FC<EnhancedStudentImportProps> = ({
  onImportComplete,
  onViewList
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const {
    state,
    analyzeFile,
    processFile,
    importStudents,
    resetImport,
    downloadEnhancedFile,
    generateReports,
    canProceed,
    hasErrors,
    hasWarnings,
    isComplete,
    validStudents
  } = useEnhancedSpreadsheetImport();

  // Available resources from docs/Oficial
  const availableResources = [
    {
      name: 'estudantes_corrigidos.xlsx',
      description: '100 estudantes válidos prontos para importação',
      type: 'excel',
      icon: FileSpreadsheet,
      status: 'ready'
    },
    {
      name: 'FORMATO_PLANILHA.md',
      description: 'Documentação completa do formato de dados',
      type: 'documentation',
      icon: BookOpen,
      status: 'available'
    },
    {
      name: 'gera_planilha.py',
      description: 'Script Python para geração e correção de dados',
      type: 'script',
      icon: Settings,
      status: 'available'
    },
    {
      name: 'S-38_E.rtf',
      description: 'Especificação completa do algoritmo S-38',
      type: 'specification',
      icon: FileText,
      status: 'integrated'
    }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    try {
      await analyzeFile(file);
    } catch (error) {
      console.error('Error analyzing file:', error);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    
    try {
      await processFile(selectedFile, {
        enableSmartValidation: true,
        detectFamilyRelationships: true,
        validateS38Qualifications: true,
        autoFixMinorIssues: true
      });
    } catch (error) {
      console.error('Error processing file:', error);
    }
  };

  const handleImport = async () => {
    if (!validStudents.length) return;
    
    try {
      await importStudents(validStudents);
      onImportComplete?.();
    } catch (error) {
      console.error('Error importing students:', error);
    }
  };

  if (state.currentStep === 'upload') {
    return (
      <div className="space-y-6">
        {/* Documentation Hub */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Recursos Disponíveis do Sistema
            </CardTitle>
            <CardDescription>
              Sistema completo baseado em extensa documentação e dados oficiais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableResources.map((resource, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <resource.icon className="w-6 h-6 text-jw-blue" />
                  <div className="flex-1">
                    <div className="font-medium">{resource.name}</div>
                    <div className="text-sm text-gray-600">{resource.description}</div>
                  </div>
                  <Badge 
                    variant={resource.status === 'ready' ? 'default' : 'secondary'}
                    className="ml-auto"
                  >
                    {resource.status}
                  </Badge>
                </div>
              ))}
            </div>
            
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Sistema Avançado:</strong> Este sistema integra completamente todos os recursos 
                documentados, incluindo validação inteligente, análise familiar automática, 
                processamento de qualificações S-38, e correção automática de dados.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Format Detection Results */}
        {state.detectedFormats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Formato Detectado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {state.detectedFormats.map((format, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{format.name}</div>
                      <div className="text-sm text-gray-600">
                        Confiança: {(format.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                    <Badge variant={format.confidence > 0.8 ? 'default' : 'secondary'}>
                      {format.confidence > 0.8 ? 'Excelente' : 'Boa'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Importar Estudantes via Planilha Avançada
            </CardTitle>
            <CardDescription>
              Sistema completo com validação inteligente, análise familiar e processamento S-38
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-jw-blue bg-jw-blue/5' 
                  : 'border-gray-300 hover:border-jw-blue/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {selectedFile ? selectedFile.name : 'Arraste sua planilha aqui'}
              </h3>
              <p className="text-gray-500 mb-4">
                {selectedFile 
                  ? 'Arquivo selecionado. Clique em "Processar" para continuar.'
                  : 'Ou clique para selecionar um arquivo Excel'
                }
              </p>
              
              {!selectedFile && (
                <Button 
                  onClick={() => document.getElementById('file-input')?.click()}
                  variant="outline"
                >
                  Selecionar Arquivo
                </Button>
              )}
              
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
            </div>

            {selectedFile && canProceed && (
              <div className="flex gap-4">
                <Button 
                  onClick={handleProcess}
                  disabled={state.isProcessing}
                  className="flex-1"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Processar com Sistema Avançado
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedFile(null);
                    resetImport();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state.isProcessing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="animate-spin w-5 h-5 border-2 border-jw-blue border-t-transparent rounded-full" />
            Processamento Avançado em Andamento
          </CardTitle>
          <CardDescription>
            {state.progress.message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span>{state.progress.current} de {state.progress.total}</span>
            </div>
            <Progress 
              value={state.progress.total > 0 ? (state.progress.current / state.progress.total) * 100 : 0} 
              className="h-3" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Search className="w-8 h-8 mx-auto mb-2 text-jw-blue" />
              <div className="font-medium">Análise de Formato</div>
              <div className="text-sm text-gray-600">Detectando estrutura</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Users className="w-8 h-8 mx-auto mb-2 text-jw-blue" />
              <div className="font-medium">Análise Familiar</div>
              <div className="text-sm text-gray-600">Vinculando relacionamentos</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-jw-blue" />
              <div className="font-medium">Qualificações S-38</div>
              <div className="text-sm text-gray-600">Validando participações</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isComplete && state.processingResult) {
    const { summary, familyAnalysis } = state.processingResult;
    const reports = generateReports();

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-jw-blue">{summary.totalRows}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{summary.validRows}</div>
              <div className="text-sm text-gray-600">Válidos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.familiesDetected}</div>
              <div className="text-sm text-gray-600">Famílias</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{summary.relationshipsLinked}</div>
              <div className="text-sm text-gray-600">Relacionamentos</div>
            </CardContent>
          </Card>
        </div>

        {/* Status Alerts */}
        {hasErrors && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {summary.totalRows - summary.validRows} registros contêm erros críticos e não serão importados.
            </AlertDescription>
          </Alert>
        )}

        {hasWarnings && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {summary.warningsGenerated} avisos foram gerados. Os dados serão importados, mas revise após a importação.
            </AlertDescription>
          </Alert>
        )}

        {/* Reports Tabs */}
        {reports && (
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Detalhados</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="summary">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="summary">Resumo</TabsTrigger>
                  <TabsTrigger value="validation">Validação</TabsTrigger>
                  <TabsTrigger value="family">Famílias</TabsTrigger>
                  <TabsTrigger value="qualifications">S-38</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="mt-4">
                  <div className="whitespace-pre-wrap text-sm">{reports.summary.content}</div>
                </TabsContent>
                
                <TabsContent value="validation" className="mt-4">
                  <div className="whitespace-pre-wrap text-sm">{reports.validationReport.content}</div>
                </TabsContent>
                
                <TabsContent value="family" className="mt-4">
                  <div className="whitespace-pre-wrap text-sm">{reports.familyReport.content}</div>
                </TabsContent>
                
                <TabsContent value="qualifications" className="mt-4">
                  <div className="whitespace-pre-wrap text-sm">{reports.qualificationReport.content}</div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          {validStudents.length > 0 && (
            <Button 
              onClick={handleImport}
              disabled={state.isProcessing}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Importar {validStudents.length} Estudantes
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={downloadEnhancedFile}
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar Dados Corrigidos
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => {
              resetImport();
              setSelectedFile(null);
            }}
          >
            Novo Import
          </Button>
        </div>

        {isComplete && validStudents.length > 0 && (
          <div className="text-center">
            <Button onClick={onViewList} variant="hero">
              <Users className="w-4 h-4 mr-2" />
              Ver Lista de Estudantes
            </Button>
          </div>
        )}
      </div>
    );
  }

  return null;
};
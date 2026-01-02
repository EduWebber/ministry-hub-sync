import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSpreadsheetImport } from '@/hooks/useSpreadsheetImport';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  X,
  FileCheck,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface SpreadsheetUploadProps {
  onImportComplete?: () => void;
}

export default function SpreadsheetUpload({ onImportComplete }: SpreadsheetUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    validationResults,
    isProcessing,
    isImporting,
    importSummary,
    error,
    processFile,
    importStudents,
    reset,
    getStatistics
  } = useSpreadsheetImport();

  const stats = getStatistics();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFileName(file.name);
      await processFile(file);
    }
  }, [processFile]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFileName(file.name);
      await processFile(file);
    }
  }, [processFile]);

  const handleImport = useCallback(async () => {
    try {
      await importStudents();
      
      if (importSummary && importSummary.imported > 0) {
        toast({
          title: 'Importação concluída',
          description: `${importSummary.imported} estudante(s) importado(s) com sucesso.`,
        });
        
        if (onImportComplete) {
          onImportComplete();
        }
      }
    } catch (err) {
      toast({
        title: 'Erro na importação',
        description: 'Ocorreu um erro ao importar os estudantes.',
        variant: 'destructive'
      });
    }
  }, [importStudents, importSummary, onImportComplete, toast]);

  const handleReset = useCallback(() => {
    reset();
    setSelectedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [reset]);

  // Empty state - no file selected yet
  if (!selectedFileName && !isProcessing && validationResults.length === 0 && !importSummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Importar Planilha Excel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
              isDragOver
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
            )}
          >
            <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Arraste e solte sua planilha aqui</h3>
            <p className="text-gray-600 mb-4">ou</p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
            >
              <Upload className="w-4 h-4 mr-2" />
              Selecionar Arquivo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-sm text-gray-500 mt-4">
              Formatos suportados: .xlsx, .xls (máximo 10MB)
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Processing state
  if (isProcessing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Processando arquivo...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-blue-500" />
              <div>
                <p className="font-medium">{selectedFileName}</p>
                <p className="text-sm text-gray-500">Validando dados...</p>
              </div>
            </div>
            <Progress value={50} className="w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error && validationResults.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Erro ao processar arquivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={handleReset} className="mt-4" variant="outline">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Preview state - show validation results
  if (validationResults.length > 0 && !isImporting && !importSummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-green-500" />
              Prévia da Importação
            </div>
            <Button
              onClick={handleReset}
              variant="ghost"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700 mb-1">{stats.valid}</div>
              <div className="text-sm text-green-600">Válidos</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-700 mb-1">{stats.invalid}</div>
              <div className="text-sm text-red-600">Com Erros</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700 mb-1">{stats.warnings}</div>
              <div className="text-sm text-yellow-600">Com Avisos</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-700 mb-1">{stats.successRate}%</div>
              <div className="text-sm text-blue-600">Taxa de Sucesso</div>
            </div>
          </div>

          {/* Error list (if any) */}
          {stats.invalid > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{stats.invalid} registro(s) com erros.</strong> Estes registros não serão importados.
                Corrija-os na planilha e tente novamente.
              </AlertDescription>
            </Alert>
          )}

          {/* Warning list (if any) */}
          {stats.warnings > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{stats.warnings} registro(s) com avisos.</strong> Estes registros serão importados,
                mas contêm inconsistências menores. Revise se necessário.
              </AlertDescription>
            </Alert>
          )}

          {/* File info */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-sm">{selectedFileName}</p>
                <p className="text-xs text-gray-500">{stats.total} registro(s) total(is)</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleImport}
              disabled={stats.valid === 0}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar {stats.valid} Estudante(s)
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
            >
              Cancelar
            </Button>
          </div>

          {stats.valid === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nenhum registro válido para importar. Corrija os erros na planilha e tente novamente.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  // Importing state
  if (isImporting) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Importando estudantes...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-blue-500" />
              <div>
                <p className="font-medium">Importando {stats.valid} estudante(s)</p>
                <p className="text-sm text-gray-500">Aguarde, isso pode levar alguns instantes...</p>
              </div>
            </div>
            <Progress value={75} className="w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success state - import complete
  if (importSummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Importação Concluída
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700 mb-1">{importSummary.imported}</div>
              <div className="text-sm text-green-600">Importados</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-700 mb-1">{importSummary.totalRows}</div>
              <div className="text-sm text-blue-600">Total Analisados</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-700 mb-1">{importSummary.validRows}</div>
              <div className="text-sm text-gray-600">Válidos</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-700 mb-1">{importSummary.invalidRows}</div>
              <div className="text-sm text-red-600">Com Erros</div>
            </div>
          </div>

          {importSummary.imported > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Sucesso!</strong> {importSummary.imported} estudante(s) importado(s) com sucesso.
              </AlertDescription>
            </Alert>
          )}

          {importSummary.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{importSummary.errors.length} erro(s) durante a importação.</strong>
                Alguns registros não puderam ser importados.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1"
            >
              Importar Outra Planilha
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}


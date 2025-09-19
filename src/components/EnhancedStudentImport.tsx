import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface EnhancedStudentImportProps {
  onImportComplete: () => void;
  onViewList: () => void;
}

export default function EnhancedStudentImport({ onImportComplete, onViewList }: EnhancedStudentImportProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar Estudantes</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => {
          // Simulate import completion
          onImportComplete();
          onViewList();
        }}>
          <Upload className="h-4 w-4 mr-2" />
          Importar Planilha
        </Button>
      </CardContent>
    </Card>
  );
}
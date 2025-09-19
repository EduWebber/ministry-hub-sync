import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface EnhancedStudentImportProps {
  onImport: (data: any) => void;
}

export default function EnhancedStudentImport({ onImport }: EnhancedStudentImportProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar Estudantes</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => onImport({})}>
          <Upload className="h-4 w-4 mr-2" />
          Importar Planilha
        </Button>
      </CardContent>
    </Card>
  );
}
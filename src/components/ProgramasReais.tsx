import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface Programa {
  id: string;
  titulo: string;
  mes_ano: string | null;
  descricao: string | null;
  status: string | null;
  arquivo_nome: string | null;
}

const ProgramasReais: React.FC = () => {
  const { data: programas = [], isLoading, error } = useQuery({
    queryKey: ['programas-reais'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programas_ministeriais')
        .select('id, titulo, mes_ano, descricao, status, arquivo_nome')
        .limit(20);
      
      if (error) throw error;
      return (data || []) as Programa[];
    }
  });

  if (isLoading) {
    return <div className="text-sm text-gray-600">Carregando programações reais...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded">
        Erro ao carregar programações: {String(error)}
      </div>
    );
  }

  if (programas.length === 0) {
    return (
      <div className="p-3 mb-4 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded">
        Nenhuma programação encontrada no banco de dados.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {programas.map((programa) => (
        <Card key={programa.id} className="border-blue-100">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" /> 
              {programa.titulo || programa.mes_ano || 'Programa'}
            </CardTitle>
            {programa.mes_ano && (
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {programa.mes_ano}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {programa.descricao && (
                <p className="text-sm text-gray-600">{programa.descricao}</p>
              )}
              {programa.arquivo_nome && (
                <p className="text-xs text-gray-500">Arquivo: {programa.arquivo_nome}</p>
              )}
              <div className="text-xs text-gray-500">
                Status: {programa.status || 'Rascunho'}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProgramasReais;
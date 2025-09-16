import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, BookOpen } from 'lucide-react';
import { useProgramas } from '@/hooks/useProgramas';

const ProgramasReais: React.FC = () => {
  const { programas, loading, error } = useProgramas();

  if (loading) {
    return <div className="text-sm text-gray-600">Carregando programações reais...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded">
        Erro ao carregar programações: {error}
      </div>
    );
  }

  if (programas.length === 0) {
    return (
      <div className="p-3 mb-4 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded">
        Nenhuma programação encontrada no banco de dados. O sistema está usando dados reais do Supabase.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {programas.map((programa) => (
        <Card key={programa.id} className="border-blue-100">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" /> {programa.mes_ano}
            </CardTitle>
            <div className="text-sm text-gray-600">{programa.arquivo_nome}</div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {programa.semanas.map((semana, idx) => (
                <div key={semana.id}>
                  <div className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    Semana {semana.semana_numero} — {semana.data_inicio}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{semana.tema_semana}</div>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
                    {semana.partes.map((parte) => (
                      <li key={parte.id}>
                        <span className="font-medium">{parte.titulo}</span>
                        {parte.duracao_minutos ? ` — ${parte.duracao_minutos} min` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProgramasReais;
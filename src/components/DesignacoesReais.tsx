import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, BookOpen } from 'lucide-react';
import { useDesignacoes } from '@/hooks/useDesignacoes';

const DesignacoesReais: React.FC = () => {
  const { designacoes, loading, error } = useDesignacoes();

  if (loading) {
    return <div className="text-sm text-gray-600">Carregando designações reais...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded">
        Erro ao carregar designações: {error}
      </div>
    );
  }

  if (designacoes.length === 0) {
    return (
      <div className="p-3 mb-4 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded">
        Nenhuma designação encontrada no banco de dados. O sistema está usando dados reais do Supabase.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {designacoes.map((designacao) => (
          <Card key={designacao.id} className="border-blue-100">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" /> 
                {designacao.parte?.titulo || 'Parte Ministerial'}
              </CardTitle>
              <div className="text-sm text-gray-600">
                {designacao.parte?.duracao_minutos ? `${designacao.parte.duracao_minutos} min` : ''}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-600" />
                    Estudante Principal
                  </div>
                  <div className="text-sm text-gray-700">
                    {designacao.estudante?.profile_id || designacao.estudante_id || 'Não atribuído'}
                  </div>
                </div>
                
                {designacao.ajudante && (
                  <div>
                    <div className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-600" />
                      Ajudante
                    </div>
                    <div className="text-sm text-gray-700">
                      {designacao.ajudante.profile_id || designacao.ajudante_id}
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-600" />
                    Status
                  </div>
                  <div className="text-sm text-gray-700">
                    {designacao.status || 'Designado'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DesignacoesReais;
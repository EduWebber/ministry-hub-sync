import React, { useState, useEffect } from 'react';
import { useOfflineData } from '@/hooks/useOfflineData';
import { useOffline } from '@/hooks/useOffline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Download, 
  AlertCircle,
  Calendar,
  User,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Define types for the offline data structure based on what's actually stored
interface OfflineEstudante {
  id: string;
  profile_id?: string;
  [key: string]: any; // Allow other properties
}

interface OfflineProfile {
  id: string;
  nome: string;
  [key: string]: any; // Allow other properties
}

interface OfflinePrograma {
  id: string;
  data_inicio_semana: string;
  mes_apostila: string;
  status: string;
  [key: string]: any; // Allow other properties
}

interface OfflineDesignacao {
  id: string;
  estudante_id: string;
  ajudante_id?: string;
  numero_parte: number;
  titulo_parte: string;
  tipo_parte: string;
  tempo_minutos: number;
  confirmado: boolean;
  programa_id: string;
  [key: string]: any; // Allow other properties
}

const OfflineDesignacoes: React.FC = () => {
  const { 
    estudantes, 
    programas, 
    designacoes: rawDesignacoes, 
    isOnline, 
    isLoaded, 
    error,
    refreshData 
  } = useOfflineData();
  
  const { 
    isOfflineMode, 
    downloadOfflineData, 
    isDownloading,
    lastSync
  } = useOffline();
  
  const [filteredProgramas, setFilteredProgramas] = useState<OfflinePrograma[]>([]);
  const [selectedPrograma, setSelectedPrograma] = useState<OfflinePrograma | null>(null);
  const [programaDesignacoes, setProgramaDesignacoes] = useState<OfflineDesignacao[]>([]);

  // Filter programas to only show future ones
  useEffect(() => {
    if (programas.length > 0) {
      const now = new Date();
      const futureProgramas = programas.filter(programa => 
        new Date(programa.data_inicio_semana) >= now
      ) as OfflinePrograma[];
      setFilteredProgramas(futureProgramas);
      
      // Select the first future programa by default
      if (futureProgramas.length > 0 && !selectedPrograma) {
        setSelectedPrograma(futureProgramas[0]);
      }
    }
  }, [programas, selectedPrograma]);

  // Filter designacoes for selected programa
  useEffect(() => {
    if (selectedPrograma && rawDesignacoes.length > 0) {
      // Transform the raw designacoes to match the offline structure
      const transformedDesignacoes = rawDesignacoes.map(d => ({
        id: d.id,
        estudante_id: d.estudante_id,
        ajudante_id: d.ajudante_id || undefined,
        numero_parte: 0, // This would come from parte details
        titulo_parte: '', // This would come from parte details
        tipo_parte: '', // This would come from parte details
        tempo_minutos: 0, // This would come from parte details
        confirmado: d.status === 'confirmado',
        programa_id: '', // This needs to be set correctly
        ...d
      })) as OfflineDesignacao[];
      
      const filtered = transformedDesignacoes
        .filter(d => d.programa_id === selectedPrograma.id);
      
      setProgramaDesignacoes(filtered);
    }
  }, [selectedPrograma, rawDesignacoes]);

  const handleDownloadOfflineData = async () => {
    const success = await downloadOfflineData();
    if (success) {
      refreshData();
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  // Get student name by ID
  const getStudentName = (studentId: string): string => {
    const student = estudantes.find(e => e.id === studentId);
    // Since the estudante structure doesn't have 'nome', we'll need to get it from profiles
    // For now, we'll just return the student ID as a fallback
    return student ? `Estudante ${student.id.substring(0, 8)}` : 'Estudante não encontrado';
  };

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-500" />
          )}
          <span className="font-medium">
            {isOnline ? 'Online' : 'Offline'}
          </span>
          {lastSync && (
            <span className="text-sm text-gray-500">
              Última sincronização: {format(new Date(lastSync), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshData}
            disabled={!isOnline}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownloadOfflineData}
            disabled={isDownloading || !isOnline}
          >
            {isDownloading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isDownloading ? 'Baixando...' : 'Baixar para offline'}
          </Button>
        </div>
      </div>

      {/* Offline Mode Alert */}
      {isOfflineMode && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertTitle>Modo Offline</AlertTitle>
          <AlertDescription>
            Você está visualizando dados salvos localmente. Conecte-se à internet para sincronizar com o servidor.
          </AlertDescription>
        </Alert>
      )}

      {/* Programas Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Programas Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProgramas.length === 0 ? (
            <p className="text-gray-500">Nenhum programa futuro encontrado.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProgramas.map(programa => (
                <Card 
                  key={programa.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    selectedPrograma?.id === programa.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedPrograma(programa)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          {format(new Date(programa.data_inicio_semana), "dd 'de' MMMM", { locale: ptBR })}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {programa.mes_apostila}
                        </p>
                      </div>
                      <Badge variant={programa.status === 'gerado' ? 'default' : 'secondary'}>
                        {programa.status === 'gerado' ? 'Gerado' : 'Pendente'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Designacoes for Selected Programa */}
      {selectedPrograma && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Designações - {format(new Date(selectedPrograma.data_inicio_semana), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {programaDesignacoes.length === 0 ? (
              <p className="text-gray-500">Nenhuma designação encontrada para este programa.</p>
            ) : (
              <div className="space-y-4">
                {programaDesignacoes.map(designacao => (
                  <Card key={designacao.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">
                            Parte {designacao.numero_parte || 'N/A'} - {designacao.titulo_parte || 'Sem título'}
                          </h3>
                          <p className="text-sm text-gray-500 capitalize">
                            {designacao.tipo_parte ? designacao.tipo_parte.replace('_', ' ') : 'Tipo não definido'}
                          </p>
                          
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center text-sm">
                              <User className="h-4 w-4 mr-2" />
                              <span>
                                {getStudentName(designacao.estudante_id)}
                              </span>
                            </div>
                            
                            {designacao.ajudante_id && (
                              <div className="flex items-center text-sm">
                                <User className="h-4 w-4 mr-2" />
                                <span>
                                  Ajudante: {getStudentName(designacao.ajudante_id)}
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>{designacao.tempo_minutos || 0} minutos</span>
                            </div>
                          </div>
                        </div>
                        
                        <Badge variant={designacao.confirmado ? 'default' : 'secondary'}>
                          {designacao.confirmado ? 'Confirmado' : 'Pendente'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OfflineDesignacoes;
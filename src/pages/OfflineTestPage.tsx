import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Download, 
  WifiOff, 
  Database,
  RefreshCw
} from 'lucide-react';
import OfflineDesignacoes from '@/components/OfflineDesignacoes';
import { useOffline } from '@/hooks/useOffline';

const OfflineTestPage: React.FC = () => {
  const { 
    isOnline, 
    isOfflineMode, 
    downloadOfflineData, 
    isDownloading,
    lastSync
  } = useOffline();

  const handleDownloadData = async () => {
    const success = await downloadOfflineData();
    if (success) {
      alert('Dados baixados com sucesso para uso offline!');
    } else {
      alert('Erro ao baixar dados para uso offline.');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Modo Offline</h1>
        <p className="text-gray-600">
          Teste a funcionalidade offline do sistema de designações
        </p>
      </div>

      {/* Status Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <WifiOff className="h-5 w-5 mr-2" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium mb-1">Conexão</h3>
              <p className={isOnline ? "text-green-600" : "text-red-600"}>
                {isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium mb-1">Modo Offline</h3>
              <p className={isOfflineMode ? "text-green-600" : "text-gray-600"}>
                {isOfflineMode ? 'Ativado' : 'Desativado'}
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium mb-1">Última Sincronização</h3>
              <p className="text-gray-600">
                {lastSync ? new Date(lastSync).toLocaleString('pt-BR') : 'Nunca'}
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-4">
            <Button 
              onClick={handleDownloadData}
              disabled={isDownloading || !isOnline}
              className="flex items-center"
            >
              {isDownloading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isDownloading ? 'Baixando...' : 'Baixar Dados para Offline'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert className="mb-8">
        <Database className="h-4 w-4" />
        <AlertTitle>Instruções</AlertTitle>
        <AlertDescription>
          <ul className="list-disc pl-5 space-y-2">
            <li>Clique em "Baixar Dados para Offline" para armazenar os dados localmente</li>
            <li>Desconecte-se da internet para testar o modo offline</li>
            <li>Os dados salvos estarão disponíveis mesmo sem conexão</li>
            <li>Quando reconectar, os dados serão sincronizados automaticamente</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Offline Designacoes Component */}
      <Card>
        <CardHeader>
          <CardTitle>Designações Offline</CardTitle>
        </CardHeader>
        <CardContent>
          <OfflineDesignacoes />
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflineTestPage;
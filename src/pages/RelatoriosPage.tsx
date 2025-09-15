import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { 
  BarChart3, 
  Users, 
  Calendar, 
  TrendingUp,
  Download,
  FileSpreadsheet,
  PieChart,
  Activity
} from "lucide-react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { useEstudantes } from "@/hooks/useEstudantes";

const RelatoriosPage = () => {
  const [activeTab, setActiveTab] = useState('estudante');
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null);
  const { estudantes, getStatistics } = useEstudantes();
  const statistics = getStatistics();

  // Mock data para demonstração
  const mockRelatorioEstudante = {
    'est1': {
      nome: 'João Silva',
      total_designacoes: 12,
      por_tipo: {
        'leitura_biblica': 3,
        'demonstracao': 6,
        'discurso': 3
      },
      ultima_designacao: '2024-11-28',
      proxima_designacao: '2024-12-19'
    },
    'est2': {
      nome: 'Maria Santos',
      total_designacoes: 8,
      por_tipo: {
        'demonstracao': 8
      },
      ultima_designacao: '2024-11-21',
      proxima_designacao: '2024-12-12'
    }
  };

  const mockRelatorioSemanal = {
    '2024-12-02': {
      semana: '2-8 de dezembro de 2024',
      partes_total: 4,
      partes_designadas: 4,
      partes_pendentes: 0,
      estudantes_envolvidos: 6
    },
    '2024-11-25': {
      semana: '25 nov - 1 dez de 2024',
      partes_total: 4,
      partes_designadas: 3,
      partes_pendentes: 1,
      estudantes_envolvidos: 5
    }
  };

  const exportarRelatorio = (tipo: string) => {
    // Implementação futura de exportação
    console.log(`Exportando relatório ${tipo}`);
  };

  return (
    <SidebarLayout 
      title="Relatórios e Análises"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => exportarRelatorio('excel')}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportarRelatorio('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="estudante" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Por Estudante
          </TabsTrigger>
          <TabsTrigger value="semana" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Por Semana
          </TabsTrigger>
          <TabsTrigger value="periodo" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Período
          </TabsTrigger>
        </TabsList>

        <TabsContent value="estudante" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Relatório por Estudante
              </CardTitle>
              <CardDescription>
                Análise individual de designações e participação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(mockRelatorioEstudante).map(([id, dados]: [string, any]) => (
                  <Card key={id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{dados.nome}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total de designações:</span>
                        <Badge variant="secondary">{dados.total_designacoes}</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Por tipo:</p>
                        {Object.entries(dados.por_tipo).map(([tipo, count]: [string, any]) => (
                          <div key={tipo} className="flex justify-between text-sm">
                            <span className="capitalize">{tipo.replace('_', ' ')}</span>
                            <span>{count}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-1 pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Última:</span>
                          <span>{new Date(dados.ultima_designacao).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Próxima:</span>
                          <span>{dados.proxima_designacao ? new Date(dados.proxima_designacao).toLocaleDateString('pt-BR') : 'N/A'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="semana" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Relatório Semanal
              </CardTitle>
              <CardDescription>
                Resumo de designações por semana de reunião
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(mockRelatorioSemanal).map(([data, dados]: [string, any]) => (
                  <Card key={data} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{dados.semana}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{dados.partes_total}</div>
                          <div className="text-sm text-gray-600">Total de partes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{dados.partes_designadas}</div>
                          <div className="text-sm text-gray-600">Designadas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{dados.partes_pendentes}</div>
                          <div className="text-sm text-gray-600">Pendentes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{dados.estudantes_envolvidos}</div>
                          <div className="text-sm text-gray-600">Estudantes</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="periodo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Análise por Período
              </CardTitle>
              <CardDescription>
                Estatísticas e tendências de designações ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Select defaultValue="trimestre">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Selecionar período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mes">Último mês</SelectItem>
                    <SelectItem value="trimestre">Último trimestre</SelectItem>
                    <SelectItem value="semestre">Último semestre</SelectItem>
                    <SelectItem value="ano">Último ano</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline">
                  <Activity className="w-4 h-4 mr-2" />
                  Atualizar
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingUp className="w-4 h-4" />
                      Distribuição
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Leitura Bíblica</span>
                        <Badge variant="outline">25%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Demonstrações</span>
                        <Badge variant="outline">50%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Discursos</span>
                        <Badge variant="outline">25%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <PieChart className="w-4 h-4" />
                      Rotatividade
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Taxa de participação</span>
                        <Badge variant="default">85%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Média por estudante</span>
                        <Badge variant="secondary">2.3</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Estudantes ativos</span>
                        <Badge variant="outline">{statistics.ativos}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Activity className="w-4 h-4" />
                      Tendências
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Crescimento mensal</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">+12%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Novos estudantes</span>
                        <Badge variant="secondary">3</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Meta alcançada</span>
                        <Badge variant="default" className="bg-blue-100 text-blue-800">90%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </SidebarLayout>
  );
};

export default RelatoriosPage;
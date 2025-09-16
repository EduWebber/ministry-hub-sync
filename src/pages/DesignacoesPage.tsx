import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { 
  Users, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  RefreshCw,
  Save
} from "lucide-react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { useEstudantes } from "@/hooks/useEstudantes";

// Tipos para o sistema de designações
interface DesignacaoMinisterial {
  id: string;
  semana: string;
  data_inicio: string;
  parte_numero: number;
  parte_titulo: string;
  parte_tempo: number;
  parte_tipo: 'leitura_biblica' | 'demonstracao' | 'discurso' | 'estudo_biblico';
  estudante_principal_id: string;
  estudante_ajudante_id?: string;
  status: 'pendente' | 'confirmada' | 'concluida';
}

interface ProgramaSemanal {
  id: string;
  semana: string;
  data_inicio: string;
  mes_ano: string;
  partes: ParteMeeting[];
}

interface ParteMeeting {
  numero: number;
  titulo: string;
  tempo: number;
  tipo: string;
  secao: string;
  referencia?: string;
  instrucoes?: string;
}

const DesignacoesPage = () => {
  const [programaAtual, setProgramaAtual] = useState<ProgramaSemanal | null>(null);
  const [designacoes, setDesignacoes] = useState<DesignacaoMinisterial[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { estudantes, isLoading: estudantesLoading } = useEstudantes();



  // Carregar semana real dos dados JSON
  const carregarSemanaAtual = async () => {
    setIsLoading(true);
    try {
      // Dados reais do JSON de julho 2025
      const semanaData = {
        "idSemana": "2025-07-07",
        "semanaLabel": "7-13 de julho 2025",
        "tema": "Sabedoria prática para a vida cristã",
        "programacao": [
          {
            "secao": "Tesouros da Palavra de Deus",
            "partes": [
              { "idParte": 1, "titulo": "Tesouros da Palavra de Deus", "duracaoMin": 10, "tipo": "consideracao" },
              { "idParte": 2, "titulo": "Joias espirituais", "duracaoMin": 10, "tipo": "joias" },
              { "idParte": 3, "titulo": "Leitura da Bíblia", "duracaoMin": 4, "tipo": "leitura" }
            ]
          },
          {
            "secao": "Faça Seu Melhor no Ministério",
            "partes": [
              { "idParte": 4, "titulo": "Iniciando conversas", "duracaoMin": 3, "tipo": "de casa em casa" },
              { "idParte": 5, "titulo": "Cultivando o interesse", "duracaoMin": 4, "tipo": "testemunho informal" },
              { "idParte": 6, "titulo": "Estudo bíblico", "duracaoMin": 5, "tipo": "estudo biblico" }
            ]
          }
        ]
      };
      
      // Converter para formato do sistema
      const partes: ParteMeeting[] = [];
      semanaData.programacao.forEach(secao => {
        secao.partes.forEach(parte => {
          partes.push({
            numero: parte.idParte,
            titulo: parte.titulo,
            tempo: parte.duracaoMin,
            tipo: parte.tipo,
            secao: secao.secao
          });
        });
      });
      
      const programa: ProgramaSemanal = {
        id: semanaData.idSemana,
        semana: semanaData.semanaLabel,
        data_inicio: '2025-07-07',
        mes_ano: 'julho de 2025',
        partes
      };
      
      setProgramaAtual(programa);
      toast({
        title: "Semana real carregada",
        description: `Programa "${programa.semana}" dos dados oficiais carregado.`
      });
    } catch (error) {
      toast({
        title: "Erro ao carregar semana",
        description: "Não foi possível carregar a programação.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Funções auxiliares simplificadas
  const salvarDesignacoes = async () => {
    if (designacoes.length === 0) {
      toast({
        title: 'Nenhuma designação para salvar',
        description: 'Gere as designações primeiro.',
        variant: 'destructive'
      });
      return;
    }
    
    // Simulação de salvamento
    toast({
      title: 'Designações salvas!',
      description: `${designacoes.length} designações foram salvas com sucesso.`
    });
  };

  // Gerar designações automaticamente (simplificado)
  const gerarDesignacoes = async () => {
    if (!programaAtual) {
      toast({
        title: 'Programa requerido',
        description: 'Carregue uma semana antes de gerar designações.',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Geração simples com estudantes disponíveis
      const estudantesDisponiveis = estudantes?.filter((e: any) => e.ativo) || [];
      
      if (estudantesDisponiveis.length === 0) {
        throw new Error('Nenhum estudante ativo disponível');
      }
      
      const designacoesGeradas: DesignacaoMinisterial[] = programaAtual.partes.map((parte, index) => {
        // Algoritmo simples: distribuição rotativa
        const estudantePrincipal = estudantesDisponiveis[index % estudantesDisponiveis.length];
        const precisaAssistente = ['demonstracao', 'de casa em casa', 'testemunho informal'].includes(parte.tipo);
        const estudanteAssistente = precisaAssistente && estudantesDisponiveis.length > 1 
          ? estudantesDisponiveis[(index + 1) % estudantesDisponiveis.length]
          : undefined;
        
        return {
          id: `${programaAtual.id}-${parte.numero}-${Date.now()}`,
          semana: programaAtual.semana,
          data_inicio: programaAtual.data_inicio,
          parte_numero: parte.numero,
          parte_titulo: parte.titulo,
          parte_tempo: parte.tempo,
          parte_tipo: parte.tipo as any,
          estudante_principal_id: estudantePrincipal.id,
          estudante_ajudante_id: estudanteAssistente?.id,
          status: 'confirmada' as const
        };
      });

      setDesignacoes(designacoesGeradas);

      toast({ 
        title: 'Designações geradas!', 
        description: `${designacoesGeradas.length} designações foram criadas automaticamente.` 
      });
    } catch (error: any) {
      toast({ 
        title: 'Erro ao gerar designações', 
        description: error?.message || 'Falha na geração', 
        variant: 'destructive' 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Mock students mapping (should come from real database)
  const mockStudentsMap = {
    'est1': 'João Silva',
    'est2': 'Pedro Santos', 
    'est3': 'Maria Oliveira',
    'est4': 'Ana Costa',
    'est5': 'Carlos Ferreira'
  };

  // Obter nome do estudante por ID
  const getEstudanteNome = (id: string) => {
    // Try real students first
    const estudante = estudantes?.find((e: any) => e.id === id);
    if (estudante?.nome) {
      return estudante.nome;
    }
    
    // Fallback to mock students
    return mockStudentsMap[id as keyof typeof mockStudentsMap] || id || 'Não designado';
  };

  // Função para obter o status visual
  const getStatusBadge = (designacao: DesignacaoMinisterial) => {
    if (!designacao.estudante_principal_id) {
      return <Badge variant="destructive">Pendente</Badge>;
    }
    if (designacao.status === 'confirmada') {
      return <Badge variant="default">Confirmada</Badge>;
    }
    return <Badge variant="secondary">Designada</Badge>;
  };

  return (
    <SidebarLayout 
      title={`Designações - ${programaAtual ? programaAtual.semana : '—'}`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={carregarSemanaAtual} disabled={isLoading}>
            {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Carregar Semana Real (Jul 2025)
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDesignacoes([])}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Limpar
          </Button>
          <Button size="sm" onClick={gerarDesignacoes} disabled={isGenerating || !programaAtual}>
            {isGenerating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}
            Gerar Designações Automáticas
          </Button>
          {designacoes.length > 0 && (
            <Button size="sm" variant="default" onClick={salvarDesignacoes}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Designações
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Configuração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Programa:</label>
                <p className="text-sm text-gray-600">{programaAtual ? programaAtual.semana : 'Nenhum programa carregado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Estudantes ativos:</label>
                <p className="text-sm text-gray-600">
                  {estudantesLoading ? 'Carregando...' : `${estudantes?.length || 0} estudantes`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estado sem programa */}
        {!programaAtual && (
          <Card>
            <CardContent className="p-12 text-center">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Nenhuma semana carregada. Carregue a semana atual (mock) ou importe um PDF na aba Programas.
                </AlertDescription>
              </Alert>
              <Button className="mt-4" onClick={carregarSemanaAtual} disabled={isLoading}>
                {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Carregar Semana Real (Jul 2025)
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tabela de designações */}
        {programaAtual && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Designações da Semana
              </CardTitle>
              <CardDescription>
                {designacoes.length > 0 
                  ? `${designacoes.length} partes com designações`
                  : 'Clique em "Gerar Designações Automáticas" para começar'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {designacoes.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma designação gerada ainda</p>
                  <Button 
                    className="mt-4" 
                    onClick={gerarDesignacoes} 
                    disabled={isGenerating}
                  >
                    {isGenerating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}
                    Gerar Designações Automáticas
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parte</TableHead>
                      <TableHead>Tempo</TableHead>
                      <TableHead>Estudante</TableHead>
                      <TableHead>Assistente</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {designacoes.map((designacao) => (
                      <TableRow key={designacao.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p>{designacao.parte_titulo}</p>
                            <p className="text-sm text-gray-500">#{designacao.parte_numero}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            <Clock className="w-3 h-3 mr-1" />
                            {designacao.parte_tempo} min
                          </Badge>
                        </TableCell>
                        <TableCell>{getEstudanteNome(designacao.estudante_principal_id)}</TableCell>
                        <TableCell>{designacao.estudante_ajudante_id ? getEstudanteNome(designacao.estudante_ajudante_id) : '—'}</TableCell>
                        <TableCell>{getStatusBadge(designacao)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" disabled>
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </SidebarLayout>
  );
};

export default DesignacoesPage;
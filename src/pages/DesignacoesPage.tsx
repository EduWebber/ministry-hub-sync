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
  const [congregacaoId, setCongregacaoId] = useState<string>("");
  const [programacaoId, setProgramacaoId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { estudantes, isLoading: estudantesLoading } = useEstudantes();

  // Auto-preencher congregação com base nos estudantes
  useEffect(() => {
    if (!congregacaoId && Array.isArray(estudantes) && estudantes.length > 0) {
      const anyWithCong = (estudantes as any[]).find((e: any) => e?.congregacao_id);
      if (anyWithCong?.congregacao_id) {
        setCongregacaoId(anyWithCong.congregacao_id);
      }
    }
  }, [estudantes, congregacaoId]);

  // Carregar semana atual (mock)
  const carregarSemanaAtual = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/programacoes/mock?semana=2024-12-02');
      if (response.ok) {
        const data = await response.json();
        const programa: ProgramaSemanal = {
          id: '1',
          semana: data.semana || '2-8 de dezembro de 2024',
          data_inicio: data.data_inicio || '2024-12-02',
          mes_ano: 'dezembro de 2024',
          partes: data.partes || []
        };
        setProgramaAtual(programa);
        toast({
          title: "Semana carregada",
          description: `Programa "${programa.semana}" carregado com sucesso.`
        });
      }
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

  // Helper functions para conversão de dados
  const toISO = (d: Date) => d.toISOString().slice(0, 10);
  const addDays = (dateStr: string, days: number) => {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return toISO(d);
  };

  const mapParteToItem = (parte: ParteMeeting, idx: number) => {
    const section = (parte.secao || '').toUpperCase();
    let type = '';
    if (parte.tipo === 'leitura_biblica' || parte.titulo.toLowerCase().includes('leitura')) {
      type = 'bible_reading';
    } else if (parte.titulo.toLowerCase().includes('iniciando')) {
      type = 'starting';
    } else if (parte.titulo.toLowerCase().includes('cultivando')) {
      type = 'following';
    } else if (parte.titulo.toLowerCase().includes('discípulo')) {
      type = 'making_disciples';
    } else if (parte.tipo === 'discurso') {
      type = 'talk';
    } else {
      type = 'talk';
    }
    return {
      order: idx + 1,
      section: section === 'TESOUROS' ? 'TREASURES' : section === 'MINISTERIO' ? 'APPLY' : section || 'LIVING',
      type,
      minutes: parte.tempo,
      rules: null,
      lang: {
        en: { title: parte.titulo },
        pt: { title: parte.titulo }
      }
    };
  };

  // Persistir programa no backend
  const persistirPrograma = async (programaLocal: ProgramaSemanal) => {
    const week_start = programaLocal.data_inicio;
    const week_end = addDays(week_start, 6);
    const items = (programaLocal.partes || []).map(mapParteToItem);

    const payload = {
      week_start,
      week_end,
      status: 'publicada',
      congregation_scope: 'global',
      items
    };

    const resp = await fetch('/api/programacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao salvar programação');
    }
    const data = await resp.json();
    setProgramacaoId(data.programacao.id);
    return data.programacao.id as string;
  };

  // Gerar designações automaticamente
  const gerarDesignacoes = async () => {
    if (!programaAtual) {
      toast({
        title: 'Programa requerido',
        description: 'Carregue uma semana antes de gerar designações.',
        variant: 'destructive'
      });
      return;
    }
    
    if (!congregacaoId) {
      toast({ 
        title: 'Congregação requerida', 
        description: 'Informe o UUID da congregação para gerar designações.', 
        variant: 'destructive' 
      });
      return;
    }

    setIsGenerating(true);
    try {
      // 1) Persistir programa no backend
      const progId = programacaoId || (await persistirPrograma(programaAtual));

      // 2) Chamar o gerador no backend
      const genResp = await fetch('/api/designacoes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programacao_id: progId, congregacao_id: congregacaoId })
      });
      if (!genResp.ok) {
        const err = await genResp.json().catch(() => ({}));
        throw new Error(err.error || 'Falha ao gerar designações');
      }
      const genData = await genResp.json();

      // 3) Buscar as designações geradas
      const listResp = await fetch(`/api/designacoes?programacao_id=${encodeURIComponent(progId)}&congregacao_id=${encodeURIComponent(congregacaoId)}`);
      if (!listResp.ok) {
        const err = await listResp.json().catch(() => ({}));
        throw new Error(err.error || 'Falha ao listar designações');
      }
      const listData = await listResp.json();

      const itens: any[] = listData.itens || [];
      
      // Mapear para o tipo local de exibição (simplificado)
      const designacoesGeradas: DesignacaoMinisterial[] = itens.map((di: any, index: number) => ({
        id: `${progId}-${di.programacao_item_id}`,
        semana: programaAtual.semana,
        data_inicio: programaAtual.data_inicio,
        parte_numero: index + 1,
        parte_titulo: programaAtual.partes[index]?.titulo || 'Parte',
        parte_tempo: programaAtual.partes[index]?.tempo || 0,
        parte_tipo: (programaAtual.partes[index]?.tipo || 'talk') as any,
        estudante_principal_id: di.principal_estudante_id || '',
        estudante_ajudante_id: di.assistente_estudante_id || undefined,
        status: di.principal_estudante_id ? 'confirmada' : 'pendente'
      }));

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

  // Obter nome do estudante por ID (mock)
  const getEstudanteNome = (id: string) => {
    const estudante = estudantes?.find((e: any) => e.id === id);
    return estudante?.nome || id || 'Não designado';
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
            Carregar Semana Atual (Mock)
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
          <Button size="sm" onClick={gerarDesignacoes} disabled={isGenerating || !programaAtual || !congregacaoId}>
            {isGenerating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}
            Gerar Designações Automáticas
          </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div>
                <label className="text-sm font-medium">Congregação (UUID):</label>
                <Input 
                  value={congregacaoId} 
                  onChange={(e) => setCongregacaoId(e.target.value)} 
                  placeholder="00000000-0000-0000-0000-000000000000"
                  className="mt-1"
                />
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
                Carregar Semana Atual (Mock)
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
                    disabled={isGenerating || !congregacaoId}
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
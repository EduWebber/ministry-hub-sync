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
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useProgramContext } from "@/contexts/ProgramContext";
import { supabase } from "@/integrations/supabase/client";

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
  regras_papel?: {
    genero?: string;
    assistente_necessario?: boolean;
  };
}

const DesignacoesPage = () => {
  const navigate = useNavigate();
  const { selectedCongregacaoId, setSelectedCongregacaoId, selectedProgramId, setSelectedProgramId } = useProgramContext();
  const [programaAtual, setProgramaAtual] = useState<ProgramaSemanal | null>(null);
  const [designacoes, setDesignacoes] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { estudantes, isLoading: estudantesLoading } = useEstudantes();
  const { user } = useAuth();

  // Load selected program from context when component mounts
  useEffect(() => {
    const savedProgram = localStorage.getItem('selectedProgram');
    if (savedProgram) {
      try {
        const programa = JSON.parse(savedProgram);
        setProgramaAtual(programa);
        // Set program ID in context
        setSelectedProgramId(programa.id);
        toast({
          title: "Programa carregado",
          description: `Programa "${programa.semana}" carregado com sucesso.`
        });
        // Clear the saved program so it's not loaded again
        localStorage.removeItem('selectedProgram');
      } catch (error) {
        console.error('Erro ao carregar programa salvo:', error);
      }
    }
  }, []);
  
  // Update congregacaoId to use context, fallback to first estudante's congregacao
  const firstCongId = Array.isArray(estudantes) && estudantes.length > 0 ? (estudantes as any[]).find((e: any) => e?.congregacao_id)?.congregacao_id : '';
  const congregacaoId = selectedCongregacaoId || firstCongId || '';
  const setCongregacaoId = setSelectedCongregacaoId;

  // Carregar semana real dos dados JSON com fallback local quando o backend estiver offline
  const carregarSemanaAtual = async () => {
    setIsLoading(true);

    // Fallback local (Janeiro/2026) no formato esperado pelo conversor abaixo
    const fallbackProgramas = [
      {
        idSemana: '2026-01-05',
        semanaLabel: '5-11 de janeiro 2026',
        tema: 'Recomeçando com sabedoria',
        programacao: [
          {
            secao: 'Tesouros da Palavra de Deus',
            partes: [
              { idParte: 1, titulo: 'Tesouros da Palavra de Deus', duracaoMin: 10, tipo: 'consideracao' },
              { idParte: 2, titulo: 'Joias espirituais', duracaoMin: 10, tipo: 'joias' },
              { idParte: 3, titulo: 'Leitura da Bíblia', duracaoMin: 4, tipo: 'leitura', restricoes: { genero: 'M' } }
            ]
          },
          {
            secao: 'Faça Seu Melhor no Ministério',
            partes: [
              { idParte: 4, titulo: 'Iniciando conversas', duracaoMin: 2, tipo: 'testemunho informal' },
              { idParte: 5, titulo: 'Cultivando o interesse', duracaoMin: 3, tipo: 'de casa em casa' },
              { idParte: 6, titulo: 'Fazendo discípulos', duracaoMin: 5, tipo: 'estudo biblico' }
            ]
          },
          {
            secao: 'Nossa Vida Cristã',
            partes: [
              { idParte: 7, titulo: 'Tema local (ancião)', duracaoMin: 15, tipo: 'consideracao' },
              { idParte: 8, titulo: 'Estudo bíblico de congregação', duracaoMin: 30, tipo: 'estudo' }
            ]
          }
        ]
      }
    ];

    const toProgramaSemanal = (programaData: any): ProgramaSemanal => {
      const partes: ParteMeeting[] = [];
      if (programaData.programacao) {
        programaData.programacao.forEach((secao: any) => {
          secao.partes.forEach((parte: any) => {
            partes.push({
              numero: parte.idParte,
              titulo: parte.titulo,
              tempo: parte.duracaoMin,
              tipo: parte.tipo,
              secao: secao.secao,
              referencia: parte.referencia,
              instrucoes: parte.instrucoes,
              regras_papel: parte.restricoes
            });
          });
        });
      }
      return {
        id: programaData.idSemana,
        semana: programaData.semanaLabel,
        data_inicio: programaData.idSemana,
        mes_ano: programaData.tema || 'Programa Ministerial',
        partes
      };
    };

    try {
      // Prefer Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('list-programs-json', {
        body: { limit: 1 }
      });

      if (error) {
        throw error;
      }

      if (data?.programas && data.programas.length > 0) {
        const programa = toProgramaSemanal(data.programas[0]);
        setProgramaAtual(programa);
        toast({ title: 'Programa carregado', description: `Programa "${programa.semana}" carregado com sucesso.` });
        return;
      }

      // Sem dados — usar fallback
      const fallback = toProgramaSemanal(fallbackProgramas[0]);
      setProgramaAtual(fallback);
      toast({ title: 'Programa (local) carregado', description: `Usando dados locais: ${fallback.semana}` });
    } catch (error) {
      console.warn('Edge Function indisponível, usando fallback local.', error);
      const fallback = toProgramaSemanal(fallbackProgramas[0]);
      setProgramaAtual(fallback);
      toast({ title: 'Programa (local) carregado', description: `Usando dados locais: ${fallback.semana}` });
    } finally {
      setIsLoading(false);
    }
  };

  // Salvar designações no backend
  const salvarDesignacoes = async () => {
    if (!programaAtual || designacoes.length === 0) {
      toast({
        title: 'Nenhuma designação para salvar',
        description: 'Gere as designações primeiro.',
        variant: 'destructive'
      });
      return;
    }
    
    if (!congregacaoId) {
      toast({
        title: 'Congregação requerida',
        description: 'Selecione uma congregação antes de salvar.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const payload = {
        programacao_id: programaAtual.id,
        congregacao_id: congregacaoId,
        itens: designacoes.map(d => ({
          programacao_item_id: d.programacao_item_id || d.id,
          principal_estudante_id: d.principal_estudante_id || d.estudante_principal_id,
          assistente_estudante_id: d.assistente_estudante_id || d.estudante_ajudante_id,
          observacoes: d.observacoes
        }))
      };

      const { data, error } = await supabase.functions.invoke('save-assignments', {
        body: payload
      });

      if (error) {
        if (typeof error?.message === 'string' && error.message.includes('atualização de esquema')) {
          throw new Error('O sistema está passando por uma atualização de esquema. Por favor, tente novamente em alguns minutos.');
        }
        throw error;
      }

      toast({
        title: 'Designações salvas!',
        description: `${designacoes.length} designações foram salvas com sucesso.`
      });
    } catch (error: any) {
      console.error('Erro ao salvar designações:', error);
      // Fallback: salvar rascunho local
      try {
        localStorage.setItem('designacoes_draft', JSON.stringify({
          programacao_id: programaAtual?.id,
          congregacao_id: congregacaoId,
          itens: designacoes
        }));
        toast({
          title: 'Rascunho salvo localmente',
          description: 'As designações foram salvas como rascunho no navegador.'
        });
      } catch (_) {
        toast({
          title: 'Erro ao salvar designações',
          description: error?.message || 'Não foi possível salvar as designações.',
          variant: 'destructive'
        });
      }
    }
  };

  // Gerador local (fallback) quando a Function não estiver disponível
  const gerarDesignacoesLocal = () => {
    if (!programaAtual) return [] as any[];
    const parts = programaAtual.partes || [];
    const alunos = Array.isArray(estudantes) ? (estudantes as any[]) : [];

    const pick = (list: any[]) => list[Math.floor(Math.random() * list.length)];

    const elegiveisPorTipo = (parte: any) => {
      const titulo = String(parte.titulo || '').toLowerCase();
      const tipo = String(parte.tipo || '').toLowerCase();
      // Heurísticas simples
      if (titulo.includes('leitura') || tipo.includes('leitura')) {
        return alunos.filter(a => a.genero === 'masculino' && (a.reading === true || a.tresures === true || a.gems === true || a.talk === true));
      }
      if (titulo.includes('iniciando')) {
        return alunos.filter(a => a.starting === true || a.following === true || a.making === true || a.explaining === true);
      }
      if (titulo.includes('cultivando')) {
        return alunos.filter(a => a.following === true || a.starting === true || a.making === true || a.explaining === true);
      }
      if (titulo.includes('fazendo')) {
        return alunos.filter(a => a.making === true || a.following === true || a.starting === true);
      }
      if (titulo.includes('explicando') || tipo.includes('discurso')) {
        return alunos.filter(a => a.talk === true || a.explaining === true);
      }
      return alunos;
    };

    const precisaAssistente = (parte: any) => {
      const titulo = String(parte.titulo || '').toLowerCase();
      return (
        titulo.includes('iniciando') ||
        titulo.includes('cultivando') ||
        titulo.includes('fazendo') ||
        titulo.includes('explicando')
      );
    };

    const geradas: any[] = parts.map((parte: any, idx: number) => {
      const candidatos = elegiveisPorTipo(parte);
      const principal = candidatos.length > 0 ? pick(candidatos) : pick(alunos);
      let assistenteId: string | undefined = undefined;
      if (precisaAssistente(parte)) {
        const mesmos = alunos.filter(a => a.id !== principal?.id && a.genero === principal?.genero);
        const aux = mesmos.length > 0 ? pick(mesmos) : pick(alunos.filter(a => a.id !== principal?.id));
        assistenteId = aux?.id;
      }
      return {
        id: `${programaAtual.id}-${parte.numero}`,
        programacao_item_id: parte.numero,
        parte_numero: parte.numero,
        parte_titulo: parte.titulo,
        parte_tempo: parte.tempo,
        parte_tipo: parte.tipo,
        principal_estudante_id: principal?.id || null,
        assistente_estudante_id: assistenteId,
        status: principal ? 'OK' : 'PENDING',
        observacoes: 'fallback: local-generator'
      };
    });
    return geradas;
  };

  // Gerar designações automaticamente (conectado ao backend)
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
        description: 'Selecione uma congregação antes de gerar designações.',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('generate-assignments', {
        body: {
          programacao_id: programaAtual.id,
          congregacao_id: congregacaoId
        }
      });

      if (error) {
        throw error;
      }
      console.log('Resposta da API de geração:', result);
      
      // Atualizar estado com as designações geradas
      // O backend retorna as designações no campo 'designacoes'
      const designacoesGeradas = result.designacoes || [];
      console.log('Designações geradas:', designacoesGeradas);
      
      if (designacoesGeradas.length > 0) {
        setDesignacoes(designacoesGeradas);

        // Enhanced success message with algorithm info
        const summary = result.summary || {};
        const algorithmUsed = result.algorithm || 'S-38';
        const fallbacksApplied = summary.fallbacks_applied || 0;
        
        let description = `${designacoesGeradas.length} designações foram criadas usando o algoritmo ${algorithmUsed}.`;
        if (fallbacksApplied > 0) {
          description += ` ${fallbacksApplied} designações usaram estratégias de fallback.`;
        }
        
        toast({ 
          title: 'Designações geradas com sucesso!', 
          description: description
        });
      } else {
        const summary = result.summary || {};
        const pendingCount = summary.designacoes_pendentes || 0;
        
        toast({ 
          title: 'Atenção: Designações com restrições', 
          description: `O algoritmo S-38 gerou designações, mas ${pendingCount} partes ficaram pendentes devido às regras de qualificação e disponibilidade.`, 
          variant: 'destructive' 
        });
      }
    } catch (error: any) {
      // Fallback local
      const locais = gerarDesignacoesLocal();
      if (locais.length > 0) {
        setDesignacoes(locais);
        toast({
          title: 'Designações geradas (local)',
          description: `${locais.length} designações criadas com gerador local.`
        });
      } else {
        toast({ 
          title: 'Erro ao gerar designações', 
          description: error?.message || 'Falha na geração', 
          variant: 'destructive' 
        });
      }
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
  const getEstudanteNome = (id: string | null) => {
    if (!id) return 'Não designado';
    
    // Try real students first
    const estudante = estudantes?.find((e: any) => e.id === id);
    if (estudante?.nome) {
      return estudante.nome;
    }
    
    // Fallback to mock students
    return mockStudentsMap[id as keyof typeof mockStudentsMap] || id || 'Não designado';
  };

  // Função para obter o status visual com informações de fallback
  const getStatusBadge = (designacao: any) => {
    if (!designacao.principal_estudante_id) {
      return <Badge variant="destructive">Pendente</Badge>;
    }
    if (designacao.status === 'OK') {
      if (designacao.observacoes && designacao.observacoes.includes('fallback')) {
        return (
          <div className="flex flex-col gap-1">
            <Badge variant="secondary">Designada</Badge>
            <Badge variant="outline" className="text-xs">Fallback aplicado</Badge>
          </div>
        );
      }
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
            Carregar Programa
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDesignacoes([])}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Limpar
          </Button>
          <Button size="sm" onClick={gerarDesignacoes} disabled={isGenerating || !programaAtual || !congregacaoId}>
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
                <label className="text-sm font-medium">Congregação:</label>
                <Select value={congregacaoId} onValueChange={setCongregacaoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma congregação" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(new Set(((estudantes || []) as any[]).map(e => e?.congregacao_id).filter(Boolean))).length > 0 ? (
                      Array.from(new Set(((estudantes || []) as any[]).map(e => e?.congregacao_id).filter(Boolean))).map((id: any) => (
                        <SelectItem key={String(id)} value={String(id)}>{String(id)}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__all__">Todas</SelectItem>
                    )}
                  </SelectContent>
                </Select>
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
                  Nenhuma semana carregada. Carregue a semana atual ou importe um PDF na aba Programas.
                </AlertDescription>
              </Alert>
              <Button className="mt-4" onClick={carregarSemanaAtual} disabled={isLoading}>
                {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Carregar Programa
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tabela de designações */}
        {programaAtual && (
          <>
            {/* S-38 Algorithm Summary */}
            {designacoes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Resumo do Algoritmo S-38
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {designacoes.filter(d => d.status === 'OK').length}
                      </div>
                      <div className="text-sm text-gray-500">Designações Confirmadas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {designacoes.filter(d => d.status === 'PENDING').length}
                      </div>
                      <div className="text-sm text-gray-500">Pendentes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {designacoes.filter(d => d.observacoes && d.observacoes.includes('fallback')).length}
                      </div>
                      <div className="text-sm text-gray-500">Fallbacks Aplicados</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round((designacoes.filter(d => d.status === 'OK').length / designacoes.length) * 100)}%
                      </div>
                      <div className="text-sm text-gray-500">Taxa de Sucesso</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
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
                      <TableHead>Observações</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {designacoes.map((designacao: any, index: number) => {
                      console.log('Renderizando designação:', designacao);
                      return (
                        <TableRow key={designacao.id || designacao.programacao_item_id || index}>
                          <TableCell className="font-medium">
                            <div>
                              <p>{designacao.parte_titulo || designacao.titulo || (designacao.programacao_itens && designacao.programacao_itens.titulo) || 'Parte não identificada'}</p>
                              <p className="text-sm text-gray-500">#{designacao.parte_numero || designacao.numero || 'N/A'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              {designacao.parte_tempo || designacao.tempo || (designacao.programacao_itens && designacao.programacao_itens.tempo) || 0} min
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {designacao.principal_estudante_id 
                              ? getEstudanteNome(designacao.principal_estudante_id) 
                              : 'Não designado'}
                          </TableCell>
                          <TableCell>
                            {designacao.assistente_estudante_id 
                              ? getEstudanteNome(designacao.assistente_estudante_id) 
                              : '—'}
                          </TableCell>
                          <TableCell>{getStatusBadge(designacao)}</TableCell>
                          <TableCell>
                            {designacao.observacoes ? (
                              <span className="text-xs text-gray-500 italic">
                                {designacao.observacoes.includes('fallback') ? '🔄 ' : ''}
                                {designacao.observacoes}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" disabled>
                              Editar
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          </>
        )}
      </div>
    </SidebarLayout>
  );
};

export default DesignacoesPage;
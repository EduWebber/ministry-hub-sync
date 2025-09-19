import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Award, 
  Target, 
  Calendar,
  BarChart3,
  Filter,
  Zap
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QualificacoesAvancadasProps {
  congregacaoId?: string;
}

interface StudentQualification {
  id: string;
  nome: string;
  genero: string;
  total_qualificacoes: number;
  qualificacoes: {
    reading: boolean;
    treasures: boolean;
    gems: boolean;
    talk: boolean;
    explaining: boolean;
    starting: boolean;
    following: boolean;
    making: boolean;
    congregation_study: boolean;
  };
  privilegios: string[];
  total_designacoes: number;
  nivel_desenvolvimento: string;
  ultimas_atividades: {
    data: string;
    tipo: string;
  }[];
  data_cadastro: string;
}

const QualificacoesAvancadas = ({ congregacaoId }: QualificacoesAvancadasProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<StudentQualification[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "level" | "assignments">("name");

  // Fetch advanced qualifications data
  const fetchAdvancedQualifications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('reports', {
        body: {
          type: 'advanced-qualifications',
          congregacao_id: congregacaoId || undefined
        }
      });
      if (error) throw error;
      setReportData(data?.report || []);
      setSummary(data?.summary || null);
      
      toast({
        title: "Relatório carregado",
        description: "Dados de qualificações avançadas carregados com sucesso."
      });
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      toast({
        title: "Erro ao carregar relatório",
        description: "Não foi possível carregar os dados de qualificações avançadas.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    let result = [...reportData];
    
    // Filter by progress level
    if (selectedLevel !== "all") {
      result = result.filter(est => est.nivel_desenvolvimento === selectedLevel);
    }
    
    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.nome.localeCompare(b.nome);
        case "level":
          const levelOrder: Record<string, number> = { 'Avançado': 1, 'Intermediário': 2, 'Básico': 3 };
          return (levelOrder[a.nivel_desenvolvimento] || 4) - (levelOrder[b.nivel_desenvolvimento] || 4);
        case "assignments":
          return b.total_designacoes - a.total_designacoes;
        default:
          return 0;
      }
    });
    
    return result;
  }, [reportData, selectedLevel, sortBy]);

  // Load data on component mount
  useEffect(() => {
    fetchAdvancedQualifications();
  }, [congregacaoId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Estudantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_estudantes}</div>
              <p className="text-xs text-muted-foreground">Todos os estudantes ativos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média de Qualificações</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.media_qualificacoes.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Por estudante</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média de Designações</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.media_designacoes.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Por estudante</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estudantes Avançados</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.por_nivel?.Avançado || 0}</div>
              <p className="text-xs text-muted-foreground">Nível avançado</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros e Ordenação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Nível de Progresso</label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os níveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os níveis</SelectItem>
                  <SelectItem value="Avançado">Avançado</SelectItem>
                  <SelectItem value="Intermediário">Intermediário</SelectItem>
                  <SelectItem value="Básico">Básico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Ordenar por</label>
              <Select value={sortBy} onValueChange={(value: "name" | "level" | "assignments") => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nome</SelectItem>
                  <SelectItem value="level">Nível de Progresso</SelectItem>
                  <SelectItem value="assignments">Número de Designações</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={fetchAdvancedQualifications} className="w-full">
                <Zap className="w-4 h-4 mr-2" />
                Atualizar Dados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Level Distribution */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Distribuição por Nível de Progresso
            </CardTitle>
            <CardDescription>
              Distribuição dos estudantes por nível de desenvolvimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(summary.por_nivel || {}).map(([level, count]: [string, any]) => (
                <div key={level} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{level}</span>
                    <span>{count} estudantes ({Math.round((count / summary.total_estudantes) * 100)}%)</span>
                  </div>
                  <Progress 
                    value={(count / summary.total_estudantes) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Progress Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Progresso Individual
          </CardTitle>
          <CardDescription>
            Detalhes do progresso de cada estudante
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudante</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Qualificações</TableHead>
                <TableHead>Designações</TableHead>
                <TableHead>Última Atividade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedStudents.map((estudante) => (
                <TableRow key={estudante.id}>
                  <TableCell className="font-medium">{estudante.nome}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        estudante.nivel_desenvolvimento === 'Avançado' ? 'default' :
                        estudante.nivel_desenvolvimento === 'Intermediário' ? 'secondary' :
                        'outline'
                      }
                    >
                      {estudante.nivel_desenvolvimento}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {estudante.qualificacoes.reading && (
                        <Badge variant="outline" className="text-xs">📖 Leitura</Badge>
                      )}
                      {estudante.qualificacoes.treasures && (
                        <Badge variant="outline" className="text-xs">💎 Tesouros</Badge>
                      )}
                      {estudante.qualificacoes.gems && (
                        <Badge variant="outline" className="text-xs">✨ Joias</Badge>
                      )}
                      {estudante.qualificacoes.talk && (
                        <Badge variant="outline" className="text-xs">🎤 Discurso</Badge>
                      )}
                      {estudante.qualificacoes.starting && (
                        <Badge variant="outline" className="text-xs">🚪 Início</Badge>
                      )}
                      {estudante.qualificacoes.following && (
                        <Badge variant="outline" className="text-xs">🔄 Revisita</Badge>
                      )}
                      {estudante.qualificacoes.making && (
                        <Badge variant="outline" className="text-xs">👥 Discípulos</Badge>
                      )}
                      {estudante.qualificacoes.explaining && (
                        <Badge variant="outline" className="text-xs">💬 Explicando</Badge>
                      )}
                      {estudante.qualificacoes.congregation_study && (
                        <Badge variant="outline" className="text-xs">📚 Estudo</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span>{estudante.total_designacoes}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {estudante.ultimas_atividades.length > 0 ? (
                      <span>
                        {new Date(estudante.ultimas_atividades[0].data).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default QualificacoesAvancadas;
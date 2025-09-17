import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Globe, 
  BarChart3, 
  RefreshCw, 
  CheckCircle, 
  Database, 
  Settings, 
  Users, 
  Activity, 
  AlertCircle, 
  FileText,
  Package,
  Home,
  Calendar,
  BookOpen,
  UserCheck,
  Shield,
  TrendingUp,
  Download,
  Upload,
  ExternalLink,
  Clock,
  MapPin,
  Star,
  Award,
  Target,
  Zap,
  Eye,
  Edit3,
  Plus,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useJWorgIntegration } from '@/hooks/useJWorgIntegration';
import { supabase } from '@/lib/supabase';
import UnifiedNavigation from './UnifiedNavigation';
import ProgramFlowGuide from '@/components/programs/ProgramFlowGuide';
import UnifiedBreadcrumbs from './UnifiedBreadcrumbs';
import { useProgramContext } from '@/contexts/ProgramContext';

// Check if we're in mock mode
const isMockMode = import.meta.env.VITE_MOCK_MODE === 'true';

// Programação Especial - Janeiro 2026
const programacaoEspecialJaneiro2026 = [
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
  },
  {
    idSemana: '2026-01-12',
    semanaLabel: '12-18 de janeiro 2026',
    tema: 'Confiança em Jeová no novo ano',
    programacao: [
      {
        secao: 'Tesouros da Palavra de Deus',
        partes: [
          { idParte: 1, titulo: 'Confiando em Jeová', duracaoMin: 10, tipo: 'consideracao' },
          { idParte: 2, titulo: 'Joias espirituais', duracaoMin: 10, tipo: 'joias' },
          { idParte: 3, titulo: 'Leitura da Bíblia', duracaoMin: 4, tipo: 'leitura', restricoes: { genero: 'M' } }
        ]
      },
      {
        secao: 'Faça Seu Melhor no Ministério',
        partes: [
          { idParte: 4, titulo: 'Iniciando conversas', duracaoMin: 3, tipo: 'de casa em casa' },
          { idParte: 5, titulo: 'Cultivando o interesse', duracaoMin: 4, tipo: 'testemunho publico' },
          { idParte: 6, titulo: 'Demonstração', duracaoMin: 5, tipo: 'demonstracao' }
        ]
      },
      {
        secao: 'Nossa Vida Cristã',
        partes: [
          { idParte: 7, titulo: 'Vídeo com consideração', duracaoMin: 15, tipo: 'video+consideracao' },
          { idParte: 8, titulo: 'Estudo bíblico de congregação', duracaoMin: 30, tipo: 'estudo' }
        ]
      }
    ]
  },
  {
    idSemana: '2026-01-19',
    semanaLabel: '19-25 de janeiro 2026',
    tema: 'Ande por fé e não por vista',
    programacao: [
      {
        secao: 'Tesouros da Palavra de Deus',
        partes: [
          { idParte: 1, titulo: 'Fé ativa em ação', duracaoMin: 10, tipo: 'consideracao' },
          { idParte: 2, titulo: 'Joias espirituais', duracaoMin: 10, tipo: 'joias' },
          { idParte: 3, titulo: 'Leitura da Bíblia', duracaoMin: 4, tipo: 'leitura', restricoes: { genero: 'M' } }
        ]
      },
      {
        secao: 'Faça Seu Melhor no Ministério',
        partes: [
          { idParte: 4, titulo: 'Iniciando conversas', duracaoMin: 3, tipo: 'testemunho informal' },
          { idParte: 5, titulo: 'Cultivando o interesse', duracaoMin: 4, tipo: 'de casa em casa' },
          { idParte: 6, titulo: 'Fazendo discípulos', duracaoMin: 5, tipo: 'estudo biblico' }
        ]
      },
      {
        secao: 'Nossa Vida Cristã',
        partes: [
          { idParte: 7, titulo: 'Necessidades locais', duracaoMin: 15, tipo: 'necessidades' },
          { idParte: 8, titulo: 'Estudo bíblico de congregação', duracaoMin: 30, tipo: 'estudo' }
        ]
      }
    ]
  },
  {
    idSemana: '2026-01-26',
    semanaLabel: '26 de janeiro – 1º de fevereiro 2026',
    tema: 'Sabedoria em decisões diárias',
    programacao: [
      {
        secao: 'Tesouros da Palavra de Deus',
        partes: [
          { idParte: 1, titulo: 'Decisões guiadas por Jeová', duracaoMin: 10, tipo: 'consideracao' },
          { idParte: 2, titulo: 'Joias espirituais', duracaoMin: 10, tipo: 'joias' },
          { idParte: 3, titulo: 'Leitura da Bíblia', duracaoMin: 4, tipo: 'leitura', restricoes: { genero: 'M' } }
        ]
      },
      {
        secao: 'Faça Seu Melhor no Ministério',
        partes: [
          { idParte: 4, titulo: 'Iniciando conversas', duracaoMin: 2, tipo: 'de casa em casa' },
          { idParte: 5, titulo: 'Cultivando o interesse', duracaoMin: 3, tipo: 'testemunho publico' },
          { idParte: 6, titulo: 'Discurso (tema local)', duracaoMin: 5, tipo: 'discurso', restricoes: { genero: 'M' } }
        ]
      },
      {
        secao: 'Nossa Vida Cristã',
        partes: [
          { idParte: 7, titulo: 'Vídeo com consideração', duracaoMin: 15, tipo: 'video+consideracao' },
          { idParte: 8, titulo: 'Estudo bíblico de congregação', duracaoMin: 30, tipo: 'estudo' }
        ]
      }
    ]
  }
];

// 🎯 COMPONENTES ADMIN REMOVIDOS - SISTEMA SIMPLIFICADO

// 🚀 DASHBOARD UNIFICADO QUE ADAPTA AO ROLE DO USUÁRIO
export default function UnifiedDashboard() {
  const { user, profile } = useAuth();
  const { selectedCongregacaoId, selectedProgramId, selectedWeekStart } = useProgramContext();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState({
    totalEstudantes: 0,
    totalProgramas: 0,
    totalDesignacoes: 0,
    loading: true
  });
  const [jworgData, setJworgData] = useState<any>(null);
  const [recentAssignments, setRecentAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🎯 CARREGAR ESTATÍSTICAS BASEADAS NO ROLE
  const loadDashboardStats = async () => {
    if (!user?.id) return;

    try {
      setDashboardStats(prev => ({ ...prev, loading: true }));

      // If in mock mode, return mock data
      if (isMockMode) {
        console.log('🧪 Mock mode: returning mock dashboard stats');
        setDashboardStats({
          totalEstudantes: 12,
          totalProgramas: 8,
          totalDesignacoes: 24,
          loading: false
        });
        return;
      }

      if (profile?.role === 'admin') {
        // 📊 ESTATÍSTICAS GLOBAIS PARA ADMIN
        const [estudantesResult, programasResult, designacoesResult] = await Promise.all([
          supabase.from('estudantes').select('id', { count: 'exact' }),
          supabase.from('programas_ministeriais').select('id', { count: 'exact' }),
          supabase.from('designacoes').select('id', { count: 'exact' })
        ]);

        setDashboardStats({
          totalEstudantes: estudantesResult.count || 0,
          totalProgramas: programasResult.count || 0,
          totalDesignacoes: designacoesResult.count || 0,
          loading: false
        });
      } else if (profile?.role === 'instrutor') {
        // 📊 ESTATÍSTICAS LOCAIS PARA INSTRUTOR
        const [estudantesResult, programasResult] = await Promise.all([
          supabase.from('estudantes').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('programas_ministeriais').select('id', { count: 'exact' })
        ]);

        setDashboardStats({
          totalEstudantes: estudantesResult.count || 0,
          totalProgramas: programasResult.count || 0,
          totalDesignacoes: 0, // We'll set this properly in the role specific data loading
          loading: false
        });
      } else if (profile?.role === 'estudante') {
        // 📊 ESTATÍSTICAS INDIVIDUAIS PARA ESTUDANTE
        const [designacoesResult] = await Promise.all([
          supabase.from('designacoes').select('id', { count: 'exact' }).eq('estudante_id', user.id)
        ]);

        setDashboardStats({
          totalEstudantes: 1,
          totalProgramas: 0,
          totalDesignacoes: designacoesResult.count || 0,
          loading: false
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
      setDashboardStats(prev => ({ ...prev, loading: false }));
    }
  };

  // 🎯 CARREGAR DADOS ESPECÍFICOS POR ROLE
  const loadRoleSpecificData = async () => {
    if (!user?.id || !profile?.role) return;

    try {
      setLoading(true);

      // If in mock mode, return mock data
      if (isMockMode) {
        console.log('🧪 Mock mode: returning mock role specific data');
        setRecentAssignments([
          {
            id: 'mock-assignment-1',
            estudante_id: 'mock-student-1',
            tipo_parte: 'Leitura da Bíblia',
            confirmado: true,
            created_at: new Date().toISOString(),
            estudantes: {
              nome: 'João Silva',
              cargo: 'publicador_batizado'
            },
            programas: {
              mes_apostila: 'Setembro 2025',
              semana: 1
            }
          }
        ]);
        setLoading(false);
        return;
      }

      if (profile.role === 'instrutor') {
        // 👨‍🏫 DADOS INSTRUTOR: Designações recentes da congregação
        const { data: assignments } = await supabase
          .from('designacoes')
          .select(`
            *,
            estudantes!inner(nome, cargo),
            semanas_programa!inner(data_inicio, semana_numero)
          `)
          .eq('estudante_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentAssignments(assignments || []);
      } else if (profile.role === 'estudante') {
        // 👨‍🎓 DADOS ESTUDANTE: Minhas designações e materiais
        const { data: myAssignments } = await supabase
          .from('designacoes')
          .select(`
            *,
            semanas_programa!inner(data_inicio, semana_numero)
          `)
          .eq('estudante_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentAssignments(myAssignments || []);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados específicos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && profile?.role) {
      loadDashboardStats();
      loadRoleSpecificData();
    }
  }, [user?.id, profile?.role]);

  // 🎯 RENDERIZAÇÃO CONDICIONAL BASEADA NO ROLE
  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Carregando perfil...</span>
      </div>
    );
  }

  // 🏠 DASHBOARD ADMIN REMOVIDO - SISTEMA SIMPLIFICADO

  // 👨‍🏫 DASHBOARD INSTRUTOR - GESTÃO LOCAL
  if (profile.role === 'instrutor') {
    return (
      <>
        <UnifiedNavigation />
        <div className="container mx-auto p-6 max-w-7xl">
          <UnifiedBreadcrumbs />
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Dashboard do Instrutor</h1>
                <p className="text-muted-foreground mt-1">
                  {profile.congregacao_id || 'Sua Congregação'} - Gestão Local
                </p>
              </div>
            </div>

            {/* Context Information */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Contexto Atual do Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="font-medium">Congregação:</span> {selectedCongregacaoId || 'Não definida'}
                </div>
                <div>
                  <span className="font-medium">Programa:</span> {selectedProgramId || 'Não definido'}
                </div>
                <div>
                  <span className="font-medium">Semana:</span> {selectedWeekStart || 'Não definida'}
                </div>
              </div>
              <Button variant="link" size="sm" className="p-0 h-auto mt-2" asChild>
                <a href="/dashboard/contexto">Gerenciar contexto</a>
              </Button>
            </div>

            {/* Fluxo orientado para novo usuário */}
            <div className="mb-4">
              <ProgramFlowGuide />
            </div>

            {/* 📊 ESTATÍSTICAS LOCAIS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Estudantes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalEstudantes}</div>
                  <p className="text-xs text-muted-foreground">Em sua congregação</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Programas</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalProgramas}</div>
                  <p className="text-xs text-muted-foreground">Disponíveis para uso</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Designações</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalDesignacoes}</div>
                  <p className="text-xs text-muted-foreground">Ativas este mês</p>
                </CardContent>
              </Card>
            </div>

            {/* 🚀 AÇÕES RÁPIDAS INSTRUTOR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Designações da Semana
                  </CardTitle>
                  <CardDescription>
                    Gerencie as designações da próxima reunião
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : recentAssignments.length > 0 ? (
                    recentAssignments.slice(0, 3).map((assignment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-sm">{assignment.estudantes?.nome}</p>
                            <p className="text-xs text-muted-foreground">{assignment.tipo_parte}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{assignment.confirmado ? 'Confirmado' : 'Pendente'}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma designação esta semana</p>
                    </div>
                  )}
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Gerenciar Designações
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Materiais Disponíveis
                  </CardTitle>
                  <CardDescription>
                    Acesse os materiais oficiais para suas reuniões
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Apostila MWB Setembro-Outubro 2025</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Sistema S-38 configurado e ativo</span>
                  </div>
                  <Button className="w-full">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Ver Materiais
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="estudantes">Estudantes</TabsTrigger>
              <TabsTrigger value="programas">Programas</TabsTrigger>
              <TabsTrigger value="designacoes">Designações</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Bem-vindo, {profile.nome || profile.email}!</CardTitle>
                  <CardDescription>
                    Gerencie sua congregação e designações de forma eficiente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>✅ Sistema S-38 configurado e ativo</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <span>📈 {dashboardStats.totalEstudantes} estudantes ativos</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <span>📅 {dashboardStats.totalDesignacoes} designações este mês</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="estudantes">
              <Card>
                <CardHeader>
                  <CardTitle>Gestão de Estudantes</CardTitle>
                  <CardDescription>
                    Cadastre e gerencie os estudantes da sua congregação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Users className="mr-2 h-4 w-4" />
                    Gerenciar Estudantes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="programas">
              <Card>
                <CardHeader>
                  <CardTitle>Programas Disponíveis</CardTitle>
                  <CardDescription>
                    Acesse os materiais oficiais e crie programações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Ver Programas
                  </Button>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Programação Especial — Janeiro 2026</CardTitle>
                  <CardDescription>Pré-visualização de 4 semanas adicionadas ao dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {programacaoEspecialJaneiro2026.map((semana) => (
                      <div key={semana.idSemana} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">{semana.semanaLabel}</p>
                            <p className="text-sm text-muted-foreground">{semana.tema}</p>
                          </div>
                          <Badge variant="secondary">{semana.idSemana}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {semana.programacao.map((secao: any, idx: number) => (
                            <div key={idx} className="bg-muted p-3 rounded">
                              <p className="font-medium mb-2">{secao.secao}</p>
                              <ul className="space-y-1 text-sm">
                                {secao.partes.map((parte: any) => (
                                  <li key={parte.idParte} className="flex justify-between">
                                    <span>{parte.titulo}</span>
                                    <span className="text-muted-foreground">{parte.duracaoMin} min</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="designacoes">
              <Card>
                <CardHeader>
                  <CardTitle>Sistema de Designações</CardTitle>
                  <CardDescription>
                    Crie e gerencie designações respeitando as regras S-38
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    Gerenciar Designações
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </>
    );
  }

  // 👨‍🎓 DASHBOARD ESTUDANTE - VISÃO INDIVIDUAL
  if (profile.role === 'estudante') {
    return (
      <>
        <UnifiedNavigation />
        <div className="container mx-auto p-6 max-w-4xl">
          <UnifiedBreadcrumbs />
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Meu Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Bem-vindo, {profile.nome || 'Estudante'}!
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Minhas Designações</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalDesignacoes}</div>
                <p className="text-xs text-muted-foreground">Este mês</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Ativo</div>
                <p className="text-xs text-muted-foreground">Participando ativamente</p>
              </CardContent>
            </Card>
          </div>

          {/* 🚀 AÇÕES RÁPIDAS ESTUDANTE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Próximas Designações
                </CardTitle>
                <CardDescription>
                  Visualize suas próximas participações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : recentAssignments.length > 0 ? (
                  recentAssignments.slice(0, 3).map((assignment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-sm">{assignment.titulo_parte || assignment.tipo_parte}</p>
                          <p className="text-xs text-muted-foreground">
                            {assignment.programas?.mes_apostila} - Semana {assignment.programas?.semana}
                          </p>
                        </div>
                      </div>
                      <Badge variant={assignment.confirmado ? "default" : "secondary"}>
                        {assignment.confirmado ? 'Confirmado' : 'Pendente'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma designação pendente</p>
                  </div>
                )}
                <Button className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Ver Todas as Designações
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Materiais de Preparo
                </CardTitle>
                <CardDescription>
                  Acesse os materiais para suas designações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Apostila MWB Setembro-Outubro 2025</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Instruções S-38 disponíveis</span>
                </div>
                <Button className="w-full">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Acessar Materiais
                </Button>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="designacoes">Minhas Designações</TabsTrigger>
              <TabsContent value="materiais">Materiais</TabsContent>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo da Semana</CardTitle>
                  <CardDescription>
                    Suas próximas designações e preparativos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <span>📅 Próxima designação: Domingo, 25/08/2025</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <BookOpen className="h-5 w-5 text-green-600" />
                      <span>📖 Material: Apostila MWB Setembro-Outubro 2025</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                      <span>✅ Sistema S-38: Regras aplicadas automaticamente</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="designacoes">
              <Card>
                <CardHeader>
                  <CardTitle>Minhas Designações</CardTitle>
                  <CardDescription>
                    Visualize e confirme suas participações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    Ver Designações
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="materiais">
              <Card>
                <CardHeader>
                  <CardTitle>Materiais de Preparo</CardTitle>
                  <CardDescription>
                    Acesse os materiais oficiais para suas designações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Acessar Materiais
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </>
    );
  }

  // 🚨 ROLE NÃO RECONHECIDO
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Role Não Reconhecido</CardTitle>
          <CardDescription>
            Seu perfil possui um role que não é suportado pelo sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Role atual: <strong>{profile.role}</strong>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Entre em contato com o administrador para resolver este problema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

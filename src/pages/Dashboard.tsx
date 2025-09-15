import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BookOpen, 
  ClipboardList, 
  BarChart2, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Plus,
  ArrowRight
} from "lucide-react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { useNavigate } from "react-router-dom";
import { useEstudantes } from "@/hooks/useEstudantes";

const Dashboard = () => {
  const navigate = useNavigate();

  const { estudantes, isLoading: estudantesLoading } = useEstudantes();
  
  // Estatísticas reais dos estudantes
  const stats = useMemo(() => {
    const total = estudantes?.length || 0;
    const ativos = estudantes?.filter((e: any) => e.ativo)?.length || 0;
    return {
      totalEstudantes: total,
      estudantesAtivos: ativos,
      designacoesPendentes: 0, // TODO: implementar contagem real
      proximaReuniao: "2025-07-07"
    };
  }, [estudantes]);

  return (
    <SidebarLayout 
      title="Dashboard do Instrutor"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/estudantes')}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Estudante
          </Button>
          <Button size="sm" onClick={() => navigate('/designacoes')}>
            <ArrowRight className="w-4 h-4 mr-2" />
            Gerar Designações
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Estudantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEstudantes}</div>
              <p className="text-xs text-muted-foreground">Cadastrados no sistema</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estudantes Ativos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.estudantesAtivos}</div>
              <p className="text-xs text-muted-foreground">Disponíveis para designações</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Designações Pendentes</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.designacoesPendentes}</div>
              <p className="text-xs text-muted-foreground">Aguardando atribuição</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próxima Reunião</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">12/12</div>
              <p className="text-xs text-muted-foreground">Quinta-feira</p>
            </CardContent>
          </Card>
        </div>

        {/* Ações rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>
              Acesso direto às principais funcionalidades do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/estudantes')}
              >
                <Users className="w-8 h-8" />
                <span>Gerenciar Estudantes</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/programas')}
              >
                <BookOpen className="w-8 h-8" />
                <span>Importar Programa</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/designacoes')}
              >
                <ClipboardList className="w-8 h-8" />
                <span>Gerar Designações</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/relatorios')}
              >
                <BarChart2 className="w-8 h-8" />
                <span>Ver Relatórios</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DownloadCloud, 
  FileText, 
  Users, 
  Activity, 
  Settings, 
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Database,
  Server,
  Upload
} from "lucide-react";

const AdminDashboard = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  const stats = [
    {
      title: "Total de Materiais",
      value: "247",
      icon: FileText,
      change: "+12 esta semana",
      color: "text-primary"
    },
    {
      title: "Congregações Ativas",
      value: "18",
      icon: Users,
      change: "+2 este mês",
      color: "text-success"
    },
    {
      title: "Downloads Hoje",
      value: "1,234",
      icon: DownloadCloud,
      change: "+8.2%",
      color: "text-info"
    },
    {
      title: "Sistema Status",
      value: "Online",
      icon: Activity,
      change: "99.9% uptime",
      color: "text-success"
    }
  ];

  const recentMaterials = [
    {
      name: "A Sentinela - Janeiro 2024",
      type: "PDF",
      size: "2.4 MB",
      status: "published",
      date: "2024-01-15"
    },
    {
      name: "Livro do Mês - Estudo Bíblico",
      type: "EPUB",
      size: "1.8 MB",
      status: "processing",
      date: "2024-01-14"
    },
    {
      name: "Reunião Vida e Ministério - Janeiro",
      type: "JWPub",
      size: "856 KB",
      status: "published",
      date: "2024-01-13"
    },
    {
      name: "Assembleia Regional 2024",
      type: "PDF",
      size: "4.2 MB",
      status: "draft",
      date: "2024-01-12"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-success/10 text-success border-success/20">Publicado</Badge>;
      case 'processing':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Processando</Badge>;
      case 'draft':
        return <Badge className="bg-muted/10 text-muted-foreground border-muted/20">Rascunho</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Sistema Ministerial
            </h1>
            <p className="text-muted-foreground mt-1">
              Painel Administrativo - Gerenciamento Completo
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-primary text-primary-foreground">AD</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="transition-all duration-200 hover:shadow-lg hover:shadow-primary/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.change}
                      </p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-muted/50">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="downloads" className="gap-2">
              <DownloadCloud className="h-4 w-4" />
              Downloads
            </TabsTrigger>
            <TabsTrigger value="materials" className="gap-2">
              <FileText className="h-4 w-4" />
              Materiais
            </TabsTrigger>
            <TabsTrigger value="publish" className="gap-2">
              <Upload className="h-4 w-4" />
              Publicação
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <Server className="h-4 w-4" />
              Sistema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-success" />
                    Status do Sistema
                  </CardTitle>
                  <CardDescription>
                    Monitoramento em tempo real dos serviços
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Backend API</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
                      <span className="text-sm text-success">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Banco de Dados</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
                      <span className="text-sm text-success">Conectado</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">JW.org Scraper</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-warning animate-pulse"></div>
                      <span className="text-sm text-warning">Processando</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Storage</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
                      <span className="text-sm text-success">94% livre</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-info" />
                    Atividade Recente
                  </CardTitle>
                  <CardDescription>
                    Últimas ações no sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Material "A Sentinela" publicado</span>
                      <span className="text-xs text-muted-foreground ml-auto">há 2 min</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <DownloadCloud className="h-4 w-4 text-primary" />
                      <span className="text-sm">Download concluído: Janeiro 2024</span>
                      <span className="text-xs text-muted-foreground ml-auto">há 15 min</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-info" />
                      <span className="text-sm">Nova congregação adicionada</span>
                      <span className="text-xs text-muted-foreground ml-auto">há 1 hora</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-4 w-4 text-warning" />
                      <span className="text-sm">Manutenção programada às 2:00</span>
                      <span className="text-xs text-muted-foreground ml-auto">há 3 horas</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Materials */}
            <Card>
              <CardHeader>
                <CardTitle>Materiais Recentes</CardTitle>
                <CardDescription>
                  Últimos materiais processados pelo sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMaterials.map((material, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium">{material.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {material.type} • {material.size} • {material.date}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(material.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="downloads" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Central de Downloads JW.org</CardTitle>
                <CardDescription>
                  Configure e monitore downloads automáticos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <DownloadCloud className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Sistema de Downloads</h3>
                  <p className="text-muted-foreground mb-4">
                    Para funcionalidade completa, conecte ao Supabase
                  </p>
                  <Button className="gap-2">
                    <Database className="h-4 w-4" />
                    Configurar Backend
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Biblioteca de Materiais</CardTitle>
                <CardDescription>
                  Gerencie todos os materiais disponíveis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMaterials.map((material, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <FileText className="h-10 w-10 text-primary" />
                        <div>
                          <p className="font-medium">{material.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Formato: {material.type} • Tamanho: {material.size}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(material.status)}
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="publish" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Centro de Publicação</CardTitle>
                <CardDescription>
                  Publique materiais para congregações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Sistema de Publicação</h3>
                  <p className="text-muted-foreground mb-4">
                    Controle a distribuição de materiais para congregações
                  </p>
                  <Button variant="outline" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Configurar Publicação
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monitoramento do Sistema</CardTitle>
                  <CardDescription>
                    Performance e métricas em tempo real
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU Usage</span>
                      <span>24%</span>
                    </div>
                    <Progress value={24} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Memory</span>
                      <span>68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Storage</span>
                      <span>94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Logs do Sistema</CardTitle>
                  <CardDescription>
                    Registros de atividade recente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="text-success">[INFO] Sistema iniciado com sucesso</div>
                    <div className="text-primary">[DEBUG] Conectando ao banco de dados...</div>
                    <div className="text-success">[INFO] Conexão estabelecida</div>
                    <div className="text-warning">[WARN] Rate limit ativo para JW.org</div>
                    <div className="text-success">[INFO] Material processado: A Sentinela</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
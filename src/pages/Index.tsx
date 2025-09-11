import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Users, 
  BookOpen, 
  DownloadCloud, 
  FileText,
  ArrowRight,
  Database,
  Server
} from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const dashboards = [
    {
      title: "Admin Dashboard",
      description: "Controle total do sistema, downloads automáticos da JW.org e gerenciamento de materiais",
      icon: Settings,
      path: "/admin",
      color: "from-primary to-primary-glow",
      features: ["Downloads JW.org", "Gerenciamento de Materiais", "Controle de Usuários", "Monitoramento"]
    },
    {
      title: "Dashboard Instrutor", 
      description: "Gerencie estudantes, programas ministeriais e designações da congregação",
      icon: Users,
      path: "/dashboard",
      color: "from-info to-info/80",
      features: ["Gerenciar Estudantes", "Programas Ministeriais", "Designações", "Relatórios"]
    },
    {
      title: "Portal do Estudante",
      description: "Acesse materiais publicados e acompanhe seu progresso ministerial",
      icon: BookOpen, 
      path: "/estudante",
      color: "from-success to-success/80",
      features: ["Materiais Publicados", "Histórico Pessoal", "Programa Semanal", "Recursos de Estudo"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary-glow/10" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent mb-6">
              Sistema Ministerial
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Plataforma completa para gerenciamento de materiais, programas e congregações com integração automática à JW.org
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/admin">
                <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90">
                  <Settings className="h-5 w-5" />
                  Acesso Administrativo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="gap-2">
                  <Users className="h-5 w-5" />
                  Login do Sistema
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboards Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Dashboards Disponíveis</h2>
          <p className="text-muted-foreground">
            Diferentes interfaces para cada perfil de usuário
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((dashboard, index) => {
            const Icon = dashboard.icon;
            return (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:shadow-primary/10 border-2 hover:border-primary/20">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${dashboard.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{dashboard.title}</CardTitle>
                  <CardDescription className="text-base">
                    {dashboard.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {dashboard.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link to={dashboard.path}>
                    <Button className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground">
                      Acessar Dashboard
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-muted/20 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Funcionalidades do Sistema</h2>
            <p className="text-muted-foreground">
              Recursos avançados para gestão ministerial completa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: DownloadCloud,
                title: "Downloads Automáticos",
                description: "Sincronização automática com JW.org"
              },
              {
                icon: FileText,
                title: "Gerenciamento de Materiais",
                description: "Organização e distribuição eficiente"
              },
              {
                icon: Users,
                title: "Controle de Usuários",
                description: "Diferentes níveis de acesso"
              },
              {
                icon: Database,
                title: "Backup Automático",
                description: "Segurança e confiabilidade dos dados"
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center border-0 bg-background/50">
                  <CardContent className="pt-6">
                    <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Backend Notice */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Card className="border-2 border-info/20 bg-info/5">
          <CardContent className="p-8 text-center">
            <Server className="h-12 w-12 text-info mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3">Funcionalidades Completas</h3>
            <p className="text-muted-foreground mb-6">
              Para acessar todas as funcionalidades incluindo downloads automáticos, 
              autenticação e banco de dados, conecte ao Supabase usando o botão verde no canto superior direito.
            </p>
            <Badge className="bg-info/10 text-info border-info/20">
              Backend Integration Required
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;

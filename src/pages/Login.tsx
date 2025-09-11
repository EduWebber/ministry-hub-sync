import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Settings, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const roles = [
    {
      id: "admin",
      title: "Administrador",
      description: "Acesso total ao sistema",
      icon: Settings,
      color: "bg-primary/10 text-primary border-primary/20"
    },
    {
      id: "instructor",
      title: "Instrutor",
      description: "Gerenciar programas e estudantes",
      icon: Users,
      color: "bg-info/10 text-info border-info/20"
    },
    {
      id: "student",
      title: "Estudante", 
      description: "Acesso aos materiais publicados",
      icon: BookOpen,
      color: "bg-success/10 text-success border-success/20"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-2">
            Sistema Ministerial
          </h1>
          <p className="text-muted-foreground">
            Plataforma de Gerenciamento e Materiais
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Fazer Login</CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Perfil de Acesso</Label>
              <div className="grid grid-cols-1 gap-2">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <Card
                      key={role.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedRole === role.id ? 'ring-2 ring-primary shadow-md' : ''
                      }`}
                      onClick={() => setSelectedRole(role.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-primary" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{role.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {role.description}
                            </div>
                          </div>
                          <Badge className={role.color} variant="outline">
                            {role.title}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <Button 
              className="w-full h-11"
              disabled={!selectedRole}
            >
              Entrar no Sistema
            </Button>

            <div className="text-center space-y-2">
              <Button variant="link" size="sm" className="text-muted-foreground">
                Esqueceu sua senha?
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Para funcionalidades completas, conecte ao Supabase usando o botão verde no canto superior direito
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  ClipboardList, 
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface UnifiedLayoutProps {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const navigationItems = [
  { path: '/bem-vindo', label: 'Bem-vindo', icon: Home },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/estudantes', label: 'Estudantes', icon: Users },
  { path: '/programas', label: 'Programas', icon: Calendar },
  { path: '/designacoes', label: 'Designações', icon: ClipboardList },
  { path: '/relatorios', label: 'Relatórios', icon: BarChart3 },
];

const UnifiedLayout: React.FC<UnifiedLayoutProps> = ({ title, actions, children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            <div>
              <h2 className="font-semibold text-sm">Sistema Ministerial</h2>
              <p className="text-xs text-gray-500">{profile?.nome}</p>
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarMenu>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => navigate(item.path)}
                    className="w-full justify-start"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        
        <SidebarFooter className="p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </SidebarFooter>
      </Sidebar>
      
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1 flex items-center justify-between">
            <h1 className="text-xl font-semibold">{title}</h1>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default UnifiedLayout;
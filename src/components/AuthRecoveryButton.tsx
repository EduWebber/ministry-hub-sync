/**
 * Componente simplificado para correção de problemas de autenticação
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthRecoveryButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const AuthRecoveryButton: React.FC<AuthRecoveryButtonProps> = ({
  variant = 'outline',
  size = 'default',
  className = ''
}) => {
  const [isRecovering, setIsRecovering] = useState(false);
  const { signOut, authError } = useAuth();

  const handleRecovery = async () => {
    setIsRecovering(true);
    try {
      console.log('🔧 Starting auth recovery process...');
      await signOut();
      
      // Clear local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Reload page
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('❌ Error during auth recovery:', error);
    } finally {
      setIsRecovering(false);
    }
  };

  // Mostrar botão apenas se houver erro de autenticação
  if (!authError) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 p-4 border border-orange-200 bg-orange-50 rounded-lg">
      <div className="flex items-center gap-2 text-orange-800">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">Problema de Autenticação</span>
      </div>
      
      <p className="text-sm text-orange-700">
        Sua sessão expirou. Clique no botão abaixo para corrigir.
      </p>
      
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleRecovery}
        disabled={isRecovering}
      >
        {isRecovering ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Corrigindo...
          </>
        ) : (
          <>
            <LogOut className="h-4 w-4 mr-2" />
            Corrigir Autenticação
          </>
        )}
      </Button>
    </div>
  );
};

export default AuthRecoveryButton;
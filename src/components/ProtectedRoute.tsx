import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'instrutor' | 'estudante';
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    // Redirect based on user role
    switch (profile?.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'instrutor':
        return <Navigate to="/dashboard" replace />;
      case 'estudante':
        return <Navigate to="/estudante" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
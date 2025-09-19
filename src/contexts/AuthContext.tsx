import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id?: string;
  nome: string;
  email: string;
  role: 'admin' | 'instrutor' | 'estudante';
  congregacao_id?: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isInstrutor: boolean;
  isEstudante: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, profileData: Partial<Profile>) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  refreshAuth: () => Promise<void>;
  clearAuthError: () => void;
  authError: string | null;
  updateProfile: (updates: Partial<Profile>) => Promise<{ data: any; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Load user profile
  const loadProfile = useCallback(async (userId: string) => {
    try {
      console.log('Loading profile for user:', userId);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        setAuthError(`Erro ao carregar perfil: ${profileError.message}`);
        return;
      }

      if (profileData) {
        console.log('Profile loaded successfully:', profileData);
        setProfile(profileData);
        setAuthError(null);
      } else {
        console.log('No profile found, creating one');
        // Create profile from user data
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const newProfile = {
            user_id: userId,
            nome: userData.user.email?.split('@')[0] || 'Usuário',
            email: userData.user.email || '',
            role: 'instrutor' as const,
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select('*')
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            setAuthError('Erro ao criar perfil');
          } else {
            setProfile(createdProfile);
            setAuthError(null);
          }
        }
      }
    } catch (error) {
      console.error('Error in loadProfile:', error);
      setAuthError('Erro interno ao carregar perfil');
    }
  }, []);

  // Handle auth state changes
  const handleAuthStateChange = useCallback(async (event: string, session: Session | null) => {
    console.log('Auth state change:', event, session?.user?.id);
    
    try {
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in:', session.user.id);
        setUser(session.user);
        await loadProfile(session.user.id);
        setAuthError(null);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        setProfile(null);
        setAuthError(null);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('Token refreshed for user:', session.user.id);
        setUser(session.user);
        await loadProfile(session.user.id);
        setAuthError(null);
      }
    } catch (error) {
      console.error('Error handling auth state change:', error);
      setAuthError('Erro ao processar mudança de autenticação');
    } finally {
      setLoading(false);
    }
  }, [loadProfile]);

  // Initialize auth
  const refreshAuth = useCallback(async () => {
    try {
      console.log('Refreshing authentication...');
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setAuthError(`Erro de sessão: ${sessionError.message}`);
        return;
      }

      if (session) {
        console.log('Valid session found');
        setUser(session.user);
        await loadProfile(session.user.id);
      } else {
        console.log('No valid session found');
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error refreshing auth:', error);
      setAuthError('Erro ao atualizar autenticação');
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [loadProfile]);

  // Sign in
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      setLoading(true);
      setAuthError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        setAuthError(error.message);
        return { error };
      }

      console.log('Sign in successful');
      return { error: null };
    } catch (error: any) {
      console.error('Unexpected error during sign in:', error);
      setAuthError('Erro inesperado durante o login');
      return { error: error };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign up
  const signUp = useCallback(async (email: string, password: string, profileData: Partial<Profile>) => {
    try {
      console.log('Attempting sign up for:', email);
      setLoading(true);
      setAuthError(null);

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nome: profileData.nome,
            role: profileData.role || 'instrutor'
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        setAuthError(error.message);
        return { error };
      }

      console.log('Sign up successful');
      return { error: null };
    } catch (error: any) {
      console.error('Unexpected error during sign up:', error);
      setAuthError('Erro inesperado durante o registro');
      return { error: error };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      console.log('Signing out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        setAuthError(error.message);
        return { error };
      }

      setUser(null);
      setProfile(null);
      setAuthError(null);
      console.log('Sign out successful');
      return { error: null };
    } catch (error: any) {
      console.error('Unexpected error during sign out:', error);
      setAuthError('Erro durante o logout');
      return { error: error };
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    try {
      if (!user) {
        return { data: null, error: { message: 'No user logged in' } };
      }
      
      console.log('Updating profile for user_id:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return { data: null, error };
      }
      
      if (data) {
        setProfile(data);
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return { data: null, error };
    }
  }, [user]);

  // Clear auth error
  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Initialize auth listener
  useEffect(() => {
    console.log('Setting up auth listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
    
    // Get initial session
    refreshAuth();

    return () => {
      console.log('Cleaning up auth listener...');
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange, refreshAuth]);

  // Computed values
  const isAdmin = profile?.role === 'admin';
  const isInstrutor = profile?.role === 'instrutor' || profile?.role === 'admin';
  const isEstudante = profile?.role === 'estudante';

  const value: AuthContextType = {
    user,
    profile,
    isAdmin,
    isInstrutor,
    isEstudante,
    loading,
    signIn,
    signUp,
    signOut,
    refreshAuth,
    clearAuthError,
    authError,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../integrations/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { checkAndClearInvalidTokens, recoverFromAuthError, clearAuthStorage } from '@/utils/auth-recovery';

interface Profile {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  role: string;
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
  forceClearInvalidTokens: () => Promise<void>;
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
  // Check if we're in mock mode
  const isMockMode = import.meta.env.VITE_MOCK_MODE === 'true';
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // 🔄 Função para recuperar autenticação
  const refreshAuth = useCallback(async () => {
    // If in mock mode, set up mock user and profile
    if (isMockMode) {
      console.log('🧪 Mock mode: setting up mock user and profile');
      const mockUser: User = {
        id: 'mock-user-id',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'demo@example.com',
        email_confirmed_at: new Date().toISOString(),
        phone: '',
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
        identities: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as User;
      
      setUser(mockUser);
      await loadProfile(mockUser.id);
      setLoading(false);
      return;
    }
    
    try {
      console.log('🔄 Attempting to refresh authentication...');
      
      // Primeiro, verificar e limpar tokens inválidos
      const tokenCheck = await checkAndClearInvalidTokens();
      if (tokenCheck.cleared) {
        console.log('🧹 Invalid tokens were cleared, auth state reset');
        setUser(null);
        setProfile(null);
        setAuthError('Sessão expirada. Por favor, faça login novamente.');
        setLoading(false);
        return;
      }
      
      // Tentar obter sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        
        // Tentar recuperar do erro
        const recovery = await recoverFromAuthError(sessionError);
        if (recovery.recovered) {
          console.log('✅ Recovered from session error:', recovery.action);
          if (recovery.action === 'force_signout') {
            setUser(null);
            setProfile(null);
            setAuthError('Sessão expirada. Por favor, faça login novamente.');
            setLoading(false);
            return;
          }
        }
        
        setAuthError(`Erro de sessão: ${sessionError.message}`);
        return;
      }

      if (session) {
        console.log('✅ Valid session found, updating user state');
        setUser(session.user);
        await loadProfile(session.user.id);
      } else {
        console.log('⚠️ No valid session found, clearing auth state');
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('❌ Error refreshing auth:', error);
      
      // Tentar recuperar do erro
      const recovery = await recoverFromAuthError(error);
      if (recovery.recovered) {
        console.log('✅ Recovered from refresh error:', recovery.action);
        if (recovery.action === 'force_signout') {
          setUser(null);
          setProfile(null);
          setAuthError('Sessão expirada. Por favor, faça login novamente.');
        }
      } else {
        setAuthError('Erro ao atualizar autenticação');
        // Limpar estado em caso de erro crítico
        setUser(null);
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔄 Função para carregar perfil do usuário
  const loadProfile = useCallback(async (userId: string) => {
    // If in mock mode, return mock profile data
    if (isMockMode) {
      console.log('🧪 Mock mode: returning mock profile data');
      const mockProfile: Profile = {
        id: userId,
        user_id: userId,
        nome: 'Instrutor Demo',
        email: 'demo@example.com',
        role: 'instrutor',
        congregacao_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setProfile(mockProfile);
      setAuthError(null);
      return;
    }
    
    try {
      console.log('🔍 Loading profile for user:', userId);
      
      // Verificar se o cliente Supabase está configurado corretamente
      if (!supabase) {
        console.error('❌ Cliente Supabase não inicializado');
        setAuthError('Erro de configuração do Supabase: cliente não inicializado');
        return;
      }
      
      console.log('🔄 Tentando carregar perfil do Supabase...');
      
      // First, check if the user_id column exists in the profiles table
      let hasUserIdColumn = true;
      try {
        // Try a simple query to check if user_id column exists
        await supabase.from('profiles').select('user_id').limit(1);
      } catch (columnCheckError) {
        if (columnCheckError && 
            (columnCheckError.message.includes('column profiles.user_id does not exist') || 
             (columnCheckError as any).code === '42703')) {
          hasUserIdColumn = false;
          console.log('⚠️ user_id column does not exist in profiles table');
        }
      }
      
      let profileData: any = null;
      let profileError: any = null;
      
      if (hasUserIdColumn) {
        // Use the new schema with user_id column
        try {
          const result = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
          profileData = result.data;
          profileError = result.error;
        } catch (e) {
          profileError = e;
        }
      } else {
        // Use the legacy schema with id column
        try {
          const result = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          profileData = result.data;
          profileError = result.error;
        } catch (e) {
          profileError = e;
        }
      }
        
      // If the primary approach failed, try a fallback
      if ((profileError || !profileData) && hasUserIdColumn) {
        console.warn('⚠️ user_id query failed, trying legacy profile lookup');
        try {
          const result = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          profileData = result.data;
          profileError = result.error;
        } catch (e) {
          profileError = e;
        }
      }
        
      // Verificar se houve erro na requisição
      if (profileError && !profileData) {
        console.error('❌ Error loading profile:', profileError);
        setAuthError(`Erro ao carregar perfil: ${profileError.message}`);
        return;
      }
      
      // Verificar se o perfil foi encontrado
      if (!profileData) {
        console.warn('⚠️ No profile found in profiles table, creating from user metadata');
        
        // Se não encontrou na tabela profiles, criar a partir dos metadados do usuário
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const metadata = userData.user.user_metadata;
          
          // Criar perfil a partir dos metadados
          const profileFromMetadata = {
            id: 'temp-' + userId,
            user_id: userId,
            nome: metadata.nome_completo || userData.user.email?.split('@')[0] || 'Usuário',
            role: metadata.role || 'instrutor',
            email: userData.user.email || '',
            congregacao_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log('✅ Profile created from metadata:', profileFromMetadata);
          setProfile(profileFromMetadata);
          return;
        }
        
        setAuthError('Perfil não encontrado. Entre em contato com o administrador.');
        return;
      }

      if (profileData) {
        console.log('✅ Profile loaded successfully:', profileData);
        
        // Garantir que o perfil tenha o campo role
        const profileWithRole = {
          ...profileData,
          role: profileData.role || 'instrutor', // Fallback se role não existir
          email: user?.email || '', // Adicionar email do user
        };
        
        setProfile(profileWithRole);
        setAuthError(null);
      } else {
        console.log('⚠️ No profile found for user');
        setProfile(null);
      }
    } catch (error) {
      console.error('❌ Error in loadProfile:', error);
      setAuthError('Erro interno ao carregar perfil');
    }
  }, []);

  // 🔄 Função para lidar com mudanças de autenticação
  const handleAuthStateChange = useCallback(async (event: string, session: Session | null) => {
    // If in mock mode, skip handling auth state changes from Supabase
    if (isMockMode) {
      console.log('🧪 Mock mode: skipping auth state change handling');
      setLoading(false);
      return;
    }
    
    console.log('🔄 Auth state change:', event, session?.user?.id);
    
    try {
      if (event === 'SIGNED_IN' && session) {
        console.log('✅ User signed in:', session.user.id);
        setUser(session.user);
        await loadProfile(session.user.id);
        setAuthError(null); // Limpar erros anteriores
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 User signed out');
        setUser(null);
        setProfile(null);
        setAuthError(null);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('🔄 Token refreshed for user:', session.user.id);
        setUser(session.user);
        await loadProfile(session.user.id);
        setAuthError(null);
      } else if (event === 'USER_UPDATED' && session) {
        console.log('👤 User updated:', session.user.id);
        setUser(session.user);
        await loadProfile(session.user.id);
      }
    } catch (error) {
      console.error('❌ Error handling auth state change:', error);
      setAuthError('Erro ao processar mudança de autenticação');
    } finally {
      setLoading(false);
    }
  }, [loadProfile]);

  // 🔄 Função para lidar com erros de autenticação
  const handleAuthError = useCallback((error: AuthError) => {
    console.error('❌ Auth error detected:', error);
    
    if (error.message.includes('Invalid Refresh Token') || 
        error.message.includes('Refresh Token Not Found') ||
        error.message.includes('JWT expired')) {
      
      console.log('🔄 Invalid refresh token detected, clearing auth state');
      setUser(null);
      setProfile(null);
      setAuthError('Sessão expirada. Por favor, faça login novamente.');
      
      // Limpar tokens inválidos
      supabase.auth.signOut();
    } else {
      setAuthError(`Erro de autenticação: ${error.message}`);
    }
  }, []);

  // Update profile (used by onboarding/setup screens)
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    // If in mock mode, simulate profile update
    if (isMockMode) {
      console.log('🧪 Mock mode: simulating profile update');
      if (!user) {
        return { data: null, error: { message: 'No user logged in' } };
      }
      
      const updatedProfile = {
        ...profile,
        ...updates,
        updated_at: new Date().toISOString(),
      } as Profile;
      
      setProfile(updatedProfile);
      return { data: updatedProfile, error: null };
    }
    
    try {
      if (!user) {
        return { data: null, error: { message: 'No user logged in' } };
      }
      
      console.log('🔄 Updating profile for user_id:', user.id);
      
      // First, check if the user_id column exists in the profiles table
      let hasUserIdColumn = true;
      try {
        // Try a simple query to check if user_id column exists
        await supabase.from('profiles').select('user_id').limit(1);
      } catch (columnCheckError) {
        if (columnCheckError && 
            (columnCheckError.message.includes('column profiles.user_id does not exist') || 
             (columnCheckError as any).code === '42703')) {
          hasUserIdColumn = false;
          console.log('⚠️ user_id column does not exist in profiles table');
        }
      }
      
      let { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        } as any)
        .eq(hasUserIdColumn ? 'user_id' : 'id', user.id)
        .select('*')
        .maybeSingle();

      // If update failed because profile doesn't exist, create it
      if (error && (error as any).code === 'PGRST116') {
        console.log('ℹ️ Profile not found, creating new profile');
        
        const { data: userData } = await supabase.auth.getUser();
        const metadata = userData.user?.user_metadata || {};
        
        // Create new profile
        const profileData: any = {
          email: user.email,
          nome: (updates as any).nome || metadata.nome || user.email?.split('@')[0] || 'Usuário',
          role: metadata.role || 'instrutor',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        // Add the appropriate ID field based on schema
        if (hasUserIdColumn) {
          profileData.user_id = user.id;
        } else {
          profileData.id = user.id;
        }
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select('*')
          .single();

        if (insertError) {
          console.error('❌ Error creating profile:', insertError);
          return { data: null, error: insertError };
        }
        
        data = newProfile;
        error = null;
      }

      if (!error && data) {
        // Refresh local state with latest profile
        setProfile((prev) => ({ ...(prev || {} as Profile), ...data }));
      }
      
      return { data, error };
    } catch (error) {
      console.error('❌ Error in updateProfile:', error);
      return { data: null, error };
    }
  }, [user]);

  // 🔄 Função de login com tratamento de erro robusto
  const signIn = useCallback(async (email: string, password: string) => {
    // If in mock mode, simulate successful sign in
    if (isMockMode) {
      console.log('🧪 Mock mode: simulating successful sign in');
      setLoading(true);
      setAuthError(null);
      
      const mockUser: User = {
        id: 'mock-user-id',
        aud: 'authenticated',
        role: 'authenticated',
        email: email,
        email_confirmed_at: new Date().toISOString(),
        phone: '',
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
        identities: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as User;
      
      setUser(mockUser);
      await loadProfile(mockUser.id);
      setLoading(false);
      return { error: null };
    }
    
    try {
      console.log('🔐 Attempting sign in for:', email);
      setLoading(true);
      setAuthError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        setAuthError(`Erro no login: ${error.message}`);
        return { error };
      }

      if (data.user) {
        console.log('✅ Sign in successful for:', data.user.id);
        setUser(data.user);
        await loadProfile(data.user.id);
        setAuthError(null);
      }

      return { error: null };
    } catch (error) {
      console.error('❌ Unexpected error during sign in:', error);
      setAuthError('Erro inesperado durante o login');
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  }, [loadProfile]);

  // 🔄 Função de cadastro com tratamento de erro robusto
  const signUp = useCallback(async (email: string, password: string, profileData: Partial<Profile>) => {
    // If in mock mode, simulate successful sign up
    if (isMockMode) {
      console.log('🧪 Mock mode: simulating successful sign up');
      setLoading(true);
      setAuthError(null);
      
      const mockUser: User = {
        id: 'mock-user-id',
        aud: 'authenticated',
        role: 'authenticated',
        email: email,
        email_confirmed_at: new Date().toISOString(),
        phone: '',
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: profileData,
        identities: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as User;
      
      setUser(mockUser);
      setAuthError(null);
      setLoading(false);
      return { error: null };
    }
    
    try {
      console.log('📝 Attempting sign up for:', email);
      setLoading(true);
      setAuthError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: profileData,
        },
      });

      if (error) {
        console.error('❌ Sign up error:', error);
        setAuthError(`Erro no cadastro: ${error.message}`);
        return { error };
      }

      if (data.user) {
        console.log('✅ Sign up successful for:', data.user.id);
        setUser(data.user);
        setAuthError(null);
      }

      return { error: null };
    } catch (error) {
      console.error('❌ Unexpected error during sign up:', error);
      setAuthError('Erro inesperado durante o cadastro');
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔄 Função de logout com limpeza completa
  const signOut = useCallback(async (): Promise<{ error: AuthError | null }> => {
    // If in mock mode, simulate sign out
    if (isMockMode) {
      console.log('🧪 Mock mode: simulating sign out');
      setLoading(true);
      setUser(null);
      setProfile(null);
      setAuthError(null);
      setLoading(false);
      return { error: null };
    }
    
    try {
      console.log('🚪 Signing out user');
      setLoading(true);

      // Verificar se há uma sessão ativa antes de tentar logout
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('⚠️ No active session found, clearing local state only');
        setUser(null);
        setProfile(null);
        setAuthError(null);
        return { error: null };
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ Sign out error:', error);
        // Mesmo com erro, limpar estado local
        setUser(null);
        setProfile(null);
        setAuthError(null);
        return { error };
      }

      console.log('✅ Sign out successful');
      setUser(null);
      setProfile(null);
      setAuthError(null);
      return { error: null };
    } catch (err) {
      console.error('❌ Unexpected error during sign out:', err);
      // Mesmo com erro, limpar estado local
      setUser(null);
      setProfile(null);
      setAuthError(null);
      return { error: err as AuthError };
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔄 Função para limpar erros de autenticação
  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // 🔄 Função para forçar limpeza de tokens inválidos
  const forceClearInvalidTokens = useCallback(async () => {
    try {
      console.log('🧹 Force clearing invalid tokens...');
      
      // Usar utilitário de recuperação
      clearAuthStorage();
      
      // Limpar estado local
      setUser(null);
      setProfile(null);
      setAuthError(null);
      
      // Forçar logout no Supabase
      await supabase.auth.signOut();
      
      console.log('✅ Invalid tokens cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing invalid tokens:', error);
    }
  }, []);

  // 🔄 Efeito para inicializar autenticação (singleton subscription)
  const subscribedRef = useRef(false);
  useEffect(() => {
    // If in mock mode, skip Supabase auth subscription
    if (isMockMode) {
      console.log('🧪 Mock mode: skipping Supabase auth subscription');
      if (!subscribedRef.current) {
        subscribedRef.current = true;
        // Set up mock user and profile
        void refreshAuth();
      }
      return;
    }
    
    if (subscribedRef.current) {
      if (import.meta.env.DEV) console.log('👀 Auth listener already subscribed, skipping');
      return;
    }
    subscribedRef.current = true;

    console.log('🚀 Initializing authentication...');

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Encaminhar para o handler principal
      void handleAuthStateChange(event, session);

      // Tratamento específico para falha de refresh
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.log('🔄 Token refresh failed, clearing auth state');
        setUser(null);
        setProfile(null);
        setAuthError('Sessão expirada. Por favor, faça login novamente.');
      }
    });

    // Tentar recuperar sessão inicial
    void refreshAuth();

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up auth listeners');
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange, refreshAuth]);

  // 🔄 Computar se o usuário é admin
  const isAdmin = profile?.role === 'admin';
  const isInstrutor = profile?.role === 'instrutor';
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
    forceClearInvalidTokens,
    authError,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
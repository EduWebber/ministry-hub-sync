import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Database } from '@/integrations/supabase/types';

type EstudanteRow = Database['public']['Tables']['estudantes']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

// Check if we're in mock mode
const isMockMode = import.meta.env.VITE_MOCK_MODE === 'true';

export interface EstudanteWithParent extends EstudanteRow {
  nome: string;
  email?: string;
  telefone?: string;
  data_nascimento?: string;
  cargo?: ProfileRow['cargo'];
  // Add missing required fields for compatibility
  nome_completo?: string;
}

export interface EstudanteFilters {
  searchTerm: string;
  cargo: string;
  genero: string;
  ativo: string;
}

export interface EstudanteStatistics {
  total: number;
  ativos: number;
  inativos: number;
  menores: number;
  homens: number;
  mulheres: number;
  qualificados: number;
}

export function useEstudantes(activeTab?: string) {
  const { user } = useAuth();
  const [estudantes, setEstudantes] = useState<EstudanteWithParent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEstudantes = useCallback(async () => {
    // If in mock mode, return mock data
    if (isMockMode) {
      console.log('🧪 Mock mode: returning mock estudantes data');
      setIsLoading(true);
      setError(null);
      
      // Mock estudantes data
      const mockEstudantes: EstudanteWithParent[] = [
        {
          id: 'mock-estudante-1',
          nome: 'João Silva',
          nome_completo: 'João Silva',
          email: 'joao@example.com',
          telefone: '(11) 99999-9999',
          data_nascimento: '1990-01-01',
          cargo: 'publicador_batizado',
          genero: 'masculino',
          ativo: true,
          profile_id: 'mock-profile-1',
          created_at: new Date().toISOString(),
          congregacao_id: null,
          disponibilidade: null,
          qualificacoes: null,
          user_id: '550e8400-e29b-41d4-a716-446655440000'
        },
        {
          id: 'mock-estudante-2',
          nome: 'Maria Santos',
          nome_completo: 'Maria Santos',
          email: 'maria@example.com',
          telefone: '(11) 88888-8888',
          data_nascimento: '1995-05-15',
          cargo: 'publicador_batizado',
          genero: 'feminino',
          ativo: true,
          profile_id: 'mock-profile-2',
          created_at: new Date().toISOString(),
          congregacao_id: null,
          disponibilidade: null,
          qualificacoes: null,
          user_id: '550e8400-e29b-41d4-a716-446655440000'
        }
      ];
      
      setEstudantes(mockEstudantes);
      setIsLoading(false);
      return;
    }

    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Start with the most compatible query
      const { data: initialData, error: initialError } = await supabase
        .from('estudantes')
        .select(`
          id,
          genero,
          ativo,
          created_at
        `)
        .eq('ativo', true);

      if (initialError) {
        throw new Error(`Erro ao buscar estudantes: ${initialError.message}`);
      }

      // Try to get profile_id if the column exists
      let estudantesData = initialData || [];
      let hasProfileIdColumn = true;
      
      try {
        const { data: profileIdTest } = await supabase
          .from('estudantes')
          .select('profile_id')
          .limit(1);
      } catch (e) {
        hasProfileIdColumn = false;
      }

      // If profile_id column exists, fetch it
      if (hasProfileIdColumn) {
        const { data: fullData, error: fullError } = await supabase
          .from('estudantes')
          .select(`
            id,
            genero,
            ativo,
            created_at,
            profile_id
          `)
          .eq('ativo', true);
          
        if (!fullError) {
          estudantesData = fullData || [];
        }
      }

      // Try to get additional profile information
      let profileDataMap: Record<string, any> = {};
      
      // Only try to fetch profiles if profile_id exists in the data
      const profileIds = estudantesData
        .map((item: any) => item.profile_id)
        .filter((id: any) => id !== undefined && id !== null);
      
      if (profileIds.length > 0) {
        try {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, nome, email, telefone, data_nascimento, cargo')
            .in('id', profileIds);
            
          if (!profilesError && profilesData) {
            profileDataMap = profilesData.reduce((acc: any, profile: any) => {
              acc[profile.id] = profile;
              return acc;
            }, {});
          }
        } catch (profileError) {
          console.warn('Could not fetch profile data:', profileError);
        }
      }

      // Transform the data to match the expected interface
      const transformedData: EstudanteWithParent[] = estudantesData.map((item: any) => {
        const profile = profileDataMap[item.profile_id];
        return {
          id: item.id,
          nome: profile?.nome || 'Sem nome',
          nome_completo: profile?.nome || 'Sem nome',
          genero: item.genero,
          email: profile?.email || '',
          telefone: profile?.telefone || '',
          data_nascimento: profile?.data_nascimento || '',
          cargo: profile?.cargo || 'estudante_novo',
          ativo: item.ativo ?? true,
          profile_id: item.profile_id || null,
          created_at: item.created_at,
          // Add missing required fields with default values
          congregacao_id: null,
          disponibilidade: null,
          qualificacoes: null,
          user_id: null
        };
      });
      
      setEstudantes(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar estudantes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const createEstudante = useCallback(async (estudanteData: Partial<EstudanteWithParent>) => {
    // If in mock mode, simulate creating a estudante
    if (isMockMode) {
      console.log('🧪 Mock mode: simulating create estudante');
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const newEstudante: EstudanteWithParent = {
        id: `mock-estudante-${Date.now()}`,
        nome: estudanteData.nome || 'Novo Estudante',
        nome_completo: estudanteData.nome || 'Novo Estudante',
        email: estudanteData.email || '',
        telefone: estudanteData.telefone || '',
        data_nascimento: estudanteData.data_nascimento || '',
        cargo: estudanteData.cargo || 'estudante_novo',
        genero: estudanteData.genero || 'masculino',
        ativo: true,
        profile_id: `mock-profile-${Date.now()}`,
        created_at: new Date().toISOString(),
        congregacao_id: null,
        disponibilidade: null,
        qualificacoes: null,
        user_id: user.id
      };
      
      setEstudantes(prev => [...prev, newEstudante]);
      return newEstudante;
    }

    if (!user?.id) throw new Error('Usuário não autenticado');

    try {
      // First create or find the profile
      const profileData = {
        user_id: user.id,
        nome: estudanteData.nome || '',
        email: estudanteData.email || '',
        telefone: estudanteData.telefone || '',
        cargo: estudanteData.cargo || 'estudante_novo',
        role: 'estudante' as const
      };

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (profileError) throw profileError;

      // Then create the estudante record
      const estudanteRecord = {
        profile_id: profile.id,
        genero: estudanteData.genero || 'masculino',
        ativo: true
      };

      const { data, error } = await supabase
        .from('estudantes')
        .insert(estudanteRecord)
        .select()
        .single();

      if (error) throw error;

      await fetchEstudantes();
      return data;
    } catch (err) {
      console.error('Erro ao criar estudante:', err);
      throw err;
    }
  }, [user?.id, fetchEstudantes]);

  const updateEstudante = useCallback(async ({ id, data }: { id: string; data: Partial<EstudanteWithParent> }) => {
    // If in mock mode, simulate updating a estudante
    if (isMockMode) {
      console.log('🧪 Mock mode: simulating update estudante');
      setEstudantes(prev => 
        prev.map(estudante => 
          estudante.id === id ? { ...estudante, ...data } : estudante
        )
      );
      return { id, ...data };
    }

    try {
      // First get the estudante to find the profile_id
      const { data: estudante, error: fetchError } = await supabase
        .from('estudantes')
        .select('profile_id')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Update profile data if needed
      const profileFields = ['nome', 'email', 'telefone', 'cargo'];
      const profileData: any = {};
      const estudanteData: any = {};

      Object.entries(data).forEach(([key, value]) => {
        if (profileFields.includes(key)) {
          profileData[key] = value;
        } else {
          estudanteData[key] = value;
        }
      });

      // Update profile if there's profile data
      if (Object.keys(profileData).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', estudante.profile_id);

        if (profileError) throw profileError;
      }

      // Update estudante if there's estudante data
      if (Object.keys(estudanteData).length > 0) {
        const { error: estudanteError } = await supabase
          .from('estudantes')
          .update(estudanteData)
          .eq('id', id);

        if (estudanteError) throw estudanteError;
      }

      await fetchEstudantes();
      return { id, ...data };
    } catch (err) {
      console.error('Erro ao atualizar estudante:', err);
      throw err;
    }
  }, [fetchEstudantes]);

  const deleteEstudante = useCallback(async (estudanteId: string) => {
    // If in mock mode, simulate deleting a estudante
    if (isMockMode) {
      console.log('🧪 Mock mode: simulating delete estudante');
      setEstudantes(prev => 
        prev.map(estudante => 
          estudante.id === estudanteId ? { ...estudante, ativo: false } : estudante
        )
      );
      return;
    }

    try {
      const { error } = await supabase
        .from('estudantes')
        .update({ ativo: false })
        .eq('id', estudanteId);

      if (error) throw error;

      await fetchEstudantes();
    } catch (err) {
      console.error('Erro ao excluir estudante:', err);
      throw err;
    }
  }, [fetchEstudantes]);

  const filterEstudantes = useCallback((filters: EstudanteFilters) => {
    return estudantes.filter(estudante => {
      const matchesSearch = !filters.searchTerm || 
        estudante.nome.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesAtivo = filters.ativo === 'todos' || 
        (filters.ativo === 'ativo' && estudante.ativo) ||
        (filters.ativo === 'inativo' && !estudante.ativo);

      return matchesSearch && matchesAtivo;
    });
  }, [estudantes]);

  const getStatistics = useCallback((): EstudanteStatistics => {
    const total = estudantes.length;
    const ativos = estudantes.filter(e => e.ativo).length;
    const inativos = total - ativos;
    const homens = estudantes.filter(e => e.genero === 'masculino').length;
    const mulheres = estudantes.filter(e => e.genero === 'feminino').length;
    const qualificados = estudantes.filter(e => 
      ['anciao', 'servo_ministerial', 'publicador_batizado'].includes(e.cargo || '')
    ).length;

    return {
      total,
      ativos,
      inativos,
      menores: 0, // Not available without birth date calculation
      homens,
      mulheres,
      qualificados
    };
  }, [estudantes]);

  const refetch = useCallback(() => {
    return fetchEstudantes();
  }, [fetchEstudantes]);

  useEffect(() => {
    if (user?.id) {
      fetchEstudantes();
    }
  }, [user?.id, fetchEstudantes]);

  return {
    estudantes,
    isLoading,
    error,
    refetch,
    createEstudante,
    updateEstudante,
    deleteEstudante,
    filterEstudantes,
    getStatistics,
  };
}
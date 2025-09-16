import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export interface EstudanteWithParent {
  id: string;
  nome: string;
<<<<<<< HEAD
  genero: string;
  qualificacoes: string[] | null;
  disponibilidade: any | null;
  ativo: boolean | null;
  profile_id: string;
  created_at: string | null;
=======
  genero: 'masculino' | 'feminino';
  email?: string;
  telefone?: string;
  data_nascimento?: string;
  cargo: 'anciao' | 'servo_ministerial' | 'pioneiro_regular' | 'publicador_batizado' | 'publicador_nao_batizado' | 'estudante_novo';
  ativo: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
>>>>>>> cb5069e52f66eca9951404975794c3c89748f090
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
  // Remove other statistics fields that don't exist in the current schema
}

export function useEstudantes(activeTab?: string) {
  const { user } = useAuth();
  const [estudantes, setEstudantes] = useState<EstudanteWithParent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEstudantes = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // First get the profile to get the correct profile.id
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profileData) {
        setError('Perfil não encontrado');
        setIsLoading(false);
        return;
      }

      // Updated query to match the current database schema
      const { data, error: fetchError } = await supabase
        .from('estudantes')
        .select(`
          id,
<<<<<<< HEAD
          profile_id,
          genero,
          qualificacoes,
          disponibilidade,
=======
          genero,
>>>>>>> cb5069e52f66eca9951404975794c3c89748f090
          ativo,
          created_at,
<<<<<<< HEAD
          profiles!inner(nome)
        `)
        .eq('profile_id', profileData.id)
        // Fixed the order syntax for joined tables
        .order('nome', { foreignTable: 'profiles' });
=======
          congregacao_id,
          profiles!estudantes_profile_id_fkey (
            nome,
            email,
            telefone,
            data_nascimento,
            cargo
          )
        `)
        .eq('ativo', true);
>>>>>>> cb5069e52f66eca9951404975794c3c89748f090

      if (fetchError) {
        throw new Error(`Erro ao buscar estudantes: ${fetchError.message}`);
      }

      // Transform the data to match the expected interface
<<<<<<< HEAD
      const transformedData = data?.map(estudante => ({
        id: estudante.id,
        nome: estudante.profiles?.nome || 'Sem nome',
        genero: estudante.genero,
        qualificacoes: estudante.qualificacoes,
        disponibilidade: estudante.disponibilidade,
        ativo: estudante.ativo,
        profile_id: estudante.profile_id,
        created_at: estudante.created_at
      })) || [];

=======
      const transformedData = (data || []).map((item: any) => ({
        id: item.id,
        nome: item.profiles?.nome || 'Sem nome',
        genero: item.genero,
        email: item.profiles?.email || '',
        telefone: item.profiles?.telefone || '',
        data_nascimento: item.profiles?.data_nascimento || '',
        cargo: item.profiles?.cargo || 'estudante_novo',
        ativo: item.ativo ?? true,
        user_id: item.user_id,
        created_at: item.created_at,
        updated_at: item.created_at // Using created_at as fallback
      }));
      
>>>>>>> cb5069e52f66eca9951404975794c3c89748f090
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
    if (!user?.id) throw new Error('Usuário não autenticado');

    try {
<<<<<<< HEAD
      // First get the profile to get the correct profile.id
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profileData) {
        throw new Error('Perfil não encontrado');
      }

      // Updated to match the current schema
      const dataToInsert = {
        genero: estudanteData.genero || 'masculino',
        profile_id: profileData.id,
        ativo: true,
        ...estudanteData
=======
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
        user_id: user.id,
        ativo: true
>>>>>>> cb5069e52f66eca9951404975794c3c89748f090
      };

      const { data, error } = await supabase
        .from('estudantes')
<<<<<<< HEAD
        .insert([dataToInsert])
=======
        .insert(estudanteRecord)
>>>>>>> cb5069e52f66eca9951404975794c3c89748f090
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
      
      // Remove filters for fields that don't exist in the current schema
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
<<<<<<< HEAD
=======
    const homens = estudantes.filter(e => e.genero === 'masculino').length;
    const mulheres = estudantes.filter(e => e.genero === 'feminino').length;
    const qualificados = estudantes.filter(e => 
      ['anciao', 'servo_ministerial', 'publicador_batizado'].includes(e.cargo)
    ).length;
>>>>>>> cb5069e52f66eca9951404975794c3c89748f090

    return {
      total,
      ativos,
<<<<<<< HEAD
      inativos
=======
      inativos,
      menores: 0, // Not available without birth date calculation
      homens,
      mulheres,
      qualificados
>>>>>>> cb5069e52f66eca9951404975794c3c89748f090
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

// Remove constant definitions that don't match the current schema
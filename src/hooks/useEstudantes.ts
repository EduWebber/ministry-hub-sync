import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export interface EstudanteWithParent {
  id: string;
  nome: string;
  genero: string;
  qualificacoes: string[] | null;
  disponibilidade: any | null;
  ativo: boolean | null;
  profile_id: string;
  created_at: string | null;
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
          profile_id,
          genero,
          qualificacoes,
          disponibilidade,
          ativo,
          created_at,
          profiles!inner(nome)
        `)
        .eq('profile_id', profileData.id)
        // Fixed the order syntax for joined tables
        .order('nome', { foreignTable: 'profiles' });

      if (fetchError) {
        throw new Error(`Erro ao buscar estudantes: ${fetchError.message}`);
      }

      // Transform the data to match the expected interface
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
      };

      const { data, error } = await supabase
        .from('estudantes')
        .insert([dataToInsert])
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
      const { data: updatedData, error } = await supabase
        .from('estudantes')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchEstudantes();
      return updatedData;
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

    return {
      total,
      ativos,
      inativos
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
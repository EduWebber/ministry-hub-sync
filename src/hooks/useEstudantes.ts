import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Database } from '@/integrations/supabase/types';
import { isMockMode } from '@/utils/debug-utils';

type EstudanteRow = Database['public']['Tables']['estudantes']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

// Check if we're in mock mode
const isMockModeValue = isMockMode();

export interface EstudanteWithParent extends EstudanteRow {
  nome: string;
  email?: string;
  telefone?: string;
  data_nascimento?: string;
  cargo?: ProfileRow['cargo'];
  // Add missing required fields for compatibility
  nome_completo?: string;
  // S-38 qualifications
  reading?: boolean;
  treasures?: boolean;
  gems?: boolean;
  talk?: boolean;
  explaining?: boolean;
  starting?: boolean;
  following?: boolean;
  making?: boolean;
  congregation_study?: boolean;
  privileges?: string[];
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
    if (isMockModeValue) {
      console.log('🧪 Mock mode: returning mock estudantes data');
      setIsLoading(true);
      setError(null);
      
      // Mock estudantes data with S-38 qualifications
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
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          // S-38 qualifications
          reading: true,
          treasures: true,
          gems: true,
          talk: true,
          explaining: true,
          starting: true,
          following: true,
          making: true,
          congregation_study: false,
          privileges: ['publicador_batizado']
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
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          // S-38 qualifications
          reading: false,
          treasures: false,
          gems: false,
          talk: false,
          explaining: true,
          starting: true,
          following: true,
          making: true,
          congregation_study: false,
          privileges: ['publicador_batizado']
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
      // Fetch estudantes with all S-38 qualification fields
      const { data, error } = await supabase
        .from('estudantes')
        .select(`
          *,
          profiles(nome, email, telefone, data_nascimento, cargo)
        `)
        .eq('ativo', true);

      if (error) {
        throw new Error(`Erro ao buscar estudantes: ${error.message}`);
      }

      // Transform the data to match the expected interface
      const transformedData: EstudanteWithParent[] = (data || []).map((item: any) => ({
        ...item,
        nome: item.profiles?.nome || 'Sem nome',
        nome_completo: item.profiles?.nome || 'Sem nome',
        email: item.profiles?.email || '',
        telefone: item.profiles?.telefone || '',
        data_nascimento: item.profiles?.data_nascimento || '',
        cargo: item.profiles?.cargo || 'estudante_novo',
        // S-38 qualifications are already included in the * selection
      }));
      
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
    if (isMockModeValue) {
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
        user_id: user.id,
        // S-38 qualifications
        reading: estudanteData.reading || false,
        treasures: estudanteData.treasures || false,
        gems: estudanteData.gems || false,
        talk: estudanteData.talk || false,
        explaining: estudanteData.explaining || false,
        starting: estudanteData.starting || false,
        following: estudanteData.following || false,
        making: estudanteData.making || false,
        congregation_study: estudanteData.congregation_study || false,
        privileges: estudanteData.privileges || []
      };
      
      setEstudantes(prev => [...prev, newEstudante]);
      return newEstudante;
    }

    if (!user?.id) throw new Error('Usuário não autenticado');

    try {
      // First create the profile
      const profileData = {
        user_id: user.id,
        nome: estudanteData.nome || '',
        email: estudanteData.email || '',
        telefone: estudanteData.telefone || '',
        cargo: estudanteData.cargo || 'estudante' as const,
        role: 'estudante' as const
      };

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (profileError) throw profileError;

      // Then create the estudante record with S-38 qualifications
      const estudanteRecord = {
        profile_id: profile.id,
        genero: estudanteData.genero || 'masculino',
        ativo: true,
        // S-38 qualifications
        reading: estudanteData.reading || false,
        treasures: estudanteData.treasures || false,
        gems: estudanteData.gems || false,
        talk: estudanteData.talk || false,
        explaining: estudanteData.explaining || false,
        starting: estudanteData.starting || false,
        following: estudanteData.following || false,
        making: estudanteData.making || false,
        congregation_study: estudanteData.congregation_study || false,
        privileges: estudanteData.privileges || []
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
    if (isMockModeValue) {
      console.log('🧪 Mock mode: simulating update estudante');
      setEstudantes(prev => 
        prev.map(estudante => 
          estudante.id === id ? { ...estudante, ...data } : estudante
        )
      );
      return { id, ...data };
    }

    try {
      // Update estudante with S-38 qualifications
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
    // If in mock mode, simulate deleting a estudante
    if (isMockModeValue) {
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
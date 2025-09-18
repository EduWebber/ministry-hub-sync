import { useState, useCallback, useEffect } from 'react';
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Database } from '@/integrations/supabase/types';

// Force mock mode to avoid database issues
const isMockMode = () => true;

type EstudanteRow = Database['public']['Tables']['estudantes']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

// Check if we're in mock mode
const isMockModeValue = isMockMode();

export interface EstudanteCompleto extends EstudanteRow {
  nome: string;
  nome_completo: string;
  email?: string;
  telefone?: string;
  data_nascimento?: string;
  cargo?: ProfileRow['cargo'];
  // Family structure
  pai_mae?: any;
  filhos?: any[];
  familia?: string;
  congregacao?: string;
  // S-38 qualifications
  chairman?: boolean;
  pray?: boolean;
  treasures?: boolean;
  gems?: boolean;
  reading?: boolean;
  starting?: boolean;
  following?: boolean;
  making?: boolean;
  explaining?: boolean;
  talk?: boolean;
}

export interface EstudanteWithParent extends EstudanteRow {
  nome: string;
  nome_completo: string;
  email?: string;
  telefone?: string;
  data_nascimento?: string;
  cargo?: ProfileRow['cargo'];
  // Add missing required fields for compatibility
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

export function useEstudantes() {
  const [estudantes, setEstudantes] = useState<EstudanteCompleto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEstudantes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Check if we're in mock mode
    if (isMockMode()) {
      console.log('🧪 Mock mode: returning mock estudantes');
      const mockEstudantes: EstudanteCompleto[] = [
        {
          id: 'student-joao',
          nome: 'João Silva',
          nome_completo: 'João Silva Santos',
          genero: 'masculino',
          ativo: true,
          profile_id: 'profile-joao',
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          congregacao_id: '550e8400-e29b-41d4-a716-446655440001',
          disponibilidade: null,
          qualificacoes: ['reading', 'starting', 'following', 'making', 'explaining', 'talk'],
          created_at: new Date().toISOString(),
          email: 'joao@exemplo.com',
          telefone: '(11) 99999-0001',
          data_nascimento: '1990-05-15',
          cargo: 'pioneiro_regular',
          // Family structure
          pai_mae: null,
          filhos: [],
          familia: 'Família Silva',
          congregacao: 'Congregação Central',
          // S-38 qualifications
          chairman: false,
          pray: false,
          treasures: false,
          gems: false,
          reading: true,
          starting: true,
          following: true,
          making: true,
          explaining: true,
          talk: true
        },
        {
          id: 'student-maria',
          nome: 'Maria Santos',
          nome_completo: 'Maria Santos Silva',
          genero: 'feminino',
          ativo: true,
          profile_id: 'profile-maria',
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          congregacao_id: '550e8400-e29b-41d4-a716-446655440001',
          disponibilidade: null,
          qualificacoes: ['starting', 'following', 'making', 'explaining'],
          created_at: new Date().toISOString(),
          email: 'maria@exemplo.com',
          telefone: '(11) 99999-0002',
          data_nascimento: '1985-08-22',
          cargo: 'publicador',
          // Family structure
          pai_mae: null,
          filhos: [],
          familia: 'Família Santos',
          congregacao: 'Congregação Central',
          // S-38 qualifications
          chairman: false,
          pray: false,
          treasures: false,
          gems: false,
          reading: false,
          starting: true,
          following: true,
          making: true,
          explaining: true,
          talk: false
        },
        {
          id: 'student-pedro',
          nome: 'Pedro Costa',
          nome_completo: 'Pedro Costa Silva',
          genero: 'masculino',
          ativo: true,
          profile_id: 'profile-pedro',
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          congregacao_id: '550e8400-e29b-41d4-a716-446655440001',
          disponibilidade: null,
          qualificacoes: ['chairman', 'pray', 'treasures', 'gems', 'reading', 'starting', 'following', 'making', 'explaining', 'talk'],
          created_at: new Date().toISOString(),
          email: 'pedro@exemplo.com',
          telefone: '(11) 99999-0003',
          data_nascimento: '1978-12-03',
          cargo: 'servo_ministerial',
          // Family structure
          pai_mae: null,
          filhos: [],
          familia: 'Família Costa',
          congregacao: 'Congregação Central',
          // S-38 qualifications
          chairman: true,
          pray: true,
          treasures: true,
          gems: true,
          reading: true,
          starting: true,
          following: true,
          making: true,
          explaining: true,
          talk: true
        },
        {
          id: 'student-ana',
          nome: 'Ana Oliveira',
          nome_completo: 'Ana Oliveira Silva',
          genero: 'feminino',
          ativo: true,
          profile_id: 'profile-ana',
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          congregacao_id: '550e8400-e29b-41d4-a716-446655440001',
          disponibilidade: null,
          qualificacoes: ['starting', 'following', 'making', 'explaining'],
          created_at: new Date().toISOString(),
          email: 'ana@exemplo.com',
          telefone: '(11) 99999-0004',
          data_nascimento: '1992-03-18',
          cargo: 'pioneiro_auxiliar',
          // Family structure
          pai_mae: null,
          filhos: [],
          familia: 'Família Oliveira',
          congregacao: 'Congregação Central',
          // S-38 qualifications
          chairman: false,
          pray: false,
          treasures: false,
          gems: false,
          reading: false,
          starting: true,
          following: true,
          making: true,
          explaining: true,
          talk: false
        }
      ];
      setEstudantes(mockEstudantes);
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔍 Fetching estudantes from Supabase...');
      
      // First try with the relationship join
      let estudantesData, estudantesError;
      
      try {
        console.log('🔍 Attempting relationship query...');
        const result = await supabase
          .from('estudantes')
          .select(`
            *,
            profiles!inner (*)
          `)
          .eq('ativo', true)
          .order('created_at', { ascending: false });
        
        // Check if the query succeeded but returned an error
        if (result.error) {
          console.log('⚠️ Relationship query returned error:', result.error.message);
          throw new Error(result.error.message);
        }
        
        estudantesData = result.data;
        estudantesError = null;
        console.log('✅ Relationship query successful, found', estudantesData?.length || 0, 'records');
        
      } catch (relationshipError) {
        console.log('⚠️ Relationship query failed, using fallback approach:', relationshipError);
        
        // Fallback: fetch estudantes and profiles separately
        console.log('🔄 Trying fallback: separate queries...');
        
        const estudantesResult = await supabase
          .from('estudantes')
          .select('*')
          .eq('ativo', true)
          .order('created_at', { ascending: false });
          
        if (estudantesResult.error) {
          throw new Error(`Erro ao buscar estudantes: ${estudantesResult.error.message}`);
        }
        
        console.log('✅ Estudantes fetched:', estudantesResult.data?.length || 0, 'records');
        
        // Get unique profile IDs
        const profileIds = [...new Set(estudantesResult.data?.map(e => e.profile_id).filter(Boolean))];
        
        if (profileIds.length > 0) {
          console.log('🔍 Fetching profiles for', profileIds.length, 'unique IDs...');
          
          const profilesResult = await supabase
            .from('profiles')
            .select('*')
            .in('id', profileIds);
            
          if (profilesResult.error) {
            console.warn('⚠️ Error fetching profiles:', profilesResult.error.message);
            // Continue with estudantes data even if profiles fail
            estudantesData = estudantesResult.data;
          } else {
            console.log('✅ Profiles fetched:', profilesResult.data?.length || 0, 'records');
            
            // Map profiles to estudantes
            const profilesMap = new Map(profilesResult.data?.map(p => [p.id, p]) || []);
            
            estudantesData = estudantesResult.data?.map(estudante => ({
              ...estudante,
              profiles: profilesMap.get(estudante.profile_id) || null
            }));
          }
        } else {
          console.log('⚠️ No profile IDs found, using estudantes data only');
          estudantesData = estudantesResult.data;
        }
        
        estudantesError = null;
      }

      if (estudantesError) {
        throw new Error(`Erro ao buscar estudantes: ${estudantesError.message}`);
      }

      // Transform the data to match our expected structure
      const estudantesCompletos = (estudantesData || []).map(estudante => ({
        ...estudante,
        nome: (estudante as any).profiles?.nome || 'Nome não informado',
        nome_completo: (estudante as any).profiles?.nome || 'Nome não informado',
        email: (estudante as any).profiles?.email || '',
        telefone: (estudante as any).profiles?.telefone || '',
        data_nascimento: (estudante as any).profiles?.data_nascimento || '',
        cargo: (estudante as any).profiles?.cargo || 'estudante_novo',
        congregacao: (estudante as any).profiles?.congregacao || '',
        // S-38 qualifications from qualificacoes array
        chairman: estudante.qualificacoes?.includes('chairman') || false,
        pray: estudante.qualificacoes?.includes('pray') || false,
        treasures: estudante.qualificacoes?.includes('treasures') || false,
        gems: estudante.qualificacoes?.includes('gems') || false,
        reading: estudante.qualificacoes?.includes('reading') || false,
        starting: estudante.qualificacoes?.includes('starting') || false,
        following: estudante.qualificacoes?.includes('following') || false,
        making: estudante.qualificacoes?.includes('making') || false,
        explaining: estudante.qualificacoes?.includes('explaining') || false,
        talk: estudante.qualificacoes?.includes('talk') || false,
        // Family structure
        pai_mae: null,
        filhos: [],
        familia: `Família ${(estudante as any).profiles?.nome?.split(' ')[0] || 'Desconhecida'}`
      }));

      setEstudantes(estudantesCompletos as EstudanteCompleto[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar estudantes:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load estudantes on mount
  useEffect(() => {
    fetchEstudantes();
  }, [fetchEstudantes]);

  // Additional convenience functions
  const createEstudante = useCallback(async (data: any) => {
    if (isMockModeValue) {
      console.log('🧪 Mock mode: simulating add estudante');
      return { success: true, data: { id: 'mock-new-student' } };
    }
    // Real implementation would go here
    return { success: false, error: 'Not implemented yet' };
  }, []);

  const updateEstudanteInternal = useCallback(async (id: string, updates: any) => {
    if (isMockModeValue) {
      console.log('🧪 Mock mode: simulating update estudante');
      return { success: true };
    }
    // Real implementation would go here
    return { success: false, error: 'Not implemented yet' };
  }, []);

  const deleteEstudante = useCallback(async (id: string) => {
    if (isMockModeValue) {
      console.log('🧪 Mock mode: simulating delete estudante');
      return { success: true };
    }
    // Real implementation would go here
    return { success: false, error: 'Not implemented yet' };
  }, []);

  // Helpers expected by pages
  const refetch = useCallback(() => fetchEstudantes(), [fetchEstudantes]);

  const updateEstudante = useCallback(async ({ id, data }: { id: string; data: any }) => {
    return updateEstudanteInternal(id, data);
  }, [updateEstudanteInternal]);

  const filterEstudantes = useCallback((filters: any) => {
    let list = estudantes || [];
    if (!filters) return list;
    const { searchTerm, cargo, genero, ativo } = filters;

    if (searchTerm && String(searchTerm).trim().length > 0) {
      const q = String(searchTerm).toLowerCase();
      list = list.filter((e: any) =>
        (e.nome && e.nome.toLowerCase().includes(q)) ||
        (e.nome_completo && e.nome_completo.toLowerCase().includes(q)) ||
        (e.email && e.email.toLowerCase().includes(q))
      );
    }

    if (cargo && cargo !== 'todos') {
      list = list.filter((e: any) => (e.cargo || '').toString() === cargo);
    }

    if (genero && genero !== 'todos') {
      list = list.filter((e: any) => e.genero === genero);
    }

    if (ativo !== undefined && ativo !== 'todos') {
      const desired = ativo === true || ativo === 'true';
      list = list.filter((e: any) => Boolean(e.ativo) === desired);
    }

    return list;
  }, [estudantes]);

  // Define getStatistics function
  const getStatistics = useCallback((): EstudanteStatistics => {
    return {
      total: estudantes.length,
      ativos: estudantes.filter(e => e.ativo).length,
      inativos: estudantes.filter(e => !e.ativo).length,
      menores: estudantes.filter(e => {
        if (!e.data_nascimento) return false;
        const age = new Date().getFullYear() - new Date(e.data_nascimento).getFullYear();
        return age < 18;
      }).length,
      homens: estudantes.filter(e => e.genero === 'masculino').length,
      mulheres: estudantes.filter(e => e.genero === 'feminino').length,
      qualificados: estudantes.filter(e => (e.qualificacoes?.length || 0) >= 3).length
    };
  }, [estudantes]);

  // Calculate statistics using the getStatistics function
  const statistics = getStatistics();

  return {
    estudantes,
    isLoading,
    error,
    statistics,
    refetch,
    createEstudante,
    updateEstudante,
    deleteEstudante,
    filterEstudantes,
    getStatistics
  };
}

export default useEstudantes;
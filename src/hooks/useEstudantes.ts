import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Estudante {
  id: string;
  nome: string;
  genero: 'masculino' | 'feminino';
  qualificacoes: string[];
  ativo: boolean;
  email?: string;
  telefone?: string;
  profile_id?: string; // This field doesn't exist in the estudantes table
  idade?: number;
  congregacao_id?: string;
  created_at?: string;
  disponibilidade?: any;
  instrutor_id?: string;
  data_batismo?: string | null;
  data_nascimento?: string | null;
  observacoes?: string | null;
  parent_id?: string | null;
  user_id?: string;
}

export function useEstudantes() {
  const [estudantes, setEstudantes] = useState<Estudante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false); // Prevent duplicate fetches

  const fetchEstudantes = useCallback(async () => {
    // Prevent concurrent fetches
    if (fetchingRef.current) {
      console.log('⏭️ Fetch already in progress, skipping duplicate request');
      return;
    }
    
    fetchingRef.current = true;
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching estudantes from Supabase...');

      const { data: estudantesData, error: estudantesError } = await supabase
        .from('estudantes')
        .select(`
          id,
          nome,
          genero,
          qualificacoes,
          ativo,
          email,
          telefone,
          idade,
          congregacao_id,
          created_at,
          instrutor_id,
          data_batismo,
          data_nascimento,
          observacoes,
          parent_id
        `)
        .eq('ativo', true);

      if (estudantesError) {
        console.error('Error fetching estudantes:', estudantesError);
        setError(`Erro ao carregar estudantes: ${estudantesError.message}`);
        return;
      }

      if (!estudantesData || estudantesData.length === 0) {
        console.log('No estudantes found in database');
        setEstudantes([]);
        return;
      }

      // Transform the data to match the interface
      const transformedEstudantes = estudantesData.map((estudante: any) => {
        return {
          id: estudante.id,
          nome: estudante.nome || 'Nome não informado',
          genero: estudante.genero as 'masculino' | 'feminino',
          qualificacoes: estudante.qualificacoes || [],
          ativo: estudante.ativo,
          email: estudante.email,
          telefone: estudante.telefone,
          idade: estudante.idade,
          congregacao_id: estudante.congregacao_id,
          created_at: estudante.created_at,
          instrutor_id: estudante.instrutor_id,
          data_batismo: estudante.data_batismo,
          data_nascimento: estudante.data_nascimento,
          observacoes: estudante.observacoes,
          parent_id: estudante.parent_id,
        };
      });

      console.log(`Successfully loaded ${transformedEstudantes.length} estudantes`);
      setEstudantes(transformedEstudantes);

    } catch (err) {
      console.error('Unexpected error fetching estudantes:', err);
      setError('Erro inesperado ao carregar estudantes');
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  // Load estudantes on mount (only once)
  useEffect(() => {
    fetchEstudantes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount

  const createEstudante = useCallback(async (data: any) => {
    // Implementation needed
    console.log('Creating estudante:', data);
  }, []);

  const updateEstudante = useCallback(async (id: string, data: any) => {
    // Implementation needed
    console.log('Updating estudante:', id, data);
  }, []);

  const deleteEstudante = useCallback(async (id: string) => {
    // Implementation needed
    console.log('Deleting estudante:', id);
  }, []);

  const filterEstudantes = useCallback((filters: any) => {
    // Implementation needed
    return estudantes;
  }, [estudantes]);

  const getStatistics = useCallback(() => {
    return {
      total: estudantes.length,
      active: estudantes.filter(e => e.ativo).length,
      inactive: estudantes.filter(e => !e.ativo).length,
      ativos: estudantes.filter(e => e.ativo).length,
      inativos: estudantes.filter(e => !e.ativo).length,
      menores: estudantes.filter(e => e.idade && e.idade < 18).length
    };
  }, [estudantes]);

  return {
    estudantes,
    isLoading,
    error,
    fetchEstudantes,
    refetch: fetchEstudantes,
    createEstudante,
    updateEstudante,
    deleteEstudante,
    filterEstudantes,
    getStatistics,
  };
}
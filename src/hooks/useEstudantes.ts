import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Estudante {
  id: string;
  nome: string;
  genero: 'masculino' | 'feminino';
  qualificacoes: string[];
  ativo: boolean;
  email?: string;
  telefone?: string;
  profile_id: string;
}

export function useEstudantes() {
  const [estudantes, setEstudantes] = useState<Estudante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstudantes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching estudantes from Supabase...');

      const { data: estudantesData, error: estudantesError } = await supabase
        .from('estudantes')
        .select(`
          id,
          genero,
          qualificacoes,
          ativo,
          profile_id,
          profiles!inner (
            id,
            nome,
            email,
            telefone
          )
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

      // Transform the data
      const transformedEstudantes = estudantesData.map((estudante: any) => {
        const profile = estudante.profiles;
        return {
          id: estudante.id,
          nome: profile?.nome || 'Nome não informado',
          genero: estudante.genero,
          qualificacoes: estudante.qualificacoes || [],
          ativo: estudante.ativo,
          email: profile?.email,
          telefone: profile?.telefone,
          profile_id: estudante.profile_id,
        };
      });

      console.log(`Successfully loaded ${transformedEstudantes.length} estudantes`);
      setEstudantes(transformedEstudantes);

    } catch (err) {
      console.error('Unexpected error fetching estudantes:', err);
      setError('Erro inesperado ao carregar estudantes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load estudantes on mount
  useEffect(() => {
    fetchEstudantes();
  }, [fetchEstudantes]);

  return {
    estudantes,
    isLoading,
    error,
    fetchEstudantes,
  };
}
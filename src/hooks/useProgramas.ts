import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type ProgramaMinisterial = Database['public']['Tables']['programas_ministeriais']['Row'];
type PartePrograma = Database['public']['Tables']['partes_programa']['Row'];
type SemanaPrograma = Database['public']['Tables']['semanas_programa']['Row'];

export interface ProgramaCompleto extends ProgramaMinisterial {
  semanas: (SemanaPrograma & {
    partes: PartePrograma[];
  })[];
}

export function useProgramas() {
  const [programas, setProgramas] = useState<ProgramaCompleto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgramas = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch programas ministeriais
      const { data: programasData, error: programasError } = await supabase
        .from('programas_ministeriais')
        .select(`
          *,
          semanas_programa (
            *,
            partes_programa (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (programasError) {
        throw new Error(`Erro ao buscar programas: ${programasError.message}`);
      }

      // Transform the data to match our expected structure
      const programasCompletos = (programasData || []).map(programa => ({
        ...programa,
        semanas: (programa as any).semanas_programa || []
      }));

      setProgramas(programasCompletos as ProgramaCompleto[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar programas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProgramaById = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('programas_ministeriais')
        .select(`
          *,
          semanas_programa (
            *,
            partes_programa (*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Erro ao buscar programa: ${error.message}`);
      }

      return {
        ...data,
        semanas: (data as any).semanas_programa || []
      } as ProgramaCompleto;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar programa:', err);
      return null;
    }
  }, []);

  // Load programas on mount
  useEffect(() => {
    fetchProgramas();
  }, [fetchProgramas]);

  return {
    programas,
    loading,
    error,
    fetchProgramas,
    fetchProgramaById
  };
}
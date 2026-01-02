import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProgramaCompleto {
  id: string;
  titulo: string;
  descricao: string | null;
  mes_ano: string;
  data_inicio: string | null;
  data_fim: string | null;
  arquivo_nome: string | null;
  arquivo_url: string | null;
  status: string | null;
  congregacao_id: string | null;
  criado_por: string | null;
  created_at: string;
  updated_at: string;
}

export function useProgramas() {
  const [programas, setProgramas] = useState<ProgramaCompleto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgramas = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: programasData, error: programasError } = await supabase
        .from('programas_ministeriais')
        .select('*')
        .order('created_at', { ascending: false });

      if (programasError) {
        throw new Error(`Erro ao buscar programas: ${programasError.message}`);
      }

      setProgramas((programasData || []) as ProgramaCompleto[]);
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
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw new Error(`Erro ao buscar programa: ${error.message}`);
      }

      return data as ProgramaCompleto | null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar programa:', err);
      return null;
    }
  }, []);

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
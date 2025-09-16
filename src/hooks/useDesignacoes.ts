import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Designacao = Database['public']['Tables']['designacoes']['Row'];
type Estudante = Database['public']['Tables']['estudantes']['Row'];
type PartePrograma = Database['public']['Tables']['partes_programa']['Row'];

export interface DesignacaoCompleta extends Designacao {
  estudante: Estudante | null;
  ajudante: Estudante | null;
  parte: PartePrograma | null;
}

export function useDesignacoes() {
  const [designacoes, setDesignacoes] = useState<DesignacaoCompleta[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDesignacoes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch designacoes with related data
      const { data: designacoesData, error: designacoesError } = await supabase
        .from('designacoes')
        .select(`
          *,
          estudante:estudantes!estudante_id (*),
          ajudante:estudantes!ajudante_id (*),
          parte:partes_programa (*)
        `)
        .order('created_at', { ascending: false });

      if (designacoesError) {
        throw new Error(`Erro ao buscar designações: ${designacoesError.message}`);
      }

      // Transform the data to match our expected structure
      const designacoesCompletas = (designacoesData || []).map(designacao => ({
        ...designacao,
        estudante: (designacao as any).estudante || null,
        ajudante: (designacao as any).ajudante || null,
        parte: (designacao as any).parte || null
      }));

      setDesignacoes(designacoesCompletas as DesignacaoCompleta[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar designações:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load designacoes on mount
  useEffect(() => {
    fetchDesignacoes();
  }, [fetchDesignacoes]);

  return {
    designacoes,
    loading,
    error,
    fetchDesignacoes
  };
}
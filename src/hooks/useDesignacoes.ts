import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Estudante {
  id: string;
  nome: string;
  genero: string | null;
  cargo: string | null;
}

export interface DesignacaoCompleta {
  id: string;
  titulo_parte: string;
  tipo_parte: string | null;
  tempo_minutos: number | null;
  cena: string | null;
  data_designacao: string | null;
  status: string | null;
  observacoes: string | null;
  estudante_id: string | null;
  ajudante_id: string | null;
  programa_id: string | null;
  created_at: string;
  updated_at: string;
  estudante: Estudante | null;
  ajudante: Estudante | null;
}

export function useDesignacoes() {
  const [designacoes, setDesignacoes] = useState<DesignacaoCompleta[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDesignacoes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: designacoesData, error: designacoesError } = await supabase
        .from('designacoes')
        .select(`
          id,
          titulo_parte,
          tipo_parte,
          tempo_minutos,
          cena,
          data_designacao,
          status,
          observacoes,
          estudante_id,
          ajudante_id,
          programa_id,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (designacoesError) {
        throw new Error(`Erro ao buscar designações: ${designacoesError.message}`);
      }

      const estudanteIds = new Set<string>();
      (designacoesData || []).forEach(d => {
        if (d.estudante_id) estudanteIds.add(d.estudante_id);
        if (d.ajudante_id) estudanteIds.add(d.ajudante_id);
      });

      let estudantesMap: Record<string, Estudante> = {};
      if (estudanteIds.size > 0) {
        const { data: estudantesData } = await supabase
          .from('estudantes')
          .select('id, nome, genero, cargo')
          .in('id', Array.from(estudanteIds));
        
        (estudantesData || []).forEach(e => {
          estudantesMap[e.id] = e;
        });
      }

      const designacoesCompletas: DesignacaoCompleta[] = (designacoesData || []).map(d => ({
        ...d,
        estudante: d.estudante_id ? estudantesMap[d.estudante_id] || null : null,
        ajudante: d.ajudante_id ? estudantesMap[d.ajudante_id] || null : null,
      }));

      setDesignacoes(designacoesCompletas);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar designações:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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

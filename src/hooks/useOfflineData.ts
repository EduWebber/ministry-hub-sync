import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { listOffline } from '@/utils/offlineLocalDB';
import type { EstudanteRow } from '@/types/estudantes';
import type { DesignacaoRow, ProgramaRow } from '@/types/designacoes';

interface OfflineDataState {
  estudantes: EstudanteRow[];
  programas: ProgramaRow[];
  designacoes: DesignacaoRow[];
  isOnline: boolean;
  isLoaded: boolean;
  error: string | null;
}

export const useOfflineData = () => {
  const [data, setData] = useState<OfflineDataState>({
    estudantes: [],
    programas: [],
    designacoes: [],
    isOnline: navigator.onLine,
    isLoaded: false,
    error: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Try to load from online first
      if (navigator.onLine) {
        await loadOnlineData();
      } else {
        // Fallback to offline data
        await loadOfflineData();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Final fallback to offline data
      await loadOfflineData();
    }
  };

  const loadOnlineData = async () => {
    try {
      // Load estudantes
      const { data: estudantes, error: estudantesError } = await supabase
        .from('estudantes')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (estudantesError) throw estudantesError;

      // Load programas
      const { data: programas, error: programasError } = await supabase
        .from('programas_ministeriais')
        .select('*')
        .order('data_inicio_semana', { ascending: false });

      if (programasError) throw programasError;

      // Load designacoes
      const { data: designacoes, error: designacoesError } = await supabase
        .from('designacoes')
        .select('*');

      if (designacoesError) throw designacoesError;

      setData({
        estudantes: estudantes || [],
        programas: programas || [],
        designacoes: designacoes || [],
        isOnline: true,
        isLoaded: true,
        error: null,
      });
    } catch (error) {
      console.error('Error loading online data:', error);
      throw error;
    }
  };

  const loadOfflineData = async () => {
    try {
      // Load from IndexedDB
      const estudantes = await listOffline('estudantes');
      const programas = await listOffline('programas');
      const designacoes = await listOffline('designacoes');

      setData({
        estudantes: estudantes || [],
        programas: programas || [],
        designacoes: designacoes || [],
        isOnline: false,
        isLoaded: true,
        error: null,
      });
    } catch (error) {
      console.error('Error loading offline data:', error);
      setData(prev => ({
        ...prev,
        isLoaded: true,
        error: 'Failed to load offline data',
      }));
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  return {
    ...data,
    refreshData,
  };
};
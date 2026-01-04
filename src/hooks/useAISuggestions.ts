import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SugestaoDesignacao {
  estudante_id: string;
  estudante_nome: string;
  tipo_parte: string;
  motivo: string;
  confianca: number;
  ajudante_sugerido?: {
    id: string | null;
    nome: string | null;
  };
}

interface SuggestionsResponse {
  success: boolean;
  sugestoes: SugestaoDesignacao[];
  total_estudantes?: number;
  periodo_historico?: string;
  error?: string;
}

interface UseSuggestionsParams {
  congregacao_id: string;
  tipo_parte?: string;
  data_designacao?: string;
  quantidade?: number;
}

export function useAISuggestions() {
  const [isLoading, setIsLoading] = useState(false);
  const [sugestoes, setSugestoes] = useState<SugestaoDesignacao[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSuggestions = async ({
    congregacao_id,
    tipo_parte,
    data_designacao,
    quantidade = 3,
  }: UseSuggestionsParams) => {
    setIsLoading(true);
    setError(null);
    setSugestoes([]);

    try {
      const { data, error: functionError } = await supabase.functions.invoke<SuggestionsResponse>(
        "suggest-designacoes",
        {
          body: {
            congregacao_id,
            tipo_parte,
            data_designacao,
            quantidade,
          },
        }
      );

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || "Erro ao obter sugestões");
      }

      setSugestoes(data.sugestoes);
      
      if (data.sugestoes.length === 0) {
        toast({
          title: "Nenhuma sugestão",
          description: "Não foi possível gerar sugestões. Verifique se há estudantes cadastrados com qualificações.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sugestões geradas",
          description: `${data.sugestoes.length} sugestão(ões) baseada(s) em ${data.total_estudantes} estudantes.`,
        });
      }

      return data.sugestoes;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      
      toast({
        title: "Erro ao gerar sugestões",
        description: errorMessage,
        variant: "destructive",
      });
      
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const clearSuggestions = () => {
    setSugestoes([]);
    setError(null);
  };

  return {
    isLoading,
    sugestoes,
    error,
    fetchSuggestions,
    clearSuggestions,
  };
}

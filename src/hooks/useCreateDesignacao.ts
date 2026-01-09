import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SugestaoDesignacao } from "@/hooks/useAISuggestions";

interface CreateDesignacaoParams {
  sugestao: SugestaoDesignacao;
  congregacaoId: string;
  programaId?: string;
  dataDesignacao?: string;
  tituloParte?: string;
  observacoes?: string;
}

export function useCreateDesignacao() {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const createFromSuggestion = async ({
    sugestao,
    congregacaoId,
    programaId,
    dataDesignacao,
    tituloParte,
    observacoes,
  }: CreateDesignacaoParams) => {
    setIsCreating(true);

    try {
      const designacaoData = {
        estudante_id: sugestao.estudante_id,
        ajudante_id: sugestao.ajudante_sugerido?.id || null,
        tipo_parte: sugestao.tipo_parte,
        titulo_parte: tituloParte || sugestao.tipo_parte,
        congregacao_id: congregacaoId,
        programa_id: programaId || null,
        data_designacao: dataDesignacao || new Date().toISOString().split('T')[0],
        status: 'pendente',
        assignment_status: 'pending',
        observacoes: observacoes || `Sugestão IA: ${sugestao.motivo}`,
      };

      const { data, error } = await supabase
        .from('designacoes')
        .insert(designacaoData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Designação criada",
        description: `${sugestao.estudante_nome} foi designado para ${sugestao.tipo_parte}`,
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar designação";
      
      toast({
        title: "Erro ao criar designação",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    isCreating,
    createFromSuggestion,
  };
}

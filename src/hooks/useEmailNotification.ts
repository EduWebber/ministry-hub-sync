import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface EstudanteInfo {
  id: string;
  nome: string;
  email: string | null;
}

interface AjudanteInfo {
  id: string;
  nome: string;
}

interface DesignacaoInfo {
  titulo_parte: string;
  tipo_parte: string | null;
  data_designacao: string | null;
  tempo_minutos: number | null;
  cena: string | null;
  observacoes: string | null;
}

type NotificationType = 'nova' | 'atualizada' | 'cancelada' | 'lembrete';

export function useEmailNotification() {
  const sendNotification = async (
    estudante: EstudanteInfo,
    designacao: DesignacaoInfo,
    tipo: NotificationType,
    ajudante?: AjudanteInfo | null
  ): Promise<boolean> => {
    if (!estudante.email) {
      console.log(`Estudante ${estudante.nome} não tem email cadastrado`);
      return false;
    }

    if (!designacao.data_designacao) {
      console.log('Data da designação não definida');
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-designacao-email', {
        body: {
          estudanteEmail: estudante.email,
          estudanteNome: estudante.nome,
          tituloParte: designacao.titulo_parte,
          tipoParte: designacao.tipo_parte || 'Não especificado',
          dataDesignacao: designacao.data_designacao,
          tempoMinutos: designacao.tempo_minutos,
          cena: designacao.cena,
          ajudanteNome: ajudante?.nome,
          observacoes: designacao.observacoes,
          tipo,
        },
      });

      if (error) {
        console.error('Erro ao enviar email:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      return false;
    }
  };

  const notifyNewDesignacao = async (
    estudante: EstudanteInfo,
    designacao: DesignacaoInfo,
    ajudante?: AjudanteInfo | null
  ) => {
    const success = await sendNotification(estudante, designacao, 'nova', ajudante);
    
    if (success) {
      toast({
        title: "Email enviado",
        description: `Notificação enviada para ${estudante.nome}`,
      });
    } else if (estudante.email) {
      toast({
        title: "Erro ao enviar email",
        description: "Não foi possível enviar a notificação",
        variant: "destructive",
      });
    }
    
    return success;
  };

  const notifyUpdatedDesignacao = async (
    estudante: EstudanteInfo,
    designacao: DesignacaoInfo,
    ajudante?: AjudanteInfo | null
  ) => {
    const success = await sendNotification(estudante, designacao, 'atualizada', ajudante);
    
    if (success) {
      toast({
        title: "Email enviado",
        description: `Notificação de atualização enviada para ${estudante.nome}`,
      });
    }
    
    return success;
  };

  const notifyCanceledDesignacao = async (
    estudante: EstudanteInfo,
    designacao: DesignacaoInfo
  ) => {
    const success = await sendNotification(estudante, designacao, 'cancelada');
    
    if (success) {
      toast({
        title: "Email enviado",
        description: `Notificação de cancelamento enviada para ${estudante.nome}`,
      });
    }
    
    return success;
  };

  const notifyReminder = async (
    estudante: EstudanteInfo,
    designacao: DesignacaoInfo,
    ajudante?: AjudanteInfo | null
  ) => {
    return sendNotification(estudante, designacao, 'lembrete', ajudante);
  };

  return {
    sendNotification,
    notifyNewDesignacao,
    notifyUpdatedDesignacao,
    notifyCanceledDesignacao,
    notifyReminder,
  };
}

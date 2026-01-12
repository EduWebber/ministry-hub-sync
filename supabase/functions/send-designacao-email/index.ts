import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  estudanteEmail: string;
  estudanteNome: string;
  tituloParte: string;
  tipoParte: string;
  dataDesignacao: string;
  tempoMinutos?: number;
  cena?: string;
  ajudanteNome?: string;
  observacoes?: string;
  tipo: 'nova' | 'atualizada' | 'cancelada' | 'lembrete';
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getEmailSubject(tipo: EmailRequest['tipo'], tituloParte: string): string {
  switch (tipo) {
    case 'nova':
      return `Nova Designação: ${tituloParte}`;
    case 'atualizada':
      return `Designação Atualizada: ${tituloParte}`;
    case 'cancelada':
      return `Designação Cancelada: ${tituloParte}`;
    case 'lembrete':
      return `Lembrete de Designação: ${tituloParte}`;
    default:
      return `Designação: ${tituloParte}`;
  }
}

function getEmailHtml(data: EmailRequest): string {
  const { estudanteNome, tituloParte, tipoParte, dataDesignacao, tempoMinutos, cena, ajudanteNome, observacoes, tipo } = data;
  
  const formattedDate = formatDate(dataDesignacao);
  
  let headerColor = '#3b82f6'; // blue
  let headerText = 'Nova Designação';
  
  switch (tipo) {
    case 'nova':
      headerColor = '#22c55e'; // green
      headerText = '🎉 Nova Designação';
      break;
    case 'atualizada':
      headerColor = '#f59e0b'; // amber
      headerText = '📝 Designação Atualizada';
      break;
    case 'cancelada':
      headerColor = '#ef4444'; // red
      headerText = '❌ Designação Cancelada';
      break;
    case 'lembrete':
      headerColor = '#8b5cf6'; // purple
      headerText = '⏰ Lembrete de Designação';
      break;
  }
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, ${headerColor} 0%, ${headerColor}dd 100%); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${headerText}</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">
            Olá, <strong>${estudanteNome}</strong>!
          </p>
          
          ${tipo === 'cancelada' 
            ? `<p style="color: #6b7280; margin-bottom: 20px;">Informamos que sua designação foi cancelada.</p>`
            : tipo === 'lembrete'
            ? `<p style="color: #6b7280; margin-bottom: 20px;">Este é um lembrete sobre sua próxima designação.</p>`
            : `<p style="color: #6b7280; margin-bottom: 20px;">Você recebeu uma designação para a Escola do Ministério Teocrático.</p>`
          }
          
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Parte:</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 600;">${tituloParte}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Tipo:</td>
                <td style="padding: 8px 0; color: #111827;">${tipoParte}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Data:</td>
                <td style="padding: 8px 0; color: #111827;">${formattedDate}</td>
              </tr>
              ${tempoMinutos ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Tempo:</td>
                <td style="padding: 8px 0; color: #111827;">${tempoMinutos} minutos</td>
              </tr>
              ` : ''}
              ${cena ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Cenário:</td>
                <td style="padding: 8px 0; color: #111827;">${cena}</td>
              </tr>
              ` : ''}
              ${ajudanteNome ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Ajudante:</td>
                <td style="padding: 8px 0; color: #111827;">${ajudanteNome}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          ${observacoes ? `
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Observações:</strong> ${observacoes}
            </p>
          </div>
          ` : ''}
          
          ${tipo !== 'cancelada' ? `
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            Por favor, prepare-se com antecedência e entre em contato caso tenha alguma dúvida ou impedimento.
          </p>
          ` : ''}
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            Esta é uma mensagem automática do Sistema Ministerial.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: EmailRequest = await req.json();
    
    if (!data.estudanteEmail) {
      return new Response(
        JSON.stringify({ error: "Email do estudante não fornecido" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const subject = getEmailSubject(data.tipo, data.tituloParte);
    const html = getEmailHtml(data);

    const emailResponse = await resend.emails.send({
      from: "Sistema Ministerial <onboarding@resend.dev>",
      to: [data.estudanteEmail],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Estudante {
  id: string;
  nome: string;
  genero: string;
  qualificacoes: string[];
  cargo: string;
  ativo: boolean;
}

interface Designacao {
  id: string;
  estudante_id: string;
  tipo_parte: string;
  data_designacao: string;
  titulo_parte: string;
}

interface SugestaoDesignacao {
  estudante_id: string;
  estudante_nome: string;
  tipo_parte: string;
  motivo: string;
  confianca: number;
  ajudante_sugerido?: {
    id: string;
    nome: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { congregacao_id, tipo_parte, data_designacao, quantidade = 3 } = await req.json();

    if (!congregacao_id) {
      throw new Error("congregacao_id é obrigatório");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar estudantes ativos da congregação
    const { data: estudantes, error: estudantesError } = await supabase
      .from("estudantes")
      .select("id, nome, genero, qualificacoes, cargo, ativo")
      .eq("congregacao_id", congregacao_id)
      .eq("ativo", true);

    if (estudantesError) {
      throw new Error(`Erro ao buscar estudantes: ${estudantesError.message}`);
    }

    if (!estudantes || estudantes.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Nenhum estudante ativo encontrado",
          sugestoes: [] 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar histórico de designações (últimos 6 meses)
    const seisAnosAtras = new Date();
    seisAnosAtras.setMonth(seisAnosAtras.getMonth() - 6);

    const { data: historicoDesignacoes, error: historicoError } = await supabase
      .from("designacoes")
      .select("id, estudante_id, ajudante_id, tipo_parte, data_designacao, titulo_parte, status")
      .eq("congregacao_id", congregacao_id)
      .gte("data_designacao", seisAnosAtras.toISOString().split("T")[0])
      .order("data_designacao", { ascending: false });

    if (historicoError) {
      console.error("Erro ao buscar histórico:", historicoError);
    }

    // Preparar contexto para a IA
    const estudantesInfo = estudantes.map((e: Estudante) => {
      const designacoesEstudante = (historicoDesignacoes || []).filter(
        (d: Designacao) => d.estudante_id === e.id
      );
      const ultimaDesignacao = designacoesEstudante[0];
      
      return {
        id: e.id,
        nome: e.nome,
        genero: e.genero,
        qualificacoes: e.qualificacoes || [],
        cargo: e.cargo,
        total_designacoes: designacoesEstudante.length,
        ultima_designacao: ultimaDesignacao ? {
          tipo: ultimaDesignacao.tipo_parte,
          data: ultimaDesignacao.data_designacao
        } : null,
        tipos_realizados: [...new Set(designacoesEstudante.map((d: Designacao) => d.tipo_parte))]
      };
    });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const tipoParteTexto = tipo_parte ? `para a parte "${tipo_parte}"` : "para diferentes partes do programa";

    const systemPrompt = `Você é um assistente especializado em designações da Escola do Ministério Teocrático das Testemunhas de Jeová.

Sua tarefa é sugerir estudantes para designações baseado em:
1. Qualificações do estudante (ex: "leitura_biblia", "discurso", "revisita", "estudo_biblico", "video", "presidente", etc.)
2. Histórico de designações (distribuição justa - quem não participou recentemente tem prioridade)
3. Gênero (algumas partes são específicas para homens ou mulheres)
4. Cargo (ancião, servo ministerial, publicador batizado, publicador não batizado)
5. Progressão do estudante (começar com partes mais simples e progredir)

Regras importantes:
- Partes com "discurso" geralmente são para homens (anciãos ou servos ministeriais)
- Partes de "leitura_biblia" são exclusivas para homens
- Partes como "revisita" e "estudo_biblico" podem ter ajudante (geralmente do mesmo gênero)
- Distribua as designações de forma justa entre todos os estudantes qualificados
- Priorize quem não teve designação recentemente
- Considere a progressão: estudantes novos devem começar com partes mais simples

Responda APENAS em formato JSON válido com a seguinte estrutura:
{
  "sugestoes": [
    {
      "estudante_id": "uuid",
      "estudante_nome": "nome",
      "tipo_parte": "tipo",
      "motivo": "explicação breve",
      "confianca": 0.95,
      "ajudante_sugerido": {
        "id": "uuid ou null",
        "nome": "nome ou null"
      }
    }
  ]
}`;

    const userPrompt = `Com base nos seguintes estudantes e seu histórico, sugira ${quantidade} estudantes ${tipoParteTexto}${data_designacao ? ` na data ${data_designacao}` : ""}.

ESTUDANTES E HISTÓRICO:
${JSON.stringify(estudantesInfo, null, 2)}

${tipo_parte ? `TIPO DE PARTE SOLICITADA: ${tipo_parte}` : "Sugira para diferentes tipos de partes conforme as qualificações."}

Considere:
- Qualificações de cada estudante
- Quando foi a última designação de cada um
- Distribuição justa das oportunidades
- Gênero apropriado para cada tipo de parte

Retorne ${quantidade} sugestões em formato JSON.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente mais tarde." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA insuficientes. Adicione créditos na workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error("Erro ao processar sugestões com IA");
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("Resposta vazia da IA");
    }

    // Parse da resposta JSON da IA
    let sugestoes: SugestaoDesignacao[] = [];
    try {
      // Remove possíveis markdown code blocks
      const cleanContent = aiContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleanContent);
      sugestoes = parsed.sugestoes || parsed;
    } catch (parseError) {
      console.error("Erro ao parsear resposta da IA:", parseError);
      console.error("Conteúdo recebido:", aiContent);
      throw new Error("Erro ao interpretar sugestões da IA");
    }

    return new Response(
      JSON.stringify({
        success: true,
        sugestoes,
        total_estudantes: estudantes.length,
        periodo_historico: "6 meses",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro na função suggest-designacoes:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Erro desconhecido",
        sugestoes: [] 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

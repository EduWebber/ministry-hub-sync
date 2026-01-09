import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, UserCheck, Users, CheckCircle2 } from "lucide-react";
import { useAISuggestions, SugestaoDesignacao } from "@/hooks/useAISuggestions";
import { useCreateDesignacao } from "@/hooks/useCreateDesignacao";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AISuggestionsPanelProps {
  congregacaoId: string;
  programaId?: string;
  dataDesignacaoDefault?: string;
  onDesignacaoCriada?: (designacao: any) => void;
  className?: string;
}

const TIPOS_PARTE = [
  { value: "", label: "Qualquer tipo" },
  { value: "leitura_biblia", label: "Leitura da Bíblia" },
  { value: "discurso", label: "Discurso" },
  { value: "revisita", label: "Revisita" },
  { value: "estudo_biblico", label: "Estudo Bíblico" },
  { value: "video", label: "Vídeo" },
  { value: "conversa", label: "Conversa" },
];

export function AISuggestionsPanel({ 
  congregacaoId, 
  programaId,
  dataDesignacaoDefault,
  onDesignacaoCriada,
  className 
}: AISuggestionsPanelProps) {
  const { isLoading, sugestoes, error, fetchSuggestions, clearSuggestions } = useAISuggestions();
  const { isCreating, createFromSuggestion } = useCreateDesignacao();
  const [tipoParte, setTipoParte] = useState("");
  const [dataDesignacao, setDataDesignacao] = useState(dataDesignacaoDefault || "");
  const [quantidade, setQuantidade] = useState(3);
  const [createdIds, setCreatedIds] = useState<Set<string>>(new Set());

  const handleGenerateSuggestions = async () => {
    setCreatedIds(new Set());
    await fetchSuggestions({
      congregacao_id: congregacaoId,
      tipo_parte: tipoParte || undefined,
      data_designacao: dataDesignacao || undefined,
      quantidade,
    });
  };

  const handleAcceptAndCreate = async (sugestao: SugestaoDesignacao) => {
    try {
      const designacao = await createFromSuggestion({
        sugestao,
        congregacaoId,
        programaId,
        dataDesignacao: dataDesignacao || undefined,
        tituloParte: sugestao.tipo_parte,
      });

      setCreatedIds(prev => new Set(prev).add(sugestao.estudante_id));
      
      if (onDesignacaoCriada) {
        onDesignacaoCriada(designacao);
      }
    } catch {
      // Error is already handled by the hook
    }
  };

  const getConfidenceColor = (confianca: number) => {
    if (confianca >= 0.8) return "bg-green-500/20 text-green-700 dark:text-green-400";
    if (confianca >= 0.6) return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
    return "bg-red-500/20 text-red-700 dark:text-red-400";
  };

  const getConfidenceLabel = (confianca: number) => {
    if (confianca >= 0.8) return "Alta";
    if (confianca >= 0.6) return "Média";
    return "Baixa";
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Sugestões Inteligentes
        </CardTitle>
        <CardDescription>
          Use IA para sugerir designações baseadas no histórico e qualificações dos estudantes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="tipo-parte">Tipo de Parte</Label>
            <Select value={tipoParte} onValueChange={setTipoParte}>
              <SelectTrigger id="tipo-parte">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_PARTE.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="data-designacao">Data da Designação</Label>
            <Input
              id="data-designacao"
              type="date"
              value={dataDesignacao}
              onChange={(e) => setDataDesignacao(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantidade">Quantidade</Label>
            <Select value={quantidade.toString()} onValueChange={(v) => setQuantidade(Number(v))}>
              <SelectTrigger id="quantidade">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n} sugestão{n > 1 ? "ões" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botão de Gerar */}
        <Button 
          onClick={handleGenerateSuggestions} 
          disabled={isLoading || !congregacaoId}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analisando dados...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Gerar Sugestões com IA
            </>
          )}
        </Button>

        {/* Erro */}
        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Lista de Sugestões */}
        {sugestoes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">
                {sugestoes.length} Sugestão{sugestoes.length > 1 ? "ões" : ""} Encontrada{sugestoes.length > 1 ? "s" : ""}
              </h4>
              <Button variant="ghost" size="sm" onClick={clearSuggestions}>
                Limpar
              </Button>
            </div>
            
            {sugestoes.map((sugestao, index) => {
              const isCreated = createdIds.has(sugestao.estudante_id);
              
              return (
                <Card 
                  key={`${sugestao.estudante_id}-${index}`} 
                  className={cn(
                    "transition-all",
                    isCreated && "border-green-500 bg-green-500/5 opacity-75"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <UserCheck className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{sugestao.estudante_nome}</span>
                          <Badge variant="outline">{sugestao.tipo_parte}</Badge>
                          <Badge className={getConfidenceColor(sugestao.confianca)}>
                            {getConfidenceLabel(sugestao.confianca)} ({Math.round(sugestao.confianca * 100)}%)
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{sugestao.motivo}</p>
                        
                        {sugestao.ajudante_sugerido?.nome && (
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-3 w-3" />
                            <span>Ajudante sugerido: <strong>{sugestao.ajudante_sugerido.nome}</strong></span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {isCreated ? (
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Designado
                          </Badge>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={() => handleAcceptAndCreate(sugestao)}
                            disabled={isCreating}
                          >
                            {isCreating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 className="mr-1 h-4 w-4" />
                                Designar
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Estado vazio */}
        {!isLoading && sugestoes.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Sparkles className="mb-2 h-8 w-8 opacity-50" />
            <p className="text-sm">
              Clique em "Gerar Sugestões" para obter recomendações inteligentes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

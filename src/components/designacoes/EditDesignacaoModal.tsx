import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { DesignacaoCompleta, UpdateDesignacaoData } from "@/hooks/useDesignacoes";
import { useEstudantes } from "@/hooks/useEstudantes";

interface EditDesignacaoModalProps {
  designacao: DesignacaoCompleta | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, data: UpdateDesignacaoData) => Promise<{ success: boolean; error?: string }>;
}

const TIPOS_PARTE = [
  { value: "leitura_biblia", label: "Leitura da Bíblia" },
  { value: "discurso", label: "Discurso" },
  { value: "revisita", label: "Revisita" },
  { value: "estudo_biblico", label: "Estudo Bíblico" },
  { value: "video", label: "Vídeo" },
  { value: "conversa", label: "Conversa" },
  { value: "demonstracao", label: "Demonstração" },
];

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "confirmado", label: "Confirmado" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" },
];

export function EditDesignacaoModal({
  designacao,
  open,
  onOpenChange,
  onSave,
}: EditDesignacaoModalProps) {
  const { estudantes, isLoading: estudantesLoading } = useEstudantes();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateDesignacaoData>({});

  // Reset form data when designacao changes
  const initializeForm = () => {
    if (designacao) {
      setFormData({
        titulo_parte: designacao.titulo_parte,
        tipo_parte: designacao.tipo_parte,
        tempo_minutos: designacao.tempo_minutos,
        cena: designacao.cena,
        data_designacao: designacao.data_designacao,
        status: designacao.status,
        observacoes: designacao.observacoes,
        estudante_id: designacao.estudante_id,
        ajudante_id: designacao.ajudante_id,
      });
    }
  };

  // Initialize when modal opens
  if (open && designacao && !formData.titulo_parte) {
    initializeForm();
  }

  const handleSave = async () => {
    if (!designacao) return;

    setIsSaving(true);
    try {
      const result = await onSave(designacao.id, formData);
      if (result.success) {
        onOpenChange(false);
        setFormData({});
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData({});
  };

  if (!designacao) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Designação</DialogTitle>
          <DialogDescription>
            Modifique os detalhes da designação. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Título da Parte */}
          <div className="space-y-2">
            <Label htmlFor="titulo_parte">Título da Parte</Label>
            <Input
              id="titulo_parte"
              value={formData.titulo_parte || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, titulo_parte: e.target.value }))
              }
            />
          </div>

          {/* Tipo de Parte */}
          <div className="space-y-2">
            <Label htmlFor="tipo_parte">Tipo de Parte</Label>
            <Select
              value={formData.tipo_parte || ""}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, tipo_parte: value }))
              }
            >
              <SelectTrigger id="tipo_parte">
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

          {/* Estudante Principal */}
          <div className="space-y-2">
            <Label htmlFor="estudante_id">Estudante Principal</Label>
            <Select
              value={formData.estudante_id || "none"}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  estudante_id: value === "none" ? null : value,
                }))
              }
              disabled={estudantesLoading}
            >
              <SelectTrigger id="estudante_id">
                <SelectValue placeholder="Selecione um estudante" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não designado</SelectItem>
                {estudantes.map((estudante) => (
                  <SelectItem key={estudante.id} value={estudante.id}>
                    {estudante.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ajudante */}
          <div className="space-y-2">
            <Label htmlFor="ajudante_id">Ajudante (opcional)</Label>
            <Select
              value={formData.ajudante_id || "none"}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  ajudante_id: value === "none" ? null : value,
                }))
              }
              disabled={estudantesLoading}
            >
              <SelectTrigger id="ajudante_id">
                <SelectValue placeholder="Selecione um ajudante" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem ajudante</SelectItem>
                {estudantes
                  .filter((e) => e.id !== formData.estudante_id)
                  .map((estudante) => (
                    <SelectItem key={estudante.id} value={estudante.id}>
                      {estudante.nome}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tempo */}
            <div className="space-y-2">
              <Label htmlFor="tempo_minutos">Tempo (min)</Label>
              <Input
                id="tempo_minutos"
                type="number"
                min={1}
                max={30}
                value={formData.tempo_minutos || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tempo_minutos: parseInt(e.target.value) || null,
                  }))
                }
              />
            </div>

            {/* Data */}
            <div className="space-y-2">
              <Label htmlFor="data_designacao">Data</Label>
              <Input
                id="data_designacao"
                type="date"
                value={formData.data_designacao || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, data_designacao: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status || "pendente"}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cena */}
          <div className="space-y-2">
            <Label htmlFor="cena">Cena/Cenário</Label>
            <Input
              id="cena"
              value={formData.cena || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, cena: e.target.value }))
              }
              placeholder="Ex: De casa em casa, Informal, etc."
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, observacoes: e.target.value }))
              }
              placeholder="Notas adicionais sobre a designação..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

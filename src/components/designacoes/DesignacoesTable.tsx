import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, XCircle, Trash2, Clock, User, Users } from "lucide-react";
import { DesignacaoCompleta, UpdateDesignacaoData } from "@/hooks/useDesignacoes";
import { EditDesignacaoModal } from "./EditDesignacaoModal";
import { ConfirmDialog } from "./ConfirmDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DesignacoesTableProps {
  designacoes: DesignacaoCompleta[];
  loading?: boolean;
  onUpdate: (id: string, data: UpdateDesignacaoData) => Promise<{ success: boolean; error?: string }>;
  onCancel: (id: string) => Promise<{ success: boolean; error?: string }>;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const getStatusBadge = (status: string | null) => {
  switch (status) {
    case "confirmado":
    case "concluido":
      return <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">Confirmado</Badge>;
    case "cancelado":
      return <Badge variant="destructive">Cancelado</Badge>;
    case "pendente":
    default:
      return <Badge variant="secondary">Pendente</Badge>;
  }
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "—";
  try {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return dateString;
  }
};

export function DesignacoesTable({
  designacoes,
  loading,
  onUpdate,
  onCancel,
  onDelete,
}: DesignacoesTableProps) {
  const [editingDesignacao, setEditingDesignacao] = useState<DesignacaoCompleta | null>(null);
  const [cancelingDesignacao, setCancelingDesignacao] = useState<DesignacaoCompleta | null>(null);
  const [deletingDesignacao, setDeletingDesignacao] = useState<DesignacaoCompleta | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCancelConfirm = async () => {
    if (!cancelingDesignacao) return;
    
    setIsProcessing(true);
    try {
      await onCancel(cancelingDesignacao.id);
    } finally {
      setIsProcessing(false);
      setCancelingDesignacao(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDesignacao) return;
    
    setIsProcessing(true);
    try {
      await onDelete(deletingDesignacao.id);
    } finally {
      setIsProcessing(false);
      setDeletingDesignacao(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (designacoes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <Users className="mb-4 h-12 w-12 opacity-30" />
        <p className="text-lg font-medium">Nenhuma designação encontrada</p>
        <p className="text-sm">As designações aparecerão aqui quando forem criadas.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parte</TableHead>
              <TableHead>Estudante</TableHead>
              <TableHead>Ajudante</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {designacoes.map((designacao) => (
              <TableRow 
                key={designacao.id}
                className={designacao.status === "cancelado" ? "opacity-60" : ""}
              >
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{designacao.titulo_parte}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {designacao.tipo_parte && (
                        <Badge variant="outline" className="text-xs">
                          {designacao.tipo_parte}
                        </Badge>
                      )}
                      {designacao.tempo_minutos && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {designacao.tempo_minutos} min
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {designacao.estudante ? (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{designacao.estudante.nome}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic">Não designado</span>
                  )}
                </TableCell>
                <TableCell>
                  {designacao.ajudante ? (
                    <span className="text-sm">{designacao.ajudante.nome}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>{formatDate(designacao.data_designacao)}</TableCell>
                <TableCell>{getStatusBadge(designacao.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingDesignacao(designacao)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      {designacao.status !== "cancelado" && (
                        <DropdownMenuItem 
                          onClick={() => setCancelingDesignacao(designacao)}
                          className="text-yellow-600"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancelar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setDeletingDesignacao(designacao)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal */}
      <EditDesignacaoModal
        designacao={editingDesignacao}
        open={!!editingDesignacao}
        onOpenChange={(open) => !open && setEditingDesignacao(null)}
        onSave={onUpdate}
      />

      {/* Cancel Confirmation */}
      <ConfirmDialog
        open={!!cancelingDesignacao}
        onOpenChange={(open) => !open && setCancelingDesignacao(null)}
        title="Cancelar Designação"
        description={`Tem certeza que deseja cancelar a designação "${cancelingDesignacao?.titulo_parte}"? A designação permanecerá no histórico, mas será marcada como cancelada.`}
        confirmLabel="Cancelar Designação"
        variant="default"
        onConfirm={handleCancelConfirm}
        isLoading={isProcessing}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingDesignacao}
        onOpenChange={(open) => !open && setDeletingDesignacao(null)}
        title="Excluir Designação"
        description={`Tem certeza que deseja excluir permanentemente a designação "${deletingDesignacao?.titulo_parte}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        isLoading={isProcessing}
      />
    </>
  );
}

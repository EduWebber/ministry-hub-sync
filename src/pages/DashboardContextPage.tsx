import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProgramContext } from "@/contexts/ProgramContext";
import { toast } from "@/hooks/use-toast";
import SidebarLayout from "@/components/layout/SidebarLayout";

const DashboardContextPage = () => {
  const { 
    selectedCongregacaoId, 
    setSelectedCongregacaoId, 
    selectedProgramId, 
    setSelectedProgramId,
    selectedWeekStart,
    setSelectedWeekStart,
    clearContext
  } = useProgramContext();

  const [newProgramId, setNewProgramId] = useState(selectedProgramId || "");
  const [newWeekStart, setNewWeekStart] = useState(selectedWeekStart || "");

  const handleSaveContext = () => {
    if (newProgramId) {
      setSelectedProgramId(newProgramId);
    }
    if (newWeekStart) {
      setSelectedWeekStart(newWeekStart);
    }
    toast({
      title: "Contexto atualizado",
      description: "As configurações de contexto foram salvas com sucesso."
    });
  };

  return (
    <SidebarLayout 
      title="Contexto do Sistema"
      description="Gerencie o contexto global do sistema (congregação, programa, semana)"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Contexto</CardTitle>
            <CardDescription>
              Defina o contexto global para navegação e filtragem de dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="congregacao">Congregação</Label>
                <Select value={selectedCongregacaoId || ""} onValueChange={setSelectedCongregacaoId}>
                  <SelectTrigger id="congregacao">
                    <SelectValue placeholder="Selecione uma congregação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="congregacao-1">Congregação Central</SelectItem>
                    <SelectItem value="congregacao-2">Congregação Norte</SelectItem>
                    <SelectItem value="congregacao-3">Congregação Sul</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="programa">ID do Programa</Label>
                <Input
                  id="programa"
                  value={newProgramId}
                  onChange={(e) => setNewProgramId(e.target.value)}
                  placeholder="Digite o ID do programa"
                />
              </div>

              <div>
                <Label htmlFor="semana">Data de Início da Semana</Label>
                <Input
                  id="semana"
                  type="date"
                  value={newWeekStart}
                  onChange={(e) => setNewWeekStart(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveContext}>
                  Salvar Contexto
                </Button>
                <Button variant="outline" onClick={clearContext}>
                  Limpar Contexto
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contexto Atual</CardTitle>
            <CardDescription>
              Valores atuais das variáveis de contexto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900">Congregação</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedCongregacaoId || "Não definida"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900">Programa</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedProgramId || "Não definido"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900">Semana</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedWeekStart || "Não definida"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
};

export default DashboardContextPage;
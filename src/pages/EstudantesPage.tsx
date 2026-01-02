import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Search, Filter, Users, FileSpreadsheet, BarChart3, Upload, Table, Info } from "lucide-react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { useEstudantes } from "@/hooks/useEstudantes";
import EstudanteForm from "@/components/EstudanteForm";
import EstudanteCard from "@/components/EstudanteCard";
import SpreadsheetUpload from "@/components/SpreadsheetUpload";
import EnhancedStudentImport from "@/components/EnhancedStudentImport";
import StudentsSpreadsheet from "@/components/StudentsSpreadsheet";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  EstudanteWithParent,
  EstudanteFilters,
  CARGO_LABELS,
} from "@/types/estudantes";

const EstudantesPage = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [editingEstudante, setEditingEstudante] = useState<EstudanteWithParent | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const {
    estudantes,
    isLoading,
    error,
    refetch,
    createEstudante,
    updateEstudante,
    deleteEstudante,
    filterEstudantes,
    getStatistics,
  } = useEstudantes();

  const [filters, setFilters] = useState<EstudanteFilters>({
    searchTerm: "",
    cargo: "todos",
    genero: "todos",
    ativo: "todos",
  });

  const filteredEstudantes = useMemo(() => {
    return filterEstudantes(filters);
  }, [estudantes, filters, filterEstudantes]);

  const statistics = useMemo(() => {
    return getStatistics();
  }, [getStatistics]);

  const potentialParents = useMemo(() => {
    if (!estudantes) return [];
    return estudantes.filter(e => e.ativo);
  }, [estudantes]);

  const handleFilterChange = (field: keyof EstudanteFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateEstudante = async (data: any): Promise<boolean> => {
    setFormLoading(true);
    await createEstudante(data);
    setFormLoading(false);
    setActiveTab("list");
    return true;
  };

  const handleUpdateEstudante = async (data: any): Promise<boolean> => {
    if (!editingEstudante) return false;
    setFormLoading(true);
    await updateEstudante(editingEstudante.id, data);
    setFormLoading(false);
    setEditingEstudante(null);
    setActiveTab("list");
    return true;
  };

  const handleEditEstudante = (estudante: any) => {
    setEditingEstudante(estudante);
    setActiveTab("form");
  };

  const handleDeleteEstudante = async (id: string) => {
    await deleteEstudante(id);
  };

  const handleCancelForm = () => {
    setEditingEstudante(null);
    setActiveTab("list");
  };

  const handleImportComplete = () => {
    refetch();
    setActiveTab("list");
  };

  if (isLoading) {
    return (
      <SidebarLayout title="Estudantes">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (error) {
    return (
      <SidebarLayout title="Estudantes">
        <EmptyState
          title="Erro ao carregar estudantes"
          description={String(error)}
          action={<Button onClick={() => refetch()}>Tentar novamente</Button>}
        />
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout 
      title="Gestão de Estudantes"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            🔄 Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setActiveTab("import")}>
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button size="sm" onClick={() => { setEditingEstudante(null); setActiveTab("form"); }}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Estudante
          </Button>
        </div>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {editingEstudante ? 'Editar' : 'Novo'}
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Importar
          </TabsTrigger>
          <TabsTrigger value="spreadsheet" className="flex items-center gap-2">
            <Table className="w-4 h-4" />
            Planilha
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Estatísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Buscar por nome..." 
                    value={filters.searchTerm} 
                    onChange={(e) => handleFilterChange("searchTerm", e.target.value)} 
                    className="pl-10" 
                  />
                </div>
                <Select value={filters.cargo} onValueChange={(value) => handleFilterChange("cargo", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os cargos</SelectItem>
                    {Object.entries(CARGO_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEstudantes.map((estudante) => (
              <EstudanteCard 
                key={estudante.id} 
                estudante={estudante} 
                onEdit={() => handleEditEstudante(estudante)} 
                onDelete={() => handleDeleteEstudante(estudante.id)} 
              />
            ))}
          </div>

          {filteredEstudantes.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum estudante encontrado</h3>
              <p className="text-gray-500 mb-4">Ajuste os filtros ou cadastre um novo estudante</p>
              <Button onClick={() => setActiveTab("form")}>
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Estudante
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="form">
          <EstudanteForm 
            estudante={editingEstudante || undefined} 
            potentialParents={potentialParents} 
            onSubmit={editingEstudante ? handleUpdateEstudante : handleCreateEstudante} 
            onCancel={handleCancelForm} 
            loading={formLoading} 
          />
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{statistics.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{statistics.ativos}</div>
                <div className="text-sm text-gray-600">Ativos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">{statistics.inativos}</div>
                <div className="text-sm text-gray-600">Inativos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">{statistics.menores}</div>
                <div className="text-sm text-gray-600">Menores</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Sistema Aprimorado:</strong> Esta página agora integra completamente todos os recursos 
                documentados em <code>docs/Oficial</code>, incluindo validação inteligente de 32+ colunas, 
                análise familiar automática, e processamento completo de qualificações S-38.
              </AlertDescription>
            </Alert>
            <EnhancedStudentImport 
              onImportComplete={handleImportComplete} 
              onViewList={() => setActiveTab("list")} 
            />
            
            {/* Legacy import for compatibility */}
            <details className="mt-6">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                Mostrar sistema de importação legado (compatibilidade)
              </summary>
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <SpreadsheetUpload onImportComplete={handleImportComplete} onViewList={() => setActiveTab("list")} />
              </div>
            </details>
          </div>
        </TabsContent>

        <TabsContent value="spreadsheet" className="w-full overflow-x-auto">
          <StudentsSpreadsheet estudantes={estudantes || []} onRefresh={() => refetch()} />
        </TabsContent>
      </Tabs>
    </SidebarLayout>
  );
};

export default EstudantesPage;
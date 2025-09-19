import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { 
  Users, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Clock,
  RefreshCw,
  Save,
  Download,
  Upload,
  BookOpen,
  User,
  UserCheck,
  Calendar
} from "lucide-react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { useEstudantes } from "@/hooks/useEstudantes";
import { useAuth } from "@/contexts/AuthContext";
import { AssignmentPreviewModal } from "@/components/AssignmentPreviewModal";
import { supabase } from "@/integrations/supabase/client";

// Types for the assignment system
interface Assignment {
  id: string;
  programacao_item_id: string;
  principal_estudante_id: string | null;
  assistente_estudante_id: string | null;
  status: 'OK' | 'PENDING';
  observacoes?: string;
  parte_titulo?: string;
  parte_numero?: number;
  parte_tempo?: number;
  parte_tipo?: string;
}

interface ProgramItem {
  id: string;
  titulo: string;
  tipo: string;
  tempo: number;
  ordem: number;
  secao: string;
  regras_papel?: {
    genero?: string;
    assistente_necessario?: boolean;
  };
}

interface Program {
  id: string;
  titulo: string;
  semana: string;
  data_inicio: string;
  itens: ProgramItem[];
}

const AssignmentsPage = () => {
  const { estudantes, isLoading: estudantesLoading } = useEstudantes();
  const { user } = useAuth();

  // State management
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  const firstCong = Array.isArray(estudantes) && estudantes.length > 0 ? (estudantes as any[]).find((e: any) => e?.congregacao_id)?.congregacao_id : '';
  const [congregacaoId, setCongregacaoId] = useState(firstCong || '');
  const [showPreview, setShowPreview] = useState(false);
  const [availablePrograms, setAvailablePrograms] = useState<Program[]>([]);

  // Load available programs
  const loadPrograms = async () => {
    setIsLoadingPrograms(true);
    try {
      // Prefer Supabase Edge Function to list JSON programs
      const { data, error } = await supabase.functions.invoke('list-programs-json', {
        body: { limit: 10 }
      });

      if (!error && data?.programas && data.programas.length > 0) {
        const programs: Program[] = data.programas.map((p: any, index: number) => ({
          id: p.idSemana || `program-${index}`,
          titulo: p.semanaLabel || p.titulo || `Programa ${index + 1}`,
          semana: p.semanaLabel || `Semana ${index + 1}`,
          data_inicio: p.idSemana || new Date().toISOString().split('T')[0],
          itens: p.programacao ? p.programacao.flatMap((secao: any) => 
            secao.partes.map((parte: any, parteIndex: number) => ({
              id: `${p.idSemana || index}-${secao.secao}-${parteIndex}`,
              titulo: parte.titulo,
              tipo: parte.tipo,
              tempo: parte.duracaoMin || 0,
              ordem: parte.idParte || parteIndex + 1,
              secao: secao.secao,
              regras_papel: parte.restricoes || {}
            }))
          ) : []
        }));
        setAvailablePrograms(programs);
        if (programs.length > 0 && !selectedProgram) {
          setSelectedProgram(programs[0]);
        }
        return;
      }

      // Fallback to mock program
      const mockProgram: Program = {
        id: 'mock-program-2025-01-01',
        titulo: '5-11 de janeiro 2025',
        semana: '5-11 de janeiro 2025', 
        data_inicio: '2025-01-05',
        itens: [
          {
            id: 'item-1',
            titulo: 'Leitura da Bíblia',
            tipo: 'bible_reading',
            tempo: 4,
            ordem: 1,
            secao: 'TREASURES',
            regras_papel: { genero: 'masculino', assistente_necessario: false }
          },
          {
            id: 'item-2', 
            titulo: 'Iniciando conversas',
            tipo: 'starting',
            tempo: 3,
            ordem: 2,
            secao: 'APPLY',
            regras_papel: { genero: 'qualquer', assistente_necessario: true }
          },
          {
            id: 'item-3',
            titulo: 'Cultivando interesse',
            tipo: 'following',
            tempo: 4,
            ordem: 3,
            secao: 'APPLY',
            regras_papel: { genero: 'qualquer', assistente_necessario: true }
          },
          {
            id: 'item-4',
            titulo: 'Fazendo discípulos',
            tipo: 'making_disciples',
            tempo: 5,
            ordem: 4,
            secao: 'APPLY', 
            regras_papel: { genero: 'qualquer', assistente_necessario: true }
          }
        ]
      };

      setAvailablePrograms([mockProgram]);
      setSelectedProgram(mockProgram);
      
      toast({
        title: "Programas carregados",
        description: "Usando dados de exemplo para demonstração"
      });

    } catch (error) {
      console.error('Error loading programs:', error);
      toast({
        title: "Erro ao carregar programas",
        description: "Não foi possível carregar os programas disponíveis",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPrograms(false);
    }
  };

  // Generate assignments using the S-38 algorithm
  const generateAssignments = async () => {
    if (!selectedProgram) {
      toast({
        title: "Programa requerido",
        description: "Selecione um programa antes de gerar designações",
        variant: "destructive"
      });
      return;
    }

    if (!congregacaoId) {
      toast({
        title: "Congregação requerida", 
        description: "Selecione uma congregação antes de gerar designações",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('generate-assignments', {
        body: {
          programacao_id: selectedProgram.id,
          congregacao_id: congregacaoId
        }
      });

      if (error) {
        throw new Error(error.message || 'Falha ao gerar designações');
      }
      console.log('Assignment generation result:', result);

      const generatedAssignments = result.designacoes || [];
      
      // Transform assignments to include program item data
      const transformedAssignments: Assignment[] = generatedAssignments.map((assignment: any) => {
        const programItem = selectedProgram.itens.find(item => item.id === assignment.programacao_item_id);
        return {
          ...assignment,
          parte_titulo: programItem?.titulo || assignment.parte_titulo || 'Parte não identificada',
          parte_numero: programItem?.ordem || assignment.parte_numero || 0,
          parte_tempo: programItem?.tempo || assignment.parte_tempo || 0,
          parte_tipo: programItem?.tipo || assignment.parte_tipo || 'unknown'
        };
      });

      setAssignments(transformedAssignments);
      
      if (transformedAssignments.length > 0) {
        setShowPreview(true);
        toast({
          title: "Designações geradas!",
          description: `${transformedAssignments.length} designações foram criadas com sucesso`
        });
      } else {
        toast({
          title: "Nenhuma designação gerada",
          description: "Verifique se há estudantes elegíveis na congregação",
          variant: "destructive"
        });
      }

    } catch (error: any) {
      console.error('Error generating assignments:', error);
      toast({
        title: "Erro ao gerar designações",
        description: error?.message || 'Falha na geração automática',
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Save assignments to database
  const saveAssignments = async () => {
    if (!selectedProgram || assignments.length === 0) {
      toast({
        title: "Nenhuma designação para salvar",
        description: "Gere as designações primeiro",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        programacao_id: selectedProgram.id,
        congregacao_id: congregacaoId,
        itens: assignments.map(assignment => ({
          programacao_item_id: assignment.programacao_item_id,
          principal_estudante_id: assignment.principal_estudante_id,
          assistente_estudante_id: assignment.assistente_estudante_id,
          observacoes: assignment.observacoes
        }))
      };

      const { error } = await supabase.functions.invoke('save-assignments', {
        body: payload
      });

      if (error) {
        throw new Error(error.message || 'Falha ao salvar designações');
      }

      toast({
        title: "Designações salvas!",
        description: "As designações foram salvas no banco de dados"
      });

    } catch (error: any) {
      console.error('Error saving assignments:', error);
      toast({
        title: "Erro ao salvar designações",
        description: error?.message || 'Não foi possível salvar',
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Get student name by ID
  const getStudentName = (id: string | null): string => {
    if (!id) return 'Não designado';
    
    const student = estudantes?.find((e: any) => e.id === id);
    return student?.nome || `ID: ${id}`;
  };

  // Get status badge component
  const getStatusBadge = (assignment: Assignment) => {
    if (!assignment.principal_estudante_id) {
      return <Badge variant="destructive">Pendente</Badge>;
    }
    if (assignment.status === 'OK') {
      return <Badge variant="default">Designada</Badge>;
    }
    return <Badge variant="secondary">Processando</Badge>;
  };

  // Summary statistics
  const assignmentStats = useMemo(() => {
    const totalAssignments = assignments.length;
    const assignedCount = assignments.filter(a => a.principal_estudante_id).length;
    const pendingCount = totalAssignments - assignedCount;
    const withAssistantCount = assignments.filter(a => a.assistente_estudante_id).length;
    
    return {
      total: totalAssignments,
      assigned: assignedCount,
      pending: pendingCount,
      withAssistant: withAssistantCount
    };
  }, [assignments]);

  // Load programs on component mount
  useEffect(() => {
    loadPrograms();
  }, []);

  return (
    <SidebarLayout 
      title={`Designações - ${selectedProgram?.semana || '—'}`}
      actions={
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadPrograms} 
            disabled={isLoadingPrograms}
          >
            {isLoadingPrograms ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Carregar Programas
          </Button>
          
          <Button 
            size="sm" 
            onClick={generateAssignments} 
            disabled={isGenerating || !selectedProgram || !congregacaoId}
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Users className="w-4 h-4 mr-2" />
            )}
            Gerar Designações
          </Button>
          
          {assignments.length > 0 && (
            <Button 
              size="sm" 
              variant="default" 
              onClick={saveAssignments}
              disabled={isSaving}
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuração da Geração
            </CardTitle>
            <CardDescription>
              Configure o programa e congregação para gerar designações automáticas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Program Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Programa:</label>
                <Select 
                  value={selectedProgram?.id || ''} 
                  onValueChange={(value) => {
                    const program = availablePrograms.find(p => p.id === value);
                    setSelectedProgram(program || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um programa" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePrograms.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Congregation Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Congregação:</label>
                <Select value={congregacaoId} onValueChange={setCongregacaoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma congregação" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(new Set(((estudantes || []) as any[]).map(e => e?.congregacao_id).filter(Boolean))).length > 0 ? (
                      Array.from(new Set(((estudantes || []) as any[]).map(e => e?.congregacao_id).filter(Boolean))).map((id: any) => (
                        <SelectItem key={String(id)} value={String(id)}>{String(id)}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__all__">Todas</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Students Count */}
              <div>
                <label className="text-sm font-medium mb-2 block">Estudantes disponíveis:</label>
                <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                  {estudantesLoading ? 'Carregando...' : `${estudantes?.length || 0} estudantes`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        {assignments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total de Partes</p>
                    <p className="text-2xl font-bold text-blue-600">{assignmentStats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Designadas</p>
                    <p className="text-2xl font-bold text-green-600">{assignmentStats.assigned}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Pendentes</p>
                    <p className="text-2xl font-bold text-orange-600">{assignmentStats.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Com Assistente</p>
                    <p className="text-2xl font-bold text-purple-600">{assignmentStats.withAssistant}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Program Preview */}
        {selectedProgram && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Programa Selecionado
              </CardTitle>
              <CardDescription>
                {selectedProgram.titulo} • {selectedProgram.itens.length} partes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedProgram.itens.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{item.ordem}. {item.titulo}</p>
                      <p className="text-sm text-gray-600">{item.secao}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        {item.tempo} min
                      </Badge>
                      <Badge variant="outline">{item.tipo}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assignments Table */}
        {assignments.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Designações Geradas
              </CardTitle>
              <CardDescription>
                {assignments.length} designações • {assignmentStats.assigned} designadas • {assignmentStats.pending} pendentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parte</TableHead>
                    <TableHead>Tempo</TableHead>
                    <TableHead>Estudante Principal</TableHead>
                    <TableHead>Assistente</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment, index) => (
                    <TableRow key={assignment.id || index}>
                      <TableCell className="font-medium">
                        <div>
                          <p>{assignment.parte_titulo}</p>
                          <p className="text-sm text-gray-500">#{assignment.parte_numero}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <Clock className="w-3 h-3 mr-1" />
                          {assignment.parte_tempo} min
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStudentName(assignment.principal_estudante_id)}
                      </TableCell>
                      <TableCell>
                        {assignment.assistente_estudante_id 
                          ? getStudentName(assignment.assistente_estudante_id)
                          : '—'
                        }
                      </TableCell>
                      <TableCell>{getStatusBadge(assignment)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          !selectedProgram ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Selecione um programa para começar a gerar designações.
                  </AlertDescription>
                </Alert>
                <Button className="mt-4" onClick={loadPrograms} disabled={isLoadingPrograms}>
                  {isLoadingPrograms ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Carregar Programas
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Nenhuma designação gerada ainda
                </h3>
                <p className="text-gray-500 mb-4">
                  Clique em "Gerar Designações" para criar automaticamente as designações seguindo as regras S-38
                </p>
                <Button 
                  onClick={generateAssignments} 
                  disabled={isGenerating || !congregacaoId}
                >
                  {isGenerating ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Users className="w-4 h-4 mr-2" />
                  )}
                  Gerar Designações Automáticas
                </Button>
              </CardContent>
            </Card>
          )
        )}

        {/* Assignment Preview Modal */}
        <AssignmentPreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onConfirm={() => {
            setShowPreview(false);
            // Optionally auto-save after confirmation
            // saveAssignments();
          }}
          assignments={assignments as any} // Type casting for compatibility
          programTitle={selectedProgram?.titulo || 'Programa'}
          isConfirming={false}
        />
      </div>
    </SidebarLayout>
  );
};

export default AssignmentsPage;

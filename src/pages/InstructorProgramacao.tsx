import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock, 
  User, 
  UserPlus,
  Edit,
  Trash2,
  Save
} from 'lucide-react';

interface ProgramaMinisterial {
  id: string;
  arquivo_nome: string;
  mes_ano: string;
  status: string;
}

interface SemanaPrograma {
  id: string;
  programa_id: string;
  semana_numero: number;
  data_inicio: string;
  tema_semana: string;
  leitura_biblica?: string;
}

interface PartePrograma {
  id: string;
  semana_id: string;
  tipo_designacao: string;
  titulo: string;
  duracao_minutos: number;
  genero_requerido: 'masculino' | 'feminino' | 'ambos';
  ordem: number;
  instrucoes?: string;
}

interface Estudante {
  id: string;
  profile_id: string;
  genero: string;
  qualificacoes: string[];
  ativo: boolean;
  profiles: {
    nome: string;
    email: string;
  };
}

interface Designacao {
  id: string;
  parte_id: string;
  estudante_id: string;
  ajudante_id?: string;
  status: string;
  observacoes?: string;
}

export default function InstructorProgramacao() {
  const [programas, setProgramas] = useState<ProgramaMinisterial[]>([]);
  const [semanas, setSemanas] = useState<SemanaPrograma[]>([]);
  const [partes, setPartes] = useState<PartePrograma[]>([]);
  const [estudantes, setEstudantes] = useState<Estudante[]>([]);
  const [designacoes, setDesignacoes] = useState<Designacao[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      loadPartes();
    }
  }, [selectedProgram, semanas]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load published programs
      const { data: programsData, error: programsError } = await supabase
        .from('programas_ministeriais')
        .select('*')
        .eq('status', 'publicado')
        .order('mes_ano', { ascending: false });

      if (programsError) throw programsError;
      setProgramas(programsData || []);

      // Load semanas
      const { data: semanasData, error: semanasError } = await supabase
        .from('semanas_programa')
        .select('*')
        .order('programa_id, semana_numero');

      if (!semanasError) {
        setSemanas(semanasData || []);
      }

      // Load estudantes
      const { data: estudantesData, error: estudantesError } = await supabase
        .from('estudantes')
        .select(`
          *,
          profiles:profile_id (
            nome,
            email
          )
        `)
        .eq('ativo', true);

      if (!estudantesError) {
        setEstudantes((estudantesData || []) as Estudante[]);
      }

      // Load designacoes
      const { data: designacoesData, error: designacoesError } = await supabase
        .from('designacoes')
        .select('*');

      if (!designacoesError) {
        setDesignacoes((designacoesData || []) as Designacao[]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPartes = async () => {
    if (!selectedProgram) return;

    try {
      const programSemanas = semanas.filter(s => s.programa_id === selectedProgram);
      const semanaIds = programSemanas.map(s => s.id);

      if (semanaIds.length === 0) {
        setPartes([]);
        return;
      }

      // Create default parts for each semana if they don't exist
      const partesDefault = [
        {
          tipo_designacao: 'discurso_tesouros',
          titulo: 'Discurso - Tesouros da Palavra de Deus',
          duracao_minutos: 10,
          genero_requerido: 'masculino' as const,
          ordem: 1,
          instrucoes: 'Discurso baseado no tema da semana'
        },
        {
          tipo_designacao: 'joias_espirituais',
          titulo: 'Joias Espirituais',
          duracao_minutos: 10,
          genero_requerido: 'masculino' as const,
          ordem: 2,
          instrucoes: 'Perguntas e respostas sobre a leitura'
        },
        {
          tipo_designacao: 'leitura_biblica',
          titulo: 'Leitura da Bíblia',
          duracao_minutos: 4,
          genero_requerido: 'masculino' as const,
          ordem: 3,
          instrucoes: 'Leitura fluente e expressiva'
        },
        {
          tipo_designacao: 'iniciando_conversas',
          titulo: 'Iniciando Conversas',
          duracao_minutos: 3,
          genero_requerido: 'ambos' as const,
          ordem: 4,
          instrucoes: 'Demonstração de como iniciar uma conversa no ministério'
        },
        {
          tipo_designacao: 'cultivando_interesse',
          titulo: 'Cultivando o Interesse',
          duracao_minutos: 4,
          genero_requerido: 'ambos' as const,
          ordem: 5,
          instrucoes: 'Demonstração de revisita ou estudo bíblico'
        },
        {
          tipo_designacao: 'estudo_biblico_congregacao',
          titulo: 'Estudo Bíblico de Congregação',
          duracao_minutos: 30,
          genero_requerido: 'masculino' as const,
          ordem: 6,
          instrucoes: 'Dirigir o estudo com participação da assistência'
        }
      ];

      // Insert default parts for each semana
      const partesToInsert = [];
      for (const semana of programSemanas) {
        for (const parte of partesDefault) {
          partesToInsert.push({
            semana_id: semana.id,
            ...parte
          });
        }
      }

      // Check if parts already exist
      const { data: existingPartes } = await supabase
        .from('partes_programa')
        .select('*')
        .in('semana_id', semanaIds);

      if (!existingPartes || existingPartes.length === 0) {
        // Insert new parts
        const { data: insertedPartes, error: insertError } = await supabase
          .from('partes_programa')
          .insert(partesToInsert)
          .select();

        if (insertError) throw insertError;
        setPartes(insertedPartes || []);
      } else {
        setPartes(existingPartes);
      }
    } catch (error) {
      console.error('Error loading partes:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar partes do programa.",
        variant: "destructive",
      });
    }
  };

  const assignStudent = async (parteId: string, estudanteId: string, ajudanteId?: string) => {
    setIsAssigning(true);
    try {
      // Check if already assigned
      const existing = designacoes.find(d => d.parte_id === parteId);
      
      if (existing) {
        // Update existing assignment
        const { error } = await supabase
          .from('designacoes')
          .update({
            estudante_id: estudanteId,
            ajudante_id: ajudanteId || null,
          })
          .eq('id', existing.id);

        if (error) throw error;

        setDesignacoes(prev => prev.map(d => 
          d.id === existing.id 
            ? { ...d, estudante_id: estudanteId, ajudante_id: ajudanteId }
            : d
        ));
      } else {
        // Create new assignment
        const { data, error } = await supabase
          .from('designacoes')
          .insert({
            parte_id: parteId,
            estudante_id: estudanteId,
            ajudante_id: ajudanteId || null,
            status: 'designado',
          })
          .select()
          .single();

        if (error) throw error;
        setDesignacoes(prev => [...prev, data as Designacao]);
      }

      toast({
        title: "Designação feita",
        description: "Estudante designado com sucesso.",
      });
    } catch (error) {
      console.error('Error assigning student:', error);
      toast({
        title: "Erro na designação",
        description: "Erro ao designar estudante.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const removeAssignment = async (designacaoId: string) => {
    try {
      const { error } = await supabase
        .from('designacoes')
        .delete()
        .eq('id', designacaoId);

      if (error) throw error;

      setDesignacoes(prev => prev.filter(d => d.id !== designacaoId));
      toast({
        title: "Designação removida",
        description: "Designação removida com sucesso.",
      });
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover designação.",
        variant: "destructive",
      });
    }
  };

  const formatMesAno = (mesAno: string): string => {
    if (mesAno.length !== 6) return mesAno;
    const ano = mesAno.substring(0, 4);
    const mes = mesAno.substring(4, 6);
    const meses = [
      '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${meses[parseInt(mes)]} ${ano}`;
  };

  const getEstudanteById = (id: string) => {
    return estudantes.find(e => e.id === id);
  };

  const getDesignacaoByParte = (parteId: string) => {
    return designacoes.find(d => d.parte_id === parteId);
  };

  const canAssignGender = (parte: PartePrograma, estudante: Estudante): boolean => {
    if (parte.genero_requerido === 'ambos') return true;
    return parte.genero_requerido === estudante.genero;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Designações Ministeriais</h1>
          <p className="text-muted-foreground">
            Gerencie as designações dos estudantes para as partes da reunião
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Programa</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um programa ministerial" />
              </SelectTrigger>
              <SelectContent>
                {programas.map((programa) => (
                  <SelectItem key={programa.id} value={programa.id}>
                    {formatMesAno(programa.mes_ano)} - {programa.arquivo_nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedProgram && (
          <div className="grid gap-6">
            {semanas
              .filter(s => s.programa_id === selectedProgram)
              .map((semana) => {
                const semanaPartes = partes.filter(p => p.semana_id === semana.id);
                
                return (
                  <Card key={semana.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Semana {semana.semana_numero} - {semana.tema_semana}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(semana.data_inicio).toLocaleDateString('pt-BR')} • 
                        Leitura: {semana.leitura_biblica}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {semanaPartes
                          .sort((a, b) => a.ordem - b.ordem)
                          .map((parte) => {
                            const designacao = getDesignacaoByParte(parte.id);
                            const estudanteAssignado = designacao ? getEstudanteById(designacao.estudante_id) : null;
                            const ajudante = designacao?.ajudante_id ? getEstudanteById(designacao.ajudante_id) : null;

                            return (
                              <div key={parte.id} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-medium">{parte.titulo}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {parte.duracao_minutos} min • {parte.genero_requerido === 'ambos' ? 'Ambos os gêneros' : parte.genero_requerido}
                                    </p>
                                    {parte.instrucoes && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {parte.instrucoes}
                                      </p>
                                    )}
                                  </div>
                                  {designacao && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeAssignment(designacao.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>

                                <div className="grid gap-3">
                                  <div>
                                    <Label className="text-sm">Estudante Principal</Label>
                                    <div className="flex gap-2 mt-1">
                                      <Select
                                        value={estudanteAssignado?.id || ''}
                                        onValueChange={(value) => assignStudent(parte.id, value, designacao?.ajudante_id)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecionar estudante" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {estudantes
                                            .filter(e => canAssignGender(parte, e))
                                            .map((estudante) => (
                                              <SelectItem key={estudante.id} value={estudante.id}>
                                                <div className="flex items-center gap-2">
                                                  <User className="w-4 h-4" />
                                                  {estudante.profiles.nome}
                                                  <Badge variant="outline" className="text-xs">
                                                    {estudante.genero}
                                                  </Badge>
                                                </div>
                                              </SelectItem>
                                            ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  {(parte.tipo_designacao === 'iniciando_conversas' || 
                                    parte.tipo_designacao === 'cultivando_interesse' || 
                                    parte.tipo_designacao === 'fazendo_discipulos') && (
                                    <div>
                                      <Label className="text-sm">Ajudante (Opcional)</Label>
                                      <div className="flex gap-2 mt-1">
                                        <Select
                                          value={ajudante?.id || ''}
                                          onValueChange={(value) => assignStudent(parte.id, designacao?.estudante_id || '', value || undefined)}
                                          disabled={!estudanteAssignado}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Selecionar ajudante" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="">Nenhum</SelectItem>
                                            {estudantes
                                              .filter(e => 
                                                canAssignGender(parte, e) && 
                                                e.id !== estudanteAssignado?.id
                                              )
                                              .map((estudante) => (
                                                <SelectItem key={estudante.id} value={estudante.id}>
                                                  <div className="flex items-center gap-2">
                                                    <UserPlus className="w-4 h-4" />
                                                    {estudante.profiles.nome}
                                                    <Badge variant="outline" className="text-xs">
                                                      {estudante.genero}
                                                    </Badge>
                                                  </div>
                                                </SelectItem>
                                              ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  )}

                                  {designacao && (
                                    <div className="pt-2 border-t">
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Designado para: {estudanteAssignado?.profiles.nome}
                                        {ajudante && ` (Ajudante: ${ajudante.profiles.nome})`}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
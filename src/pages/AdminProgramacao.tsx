import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Download, Eye, Calendar, Users, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
}

interface ProgramaMinisterial {
  id: string;
  arquivo_nome: string;
  arquivo_url: string;
  mes_ano: string;
  status: string;
  conteudo?: any;
  created_at: string;
  updated_at: string;
}

interface SemanaPrograma {
  id: string;
  programa_id: string;
  semana_numero: number;
  data_inicio: string;
  tema_semana: string;
  leitura_biblica?: string;
}

export default function AdminProgramacao() {
  const [storageFiles, setStorageFiles] = useState<StorageFile[]>([]);
  const [programas, setProgramas] = useState<ProgramaMinisterial[]>([]);
  const [semanas, setSemanas] = useState<SemanaPrograma[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<ProgramaMinisterial | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load files from Supabase Storage
      const { data: files, error: storageError } = await supabase.storage
        .from('portuguesmeet')
        .list('', {
          limit: 100,
          offset: 0,
        });

      if (storageError) throw storageError;
      
      // Filter only PDF files
      const pdfFiles = files?.filter(file => file.name.endsWith('.pdf')) || [];
      setStorageFiles(pdfFiles as StorageFile[]);

      // Load existing programs from database
      const { data: programsData, error: programsError } = await supabase
        .from('programas_ministeriais')
        .select('*')
        .order('created_at', { ascending: false });

      if (programsError) throw programsError;
      setProgramas((programsData || []) as ProgramaMinisterial[]);

      // Load semanas if there are programs
      if (programsData && programsData.length > 0) {
        const { data: semanasData, error: semanasError } = await supabase
          .from('semanas_programa')
          .select('*')
          .order('programa_id, semana_numero');

        if (!semanasError) {
          setSemanas(semanasData || []);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados. Verifique sua conexão.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = (fileName: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nwpuurgwnnuejqinkvrh.supabase.co';
    // Extract the base URL without protocol for storage path
    const baseUrl = supabaseUrl.replace('https://', '');
    return `https://${baseUrl}/storage/v1/object/public/portuguesmeet/${fileName}`;
  };

  const extractMesAno = (fileName: string): string => {
    const match = fileName.match(/mwb_T_(\d{6})\.pdf/);
    return match ? match[1] : '';
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

  const importFile = async (file: StorageFile) => {
    setIsProcessing(true);
    try {
      const mesAno = extractMesAno(file.name);
      const fileUrl = getFileUrl(file.name);

      // Check if already exists
      const existing = programas.find(p => p.arquivo_nome === file.name);
      if (existing) {
        toast({
          title: "Arquivo já importado",
          description: `O arquivo ${file.name} já foi importado anteriormente.`,
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('programas_ministeriais')
        .insert({
          arquivo_nome: file.name,
          arquivo_url: fileUrl,
          mes_ano: mesAno,
          status: 'pendente',
        })
        .select()
        .single();

      if (error) throw error;

      setProgramas(prev => [data as ProgramaMinisterial, ...prev]);
      toast({
        title: "Arquivo importado",
        description: `${file.name} foi importado com sucesso.`,
      });
    } catch (error) {
      console.error('Error importing file:', error);
      toast({
        title: "Erro na importação",
        description: "Erro ao importar o arquivo.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processProgram = async (programa: ProgramaMinisterial) => {
    setIsProcessing(true);
    try {
      // Simulate processing and create sample weeks
      const sampleWeeks = [
        {
          programa_id: programa.id,
          semana_numero: 1,
          data_inicio: '2025-01-06',
          tema_semana: 'Seja corajoso e forte',
          leitura_biblica: 'Josué 1-2',
        },
        {
          programa_id: programa.id,
          semana_numero: 2,
          data_inicio: '2025-01-13',
          tema_semana: 'Jeová está com você',
          leitura_biblica: 'Josué 3-4',
        },
        {
          programa_id: programa.id,
          semana_numero: 3,
          data_inicio: '2025-01-20',
          tema_semana: 'Lembre-se das obras de Jeová',
          leitura_biblica: 'Josué 5-6',
        },
        {
          programa_id: programa.id,
          semana_numero: 4,
          data_inicio: '2025-01-27',
          tema_semana: 'Obedeça às instruções de Jeová',
          leitura_biblica: 'Josué 7-8',
        },
      ];

      // Insert weeks
      const { data: semanasData, error: semanasError } = await supabase
        .from('semanas_programa')
        .insert(sampleWeeks)
        .select();

      if (semanasError) throw semanasError;

      // Update program status
      const { error: updateError } = await supabase
        .from('programas_ministeriais')
        .update({ status: 'processado' })
        .eq('id', programa.id);

      if (updateError) throw updateError;

      // Update local state
      setProgramas(prev => prev.map(p => 
        p.id === programa.id ? { ...p, status: 'processado' } : p
      ));
      setSemanas(prev => [...prev, ...semanasData]);

      toast({
        title: "Programa processado",
        description: `${programa.arquivo_nome} foi processado com sucesso.`,
      });
    } catch (error) {
      console.error('Error processing program:', error);
      toast({
        title: "Erro no processamento",
        description: "Erro ao processar o programa.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const publishProgram = async (programa: ProgramaMinisterial) => {
    try {
      const { error } = await supabase
        .from('programas_ministeriais')
        .update({ status: 'publicado' })
        .eq('id', programa.id);

      if (error) throw error;

      setProgramas(prev => prev.map(p => 
        p.id === programa.id ? { ...p, status: 'publicado' } : p
      ));

      toast({
        title: "Programa publicado",
        description: `${programa.arquivo_nome} foi publicado para as congregações.`,
      });
    } catch (error) {
      console.error('Error publishing program:', error);
      toast({
        title: "Erro na publicação",
        description: "Erro ao publicar o programa.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'processado':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Processado</Badge>;
      case 'publicado':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Publicado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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
          <h1 className="text-3xl font-bold">Programação Ministerial</h1>
          <p className="text-muted-foreground">
            Gerencie os arquivos PDF do JW.org e publique programações para as congregações
          </p>
        </div>
      </div>

      <Tabs defaultValue="storage" className="space-y-6">
        <TabsList>
          <TabsTrigger value="storage">Arquivos Storage</TabsTrigger>
          <TabsTrigger value="programas">Programas Importados</TabsTrigger>
          <TabsTrigger value="semanas">Semanas & Designações</TabsTrigger>
        </TabsList>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Arquivos PDF no Storage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {storageFiles.map((file) => {
                  const mesAno = extractMesAno(file.name);
                  const isImported = programas.some(p => p.arquivo_nome === file.name);
                  
                  return (
                    <div key={file.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-primary" />
                        <div>
                          <h3 className="font-medium">{file.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatMesAno(mesAno)} • {Math.round(file.metadata.size / 1024)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isImported && (
                          <Badge variant="default">Importado</Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(getFileUrl(file.name), '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Visualizar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => importFile(file)}
                          disabled={isImported || isProcessing}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          {isImported ? 'Importado' : 'Importar'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Programas Ministeriais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {programas.map((programa) => (
                  <div key={programa.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-primary" />
                      <div>
                        <h3 className="font-medium">{programa.arquivo_nome}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatMesAno(programa.mes_ano)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(programa.status)}
                      <div className="flex gap-2">
                        {programa.status === 'pendente' && (
                          <Button
                            size="sm"
                            onClick={() => processProgram(programa)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? 'Processando...' : 'Processar'}
                          </Button>
                        )}
                        {programa.status === 'processado' && (
                          <Button
                            size="sm"
                            onClick={() => publishProgram(programa)}
                          >
                            <Users className="w-4 h-4 mr-1" />
                            Publicar
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(programa.arquivo_url, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="semanas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Semanas e Partes do Programa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {programas
                  .filter(p => p.status !== 'pendente')
                  .map((programa) => {
                    const programSemanas = semanas.filter(s => s.programa_id === programa.id);
                    
                    return (
                      <div key={programa.id} className="border rounded-lg p-4">
                        <h3 className="font-medium mb-3">
                          {formatMesAno(programa.mes_ano)} - {programa.arquivo_nome}
                        </h3>
                        <div className="grid gap-3">
                          {programSemanas.map((semana) => (
                            <div key={semana.id} className="p-3 bg-muted rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">Semana {semana.semana_numero}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {semana.tema_semana}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Leitura: {semana.leitura_biblica}
                                  </p>
                                </div>
                                <Badge variant="outline">
                                  {new Date(semana.data_inicio).toLocaleDateString('pt-BR')}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
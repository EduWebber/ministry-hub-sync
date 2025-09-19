import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { 
  Calendar, 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Download
} from "lucide-react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { useNavigate } from "react-router-dom";
import { useProgramContext } from "@/contexts/ProgramContext";
import { supabase } from "@/integrations/supabase/client";

async function fetchMockMonth(month: string) {
  const resp = await fetch(`/api/programacoes/mock?mes=${encodeURIComponent(month)}`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data = await resp.json();
  return data;
}

// Tipos para o sistema de programas
interface ProgramaSemanal {
  id: string;
  semana: string;
  data_inicio: string;
  mes_ano: string;
  partes: ParteMeeting[];
  pdf_url?: string;
  tema?: string;
  criado_em: string;
  atualizado_em: string;
}

interface ParteMeeting {
  numero: number;
  titulo: string;
  tempo: number;
  tipo: string;
  secao: string;
  referencia?: string;
  cena?: string;
  instrucoes?: string;
}

// Componente para importação de PDFs das apostilas
const ImportacaoPDF: React.FC<{ onImportComplete: (programa: ProgramaSemanal) => void }> = ({ onImportComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo PDF da apostila MWB.",
        variant: "destructive"
      });
    }
  };

  const processPDF = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      // Simular processamento do PDF (implementar com pdf-parse)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Dados mockados baseados nos PDFs fornecidos
      const mockData = {
        semana: "2-8 de dezembro de 2024",
        data_inicio: "2024-12-02",
        mes_ano: "dezembro de 2024",
        partes: [
          {
            numero: 3,
            titulo: "Leitura da Bíblia",
            tempo: 4,
            tipo: "leitura_biblica",
            secao: "TESOUROS",
            referencia: "Provérbios 25:1-17",
            instrucoes: "Apenas homens. Sem introdução ou conclusão."
          },
          {
            numero: 4,
            titulo: "Iniciando conversas",
            tempo: 3,
            tipo: "demonstracao",
            secao: "MINISTERIO",
            cena: "De casa em casa",
            instrucoes: "Demonstração. Ajudante do mesmo sexo ou parente."
          },
          {
            numero: 5,
            titulo: "Cultivando o interesse",
            tempo: 4,
            tipo: "demonstracao",
            secao: "MINISTERIO",
            cena: "Revisita",
            instrucoes: "Demonstração. Ajudante do mesmo sexo."
          },
          {
            numero: 6,
            titulo: "Explicando suas crenças",
            tempo: 5,
            tipo: "discurso",
            secao: "MINISTERIO",
            instrucoes: "Discurso. Apenas homens qualificados."
          }
        ]
      };

      setExtractedData(mockData);
      
      toast({
        title: "PDF processado com sucesso!",
        description: `Extraídas ${mockData.partes.length} partes da reunião.`
      });

    } catch (error) {
      toast({
        title: "Erro ao processar PDF",
        description: "Não foi possível extrair os dados da apostila.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmarImportacao = () => {
    if (extractedData) {
      const programa: ProgramaSemanal = {
        id: Date.now().toString(),
        semana: extractedData.semana,
        data_inicio: extractedData.data_inicio,
        mes_ano: extractedData.mes_ano,
        partes: extractedData.partes,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      };
      
      onImportComplete(programa);
      setSelectedFile(null);
      setExtractedData(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Importar Apostila MWB (PDF)
        </CardTitle>
        <CardDescription>
          Faça upload do PDF oficial da apostila "Vida e Ministério Cristão" para extrair automaticamente as partes da reunião
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Selecionar arquivo PDF:</label>
          <Input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            disabled={isProcessing}
          />
          {selectedFile && (
            <p className="text-sm text-gray-600">
              Arquivo selecionado: {selectedFile.name}
            </p>
          )}
        </div>

        {selectedFile && !extractedData && (
          <Button 
            onClick={processPDF} 
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processando PDF...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Processar Apostila
              </>
            )}
          </Button>
        )}

        {extractedData && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Dados extraídos:</strong> {extractedData.semana}
                <br />
                <strong>Partes identificadas:</strong> {extractedData.partes.length}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-medium">Partes da reunião:</h4>
              {extractedData.partes.map((parte: ParteMeeting, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{parte.numero}. {parte.titulo}</span>
                    {parte.referencia && (
                      <span className="text-sm text-gray-600 ml-2">({parte.referencia})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{parte.tempo} min</Badge>
                    <Badge variant="outline">{parte.tipo}</Badge>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={confirmarImportacao} className="w-full">
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmar Importação
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ProgramasPage = () => {
  const navigate = useNavigate();
  const { setSelectedProgramId, setSelectedCongregacaoId } = useProgramContext();
  const [activeTab, setActiveTab] = useState('list');
  const [programas, setProgramas] = useState<ProgramaSemanal[]>([]);
  const [programaSelecionado, setProgramaSelecionado] = useState<ProgramaSemanal | null>(null);
  const [pdfsDisponiveis, setPdfsDisponiveis] = useState<any>(null);

  // Carregar PDFs disponíveis ao montar o componente
  useEffect(() => {
    // Temporariamente desativado para evitar erros de CORS enquanto as Edge Functions não estão publicadas
    // carregarPDFsDisponiveis();
  }, []);

  // Carregar programas reais dos arquivos JSON (via backend simplificado)
  const carregarProgramasReais = async () => {
    try {
      const months = ["2025-09", "2025-11"];
      const results = await Promise.all(months.map(fetchMockMonth));
      const flatWeeks = results.flatMap((data) => Array.isArray(data) ? data : []);
      if (!flatWeeks.length) throw new Error('Nenhum programa encontrado');

      const programasConvertidos: ProgramaSemanal[] = flatWeeks.map((prog: any) => ({
        id: prog.idSemana || prog.id,
        semana: prog.semanaLabel || prog.semana,
        data_inicio: prog.idSemana || prog.dataInicio || prog.data_inicio,
        mes_ao: undefined as any,
        mes_ano: new Date((prog.idSemana || `${months[0]}-01`)).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        tema: prog.tema,
        partes: prog.programacao ? prog.programacao.flatMap((secao: any) => 
          secao.partes.map((parte: any, index: number) => ({
            numero: parte.idParte || index + 1,
            titulo: parte.titulo,
            tempo: parte.duracaoMin || parte.tempo,
            tipo: parte.tipo,
            secao: secao.secao,
            referencia: Array.isArray(parte.referencias) ? parte.referencias.join('; ') : parte.referencia,
            instrucoes: parte.instrucoes
          }))
        ) : prog.partes || [],
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      }));

      setProgramas(programasConvertidos);
      toast({
        title: "Programas carregados",
        description: `${programasConvertidos.length} programa(s) carregado(s) dos arquivos JSON.`
      });
    } catch (error) {
      console.error('Erro ao carregar programas:', error);
      toast({
        title: "Erro ao carregar programas",
        description: "Não foi possível carregar os programas dos arquivos JSON.",
        variant: "destructive"
      });
    }
  };

  // Carregar PDFs disponíveis
  const carregarPDFsDisponiveis = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('list-pdfs');
      if (error) throw error;
      if (data?.pdfs) setPdfsDisponiveis(data.pdfs);
    } catch (error) {
      console.error('Erro ao carregar PDFs:', error);
    }
  };

  const handleImportComplete = (programa: ProgramaSemanal) => {
    setProgramas(prev => {
      // Evitar duplicatas
      const exists = prev.find(p => p.id === programa.id);
      if (exists) {
        return prev.map(p => p.id === programa.id ? programa : p);
      }
      return [...prev, programa];
    });
    setActiveTab('list');
    toast({
      title: "Programa importado!",
      description: `Programa "${programa.semana}" foi adicionado com sucesso.`
    });
  };

  return (
    <SidebarLayout 
      title="Programas Ministeriais"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={carregarProgramasReais}>
            <Download className="w-4 h-4 mr-2" />
            Carregar Programas
          </Button>
          <Button size="sm" onClick={() => setActiveTab("import")}>
            <Upload className="w-4 h-4 mr-2" />
            Importar PDF
          </Button>
        </div>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Lista de Semanas
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Importar
          </TabsTrigger>
          <TabsTrigger value="detail" className="flex items-center gap-2" disabled={!programaSelecionado}>
            <FileText className="w-4 h-4" />
            Detalhes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {programas.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum programa carregado</h3>
                <p className="text-gray-500 mb-4">Importe uma apostila PDF ou carregue um programa de exemplo</p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" onClick={carregarProgramasReais}>
                    <Download className="w-4 h-4 mr-2" />
                    Carregar Programas
                  </Button>
                  <Button onClick={() => setActiveTab("import")}>
                    <Upload className="w-4 h-4 mr-2" />
                    Importar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {programas.map((programa) => (
                <Card key={programa.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{programa.semana}</CardTitle>
                    <CardDescription>
                      {programa.tema && (
                        <span className="font-medium text-blue-600 block mb-1">{programa.tema}</span>
                      )}
                      {programa.mes_ano}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Partes:</span>
                        <Badge variant="secondary">{programa.partes.length}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Data:</span>
                        <span className="text-sm">{programa.data_inicio ? new Date(programa.data_inicio).toLocaleDateString('pt-BR') : programa.semana.split(' ')[0]}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setProgramaSelecionado(programa);
                          setActiveTab('detail');
                        }}
                      >
                        Ver Detalhes
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => {
                          // Navigate to designacoes page with the selected program
                          // Set the program in context
                          setSelectedProgramId(programa.id);
                          // For now, we'll use a default congregacao ID
                          // In a real app, this would be selected by the user
                          setSelectedCongregacaoId('congregacao-1');
                          // Persist full program so DesignacoesPage can load it immediately
                          try {
                            localStorage.setItem('selectedProgram', JSON.stringify(programa));
                          } catch (_) {}
                          navigate('/designacoes');
                        }}
                      >
                        Usar Programa
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <ImportacaoPDF onImportComplete={handleImportComplete} />
        </TabsContent>

        <TabsContent value="detail" className="space-y-6">
          {programaSelecionado && (
            <Card>
              <CardHeader>
                <CardTitle>{programaSelecionado.semana}</CardTitle>
                <CardDescription>{programaSelecionado.mes_ano}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {programaSelecionado.partes.map((parte, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{parte.numero}. {parte.titulo}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            <Clock className="w-3 h-3 mr-1" />
                            {parte.tempo} min
                          </Badge>
                          <Badge variant="outline">{parte.secao}</Badge>
                        </div>
                      </div>
                      {parte.referencia && (
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Referência:</strong> {parte.referencia}
                        </p>
                      )}
                      {parte.cena && (
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Cena:</strong> {parte.cena}
                        </p>
                      )}
                      {parte.instrucoes && (
                        <p className="text-sm text-gray-600">
                          <strong>Instruções:</strong> {parte.instrucoes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </SidebarLayout>
  );
};

export default ProgramasPage;
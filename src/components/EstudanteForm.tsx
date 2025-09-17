import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Save, X, User, Users, Phone, Mail, Calendar, Settings } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  EstudanteWithParent,
  Cargo,
  Genero,
  CARGO_LABELS,
  getQualificacoes,
  EstudanteFormData,
} from "@/types/estudantes";

interface EstudanteFormProps {
  estudante?: EstudanteWithParent;
  potentialParents: EstudanteWithParent[];
  onSubmit: (data: any) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

const EstudanteForm = ({ estudante, potentialParents, onSubmit, onCancel, loading = false }: EstudanteFormProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<EstudanteFormData>({
    nome: "",
    data_nascimento: "",
    genero: "masculino",
    email: "",
    telefone: "",
    cargo: "publicador_batizado",
    ativo: true,
    observacoes: "",
    familia: "",
    estado_civil: "desconhecido",
    papel_familiar: "",
    id_pai: "",
    id_mae: "",
    id_conjuge: "",
    coabitacao: false,
    menor: false,
    responsavel_primario: "",
    responsavel_secundario: "",
    chairman: false,
    pray: false,
    treasures: false,
    gems: false,
    reading: false,
    starting: false,
    following: false,
    making: false,
    explaining: false,
    talk: false,
    idade: 18,
    data_batismo: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [qualificacoes, setQualificacoes] = useState<string[]>([]);

  // Initialize form with existing student data
  useEffect(() => {
    if (estudante) {
      setFormData({
        nome: (estudante as any).nome || "",
        data_nascimento: (estudante as any).data_nascimento || "",
        genero: (estudante as any).genero || "masculino",
        email: (estudante as any).email || "",
        telefone: (estudante as any).telefone || "",
        cargo: (estudante as any).cargo || "publicador_batizado",
        ativo: (estudante as any).ativo ?? true,
        observacoes: (estudante as any).observacoes || "",
        familia: (estudante as any).familia || "",
        estado_civil: (estudante as any).estado_civil || "desconhecido",
        papel_familiar: (estudante as any).papel_familiar || "",
        id_pai: (estudante as any).id_pai || "",
        id_mae: (estudante as any).id_mae || "",
        id_conjuge: (estudante as any).id_conjuge || "",
        coabitacao: (estudante as any).coabitacao ?? false,
        menor: (estudante as any).menor ?? false,
        responsavel_primario: (estudante as any).responsavel_primario || "",
        responsavel_secundario: (estudante as any).responsavel_secundario || "",
        chairman: (estudante as any).chairman ?? false,
        pray: (estudante as any).pray ?? false,
        treasures: (estudante as any).treasures ?? false,
        gems: (estudante as any).gems ?? false,
        reading: (estudante as any).reading ?? false,
        starting: (estudante as any).starting ?? false,
        following: (estudante as any).following ?? false,
        making: (estudante as any).making ?? false,
        explaining: (estudante as any).explaining ?? false,
        talk: (estudante as any).talk ?? false,
        idade: (estudante as any).idade || 18,
        data_batismo: (estudante as any).data_batismo || "",
      });
    }
  }, [estudante]);

  // Calculate age from birth date
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 18;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Update qualifications when cargo, genero, or data_nascimento changes
  useEffect(() => {
    const idade = calculateAge(formData.data_nascimento);
    const newQualificacoes = getQualificacoes(formData.cargo, formData.genero, idade);
    setQualificacoes(newQualificacoes);
  }, [formData.cargo, formData.genero, formData.data_nascimento]);

  const handleInputChange = (field: string, value: string | number | boolean | Date | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const validationErrors: Record<string, string> = {};
    if (!formData.nome.trim()) {
      validationErrors.nome = 'Nome é obrigatório';
    }
    if (!formData.genero) {
      validationErrors.genero = 'Gênero é obrigatório';
    }
    
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Submit form
    const success = await onSubmit(formData);
    if (success) {
      // Reset form if creating new student
      if (!estudante) {
        setFormData({
          nome: "",
          data_nascimento: "",
          genero: "masculino",
          email: "",
          telefone: "",
          cargo: "publicador_batizado",
          ativo: true,
          observacoes: "",
          familia: "",
          estado_civil: "desconhecido",
          papel_familiar: "",
          id_pai: "",
          id_mae: "",
          id_conjuge: "",
          coabitacao: false,
          menor: false,
          responsavel_primario: "",
          responsavel_secundario: "",
          chairman: false,
          pray: false,
          treasures: false,
          gems: false,
          reading: false,
          starting: false,
          following: false,
          making: false,
          explaining: false,
          talk: false,
          idade: 18,
          data_batismo: "",
        });
      }
    }
  };

  const isEditing = !!estudante;
  const idade = calculateAge(formData.data_nascimento);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="w-5 h-5" />
          {isEditing ? `${t('common.edit')} ${t('navigation.students')}` : t('students.newStudent')}
        </CardTitle>
        <CardDescription>
          {t('students.subtitle')}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Informações Básicas</h3>
            </div>
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">{t('auth.fullName')} *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  placeholder={t('auth.fullNamePlaceholder')}
                  className={errors.nome ? "border-red-500" : ""}
                />
                {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="familia">Família</Label>
                <Input
                  id="familia"
                  value={formData.familia || ""}
                  onChange={(e) => handleInputChange("familia", e.target.value)}
                  placeholder="Nome da família"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="idade">{t('common.age')} *</Label>
                <Input
                  id="idade"
                  type="number"
                  min="1"
                  max="120"
                  value={formData.idade}
                  onChange={(e) => handleInputChange("idade", parseInt(e.target.value) || 0)}
                  className={errors.idade ? "border-red-500" : ""}
                />
                {errors.idade && <p className="text-sm text-red-500">{errors.idade}</p>}
              </div>
            </div>
          </div>

          {/* Gender and Role Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">Gênero e Cargo</h3>
            </div>
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="genero">{t('common.gender')} *</Label>
                <Select value={formData.genero} onValueChange={(value: Genero) => handleInputChange("genero", value)}>
                  <SelectTrigger className={errors.genero ? "border-red-500" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">{t('students.genders.male')}</SelectItem>
                    <SelectItem value="feminino">{t('students.genders.female')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.genero && <p className="text-sm text-red-500">{errors.genero}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo">{t('common.role')} *</Label>
                <Select value={formData.cargo} onValueChange={(value: Cargo) => handleInputChange("cargo", value)}>
                  <SelectTrigger className={errors.cargo ? "border-red-500" : ""}>
                    <SelectValue placeholder={t('auth.selectRole')} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CARGO_LABELS).map(([value]) => (
                      <SelectItem key={value} value={value as Cargo}>
                        {t(`terms.${value}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.cargo && <p className="text-sm text-red-500">{errors.cargo}</p>}
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Informações de Contato</h3>
            </div>
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('common.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder={t('initialSetup.fields.emailPlaceholder')}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">{t('common.phone')}</Label>
                <Input
                  id="telefone"
                  value={formData.telefone || ""}
                  onChange={(e) => handleInputChange("telefone", e.target.value)}
                  placeholder={t('(11) 99999-9999')}
                  className={errors.telefone ? "border-red-500" : ""}
                />
                {errors.telefone && <p className="text-sm text-red-500">{errors.telefone}</p>}
              </div>
            </div>
          </div>

          {/* Dates and Status Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold">Datas e Status</h3>
            </div>
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Birth Date */}
              <div className="space-y-2">
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <div className="relative">
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={formData.data_nascimento || ""}
                    onChange={(e) => handleInputChange("data_nascimento", e.target.value)}
                    className="pl-10"
                  />
                  <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Baptism Date */}
              <div className="space-y-2">
                <Label htmlFor="data_batismo">{t('students.baptizedOn')}</Label>
                <div className="relative">
                  <Input
                    id="data_batismo"
                    type="date"
                    value={formData.data_batismo || ""}
                    onChange={(e) => handleInputChange("data_batismo", e.target.value)}
                    className="pl-10"
                  />
                  <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Marital Status */}
              <div className="space-y-2">
                <Label htmlFor="estado_civil">Estado Civil</Label>
                <Select
                  value={formData.estado_civil || "desconhecido"}
                  onValueChange={(value) => handleInputChange("estado_civil", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desconhecido">Desconhecido</SelectItem>
                    <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                    <SelectItem value="casado">Casado(a)</SelectItem>
                    <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                    <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Status */}
              <div className="space-y-2">
                <Label htmlFor="ativo" className="block mb-2">Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => handleInputChange("ativo", checked)}
                  />
                  <Label htmlFor="ativo">{formData.ativo ? "Ativo" : "Inativo"}</Label>
                </div>
              </div>

              {/* Family Role */}
              <div className="space-y-2">
                <Label htmlFor="papel_familiar">Papel na Família</Label>
                <Select
                  value={formData.papel_familiar || ""}
                  onValueChange={(value) => handleInputChange("papel_familiar", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um papel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    <SelectItem value="pai">Pai</SelectItem>
                    <SelectItem value="mae">Mãe</SelectItem>
                    <SelectItem value="filho">Filho(a)</SelectItem>
                    <SelectItem value="conjuge">Cônjuge</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cohabitation */}
              <div className="space-y-2">
                <Label htmlFor="coabitacao" className="block mb-2">Coabitação</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="coabitacao"
                    checked={formData.coabitacao || false}
                    onCheckedChange={(checked) => handleInputChange("coabitacao", checked)}
                  />
                  <Label htmlFor="coabitacao">{formData.coabitacao ? "Sim" : "Não"}</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Family Relationships Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-pink-600" />
              <h3 className="text-lg font-semibold">Relacionamentos Familiares</h3>
            </div>
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Father */}
              <div className="space-y-2">
                <Label htmlFor="id_pai">Pai</Label>
                <Select
                  value={formData.id_pai || ""}
                  onValueChange={(value) => handleInputChange("id_pai", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o pai" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {potentialParents
                      .filter(parent => parent.genero === "masculino" && (!estudante || parent.id !== estudante.id))
                      .map(parent => (
                        <SelectItem key={parent.id} value={parent.id}>
                          {(parent as any).nome || `Pai ${parent.id.substring(0, 8)}`}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>

              {/* Mother */}
              <div className="space-y-2">
                <Label htmlFor="id_mae">Mãe</Label>
                <Select
                  value={formData.id_mae || ""}
                  onValueChange={(value) => handleInputChange("id_mae", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a mãe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {potentialParents
                      .filter(parent => parent.genero === "feminino" && (!estudante || parent.id !== estudante.id))
                      .map(parent => (
                        <SelectItem key={parent.id} value={parent.id}>
                          {(parent as any).nome || `Mãe ${parent.id.substring(0, 8)}`}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>

              {/* Spouse */}
              <div className="space-y-2">
                <Label htmlFor="id_conjuge">Cônjuge</Label>
                <Select
                  value={formData.id_conjuge || ""}
                  onValueChange={(value) => handleInputChange("id_conjuge", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cônjuge" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {potentialParents
                      .filter(parent => (!estudante || parent.id !== estudante.id))
                      .map(parent => (
                        <SelectItem key={parent.id} value={parent.id}>
                          {(parent as any).nome || `Cônjuge ${parent.id.substring(0, 8)}`}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>

              {/* Minor Status */}
              <div className="space-y-2">
                <Label htmlFor="menor" className="block mb-2">Menor de Idade</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="menor"
                    checked={formData.menor || false}
                    onCheckedChange={(checked) => handleInputChange("menor", checked)}
                  />
                  <Label htmlFor="menor">{formData.menor ? "Sim" : "Não"}</Label>
                </div>
              </div>

              {/* Primary Guardian */}
              {formData.menor && (
                <div className="space-y-2">
                  <Label htmlFor="responsavel_primario">Responsável Primário</Label>
                  <Select
                    value={formData.responsavel_primario || ""}
                    onValueChange={(value) => handleInputChange("responsavel_primario", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {potentialParents
                        .filter(parent => (!estudante || parent.id !== estudante.id))
                        .map(parent => (
                          <SelectItem key={parent.id} value={parent.id}>
                            {(parent as any).nome || `Responsável ${parent.id.substring(0, 8)}`}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Secondary Guardian */}
              {formData.menor && (
                <div className="space-y-2">
                  <Label htmlFor="responsavel_secundario">Responsável Secundário</Label>
                  <Select
                    value={formData.responsavel_secundario || ""}
                    onValueChange={(value) => handleInputChange("responsavel_secundario", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {potentialParents
                        .filter(parent => (!estudante || parent.id !== estudante.id) && parent.id !== formData.responsavel_primario)
                        .map(parent => (
                          <SelectItem key={parent.id} value={parent.id}>
                            {(parent as any).nome || `Responsável ${parent.id.substring(0, 8)}`}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Qualifications Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500 hover:bg-blue-600" />
              <h3 className="text-lg font-semibold">Qualificações</h3>
            </div>
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="chairman"
                  checked={formData.chairman || false}
                  onCheckedChange={(checked) => handleInputChange("chairman", checked)}
                />
                <Label htmlFor="chairman">Apto a Presidir</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="pray"
                  checked={formData.pray || false}
                  onCheckedChange={(checked) => handleInputChange("pray", checked)}
                />
                <Label htmlFor="pray">Apto a Orar</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="treasures"
                  checked={formData.treasures || false}
                  onCheckedChange={(checked) => handleInputChange("treasures", checked)}
                />
                <Label htmlFor="treasures">Apto a "Tesouros"</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="gems"
                  checked={formData.gems || false}
                  onCheckedChange={(checked) => handleInputChange("gems", checked)}
                />
                <Label htmlFor="gems">Apto a "Joias"</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="reading"
                  checked={formData.reading || false}
                  onCheckedChange={(checked) => handleInputChange("reading", checked)}
                />
                <Label htmlFor="reading">Apto a Leitura</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="starting"
                  checked={formData.starting || false}
                  onCheckedChange={(checked) => handleInputChange("starting", checked)}
                />
                <Label htmlFor="starting">Apto a Iniciar Conversação</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="following"
                  checked={formData.following || false}
                  onCheckedChange={(checked) => handleInputChange("following", checked)}
                />
                <Label htmlFor="following">Apto a Fazer Revisita</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="making"
                  checked={formData.making || false}
                  onCheckedChange={(checked) => handleInputChange("making", checked)}
                />
                <Label htmlFor="making">Apto a Fazer Discípulos</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="explaining"
                  checked={formData.explaining || false}
                  onCheckedChange={(checked) => handleInputChange("explaining", checked)}
                />
                <Label htmlFor="explaining">Apto a Explicar Crenças</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="talk"
                  checked={formData.talk || false}
                  onCheckedChange={(checked) => handleInputChange("talk", checked)}
                />
                <Label htmlFor="talk">Apto ao Discurso</Label>
              </div>
            </div>
          </div>

          {/* Observations Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold">Observações</h3>
            </div>
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="observacoes">{t('students.observations')}</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes || ""}
                onChange={(e) => handleInputChange("observacoes", e.target.value)}
                placeholder={t('students.observations')}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_nascimento">{t('common.birthDate')}</Label>
              <Input
                id="data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => handleInputChange("data_nascimento", e.target.value)}
                className={errors.data_nascimento ? "border-red-500" : ""}
              />
              {errors.data_nascimento && <p className="text-sm text-red-500">{errors.data_nascimento}</p>}
              {formData.data_nascimento && (
                <p className="text-sm text-gray-500">
                  Idade: {idade} anos
                </p>
              )}
            </div>
          </div>

          {/* Gender and Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genero">{t('common.gender')} *</Label>
              <Select value={formData.genero} onValueChange={(value: Genero) => handleInputChange("genero", value)}>
                <SelectTrigger className={errors.genero ? "border-red-500" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">{t('students.genders.male')}</SelectItem>
                  <SelectItem value="feminino">{t('students.genders.female')}</SelectItem>
                </SelectContent>
              </Select>
              {errors.genero && <p className="text-sm text-red-500">{errors.genero}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo">{t('common.role')} *</Label>
              <Select value={formData.cargo} onValueChange={(value: Cargo) => handleInputChange("cargo", value)}>
                <SelectTrigger className={errors.cargo ? "border-red-500" : ""}>
                  <SelectValue placeholder={t('auth.selectRole')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CARGO_LABELS).map(([value]) => (
                    <SelectItem key={value} value={value as Cargo}>
                      {t(`terms.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.cargo && <p className="text-sm text-red-500">{errors.cargo}</p>}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('common.email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder={t('initialSetup.fields.emailPlaceholder')}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">{t('common.phone')}</Label>
              <Input
                id="telefone"
                value={formData.telefone || ""}
                onChange={(e) => handleInputChange("telefone", e.target.value)}
                placeholder={t('(11) 99999-9999')}
                className={errors.telefone ? "border-red-500" : ""}
              />
              {errors.telefone && <p className="text-sm text-red-500">{errors.telefone}</p>}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => handleInputChange("ativo", checked)}
            />
            <Label htmlFor="ativo">{t('common.active')}</Label>
          </div>

          {/* Qualifications Display */}
          <div className="space-y-2">
            <Label>{t('students.qualifications')}</Label>
            <div className="flex flex-wrap gap-2">
              {qualificacoes.map((qual) => (
                <Badge key={qual} variant="outline">
                  {qual}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              {t('forms.pleaseWait')}
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? t('common.saving') : t('common.save')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EstudanteForm;
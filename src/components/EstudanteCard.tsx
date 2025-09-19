import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, User, Phone, Mail, Calendar, Users } from "lucide-react";
import {
  EstudanteWithParent,
  isMinor,
  Cargo,
  Genero,
} from "@/types/estudantes";

interface EstudanteCardProps {
  estudante: EstudanteWithParent;
  onEdit: (estudante: EstudanteWithParent) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const EstudanteCard = ({ estudante, onEdit, onDelete, loading = false }: EstudanteCardProps) => {
  const { t } = useTranslation();
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Calculate age from data_nascimento if available
  const calculateAge = (birthDate: string | null): number | null => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };
  
  const idade = calculateAge(estudante.data_nascimento || null);
  const isMenor = idade ? idade < 18 : false;
  
  // Translation-aware helper functions
  const getCargoLabel = (cargo: Cargo): string => {
    const cargoMap: Record<Cargo, string> = {
      anciao: t('students.roles.elder'),
      servo_ministerial: t('students.roles.ministerialServant'),
      pioneiro_regular: t('students.roles.regularPioneer'),
      publicador_batizado: t('students.roles.publisher'),
      publicador_nao_batizado: t('students.roles.unbaptizedPublisher'),
      estudante_novo: t('students.roles.student'),
    };
    return cargoMap[cargo];
  };
  
  const getGeneroLabel = (genero: Genero): string => {
    const generoMap: Record<Genero, string> = {
      masculino: t('students.genders.male'),
      feminino: t('students.genders.female'),
    };
    return generoMap[genero];
  };
  
  const getQualificacoes = (cargo: Cargo, genero: Genero, idade: number): string[] => {
    const qualificacoes: string[] = [];
    
    // Leitura da Bíblia - todos podem fazer
    qualificacoes.push(t('terms.bibleReading'));
    
    // Primeira conversa e revisita - todos podem fazer
    qualificacoes.push(t('students.qualificationTypes.initialCall'), t('students.qualificationTypes.returnVisit'));
    
    // Estudo bíblico - apenas homens qualificados
    if (genero === "masculino" && ["anciao", "servo_ministerial", "publicador_batizado"].includes(cargo)) {
      qualificacoes.push(t('students.qualificationTypes.bibleStudy'));
    }
    
    // Discursos - apenas homens qualificados
    if (genero === "masculino" && ["anciao", "servo_ministerial", "publicador_batizado"].includes(cargo)) {
      qualificacoes.push(t('terms.talk'));
    }
    
    return qualificacoes;
  };
  
  const qualificacoes = getQualificacoes(estudante.cargo as Cargo, estudante.genero as Genero, idade || 18);

  const handleDelete = async () => {
    setDeleteLoading(true);
    await onDelete(estudante.id);
    setDeleteLoading(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('common.notInformed');
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-border/50 hover:border-jw-blue/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-4 h-4 text-jw-blue" />
              {estudante.nome}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-1">
              <span>{getCargoLabel(estudante.cargo as Cargo)}</span>
              <span>•</span>
              <span>{getGeneroLabel(estudante.genero as Genero)}</span>
              {idade && (
                <>
                  <span>•</span>
                  <span>{idade} {t('common.years')}</span>
                </>
              )}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-1">
            <Badge variant={estudante.ativo ? "default" : "secondary"}>
              {estudante.ativo ? t('common.active') : t('common.inactive')}
            </Badge>
            {isMenor && (
              <Badge variant="outline" className="text-xs">
                {t('students.minor')}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-2">
          {estudante.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span>{estudante.email}</span>
            </div>
          )}
          {estudante.telefone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{estudante.telefone}</span>
            </div>
          )}
          {estudante.data_nascimento && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{t('students.bornOn')} {formatDate(estudante.data_nascimento)}</span>
            </div>
          )}
        </div>

        {/* Family Information - Currently not available in this structure */}

        {/* Qualifications */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">{t('students.qualifications')}:</Label>
          <div className="flex flex-wrap gap-1">
            {qualificacoes.map((qual, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {qual}
              </Badge>
            ))}
          </div>
        </div>

        {/* Observations - Not available in current structure */}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(estudante)}
            disabled={loading}
          >
            <Edit className="w-4 h-4 mr-1" />
            {t('common.edit')}
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={loading || deleteLoading}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('students.confirmDelete')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('students.deleteConfirmation', { name: estudante.nome })}

                  <span className="block mt-2">
                    {t('students.actionCannotBeUndone')}
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteLoading ? t('students.deleting') : t('common.delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default EstudanteCard;

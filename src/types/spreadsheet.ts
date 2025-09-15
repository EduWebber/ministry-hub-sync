import { Cargo, Genero } from "./estudantes";

// Raw data from Excel spreadsheet
export interface SpreadsheetRow {
  "id"?: string;
  "user_id"?: string;
  "nome": string;
  "familia": string;
  "idade": number;
  "genero": string;
  "email"?: string;
  "telefone"?: string;
  "data_batismo"?: string;
  "cargo": string;
  "id_pai_mae"?: string;
  "ativo": string;
  "observacoes"?: string;
  "created_at"?: string;
  "updated_at"?: string;
  "estado_civil"?: string;
  "papel_familiar"?: string;
  "id_pai"?: string;
  "id_mae"?: string;
  "id_conjuge"?: string;
  "coabitacao"?: string;
  "menor"?: string;
  "responsavel_primario"?: string;
  "responsavel_secundario"?: string;
  "chairman"?: string;
  "pray"?: string;
  "tresures"?: string;
  "gems"?: string;
  "reading"?: string;
  "starting"?: string;
  "following"?: string;
  "making"?: string;
  "explaining"?: string;
  "talk"?: string;
  "data_nascimento"?: string;
}

// Processed data ready for database insertion
export interface ProcessedStudentData {
  id?: string;
  user_id?: string;
  nome: string;
  familia: string;
  idade: number;
  genero: Genero;
  email?: string;
  telefone?: string;
  data_batismo?: string;
  cargo: Cargo;
  id_pai_mae?: string;
  ativo: boolean;
  observacoes?: string;
  estado_civil?: string;
  papel_familiar?: string;
  id_pai?: string;
  id_mae?: string;
  id_conjuge?: string;
  coabitacao?: boolean;
  menor?: boolean;
  responsavel_primario?: string;
  responsavel_secundario?: string;
  chairman?: boolean;
  pray?: boolean;
  tresures?: boolean;
  gems?: boolean;
  reading?: boolean;
  starting?: boolean;
  following?: boolean;
  making?: boolean;
  explaining?: boolean;
  talk?: boolean;
  data_nascimento?: string;
}

// Validation result for each row
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data?: ProcessedStudentData;
  rowIndex: number;
}

// Import summary
export interface ImportSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  imported: number;
  errors: ValidationResult[];
  warnings: ValidationResult[];
}

// Mapping configurations
export const GENDER_MAPPING: Record<string, Genero> = {
  'M': 'masculino',
  'F': 'feminino',
  'Masculino': 'masculino',
  'Feminino': 'feminino',
  'masculino': 'masculino',
  'feminino': 'feminino'
};

export const CARGO_MAPPING: Record<string, Cargo> = {
  'Ancião': 'anciao',
  'Servo Ministerial': 'servo_ministerial',
  'Pioneiro Regular': 'pioneiro_regular',
  'Publicador Batizado': 'publicador_batizado',
  'Publicador Não Batizado': 'publicador_nao_batizado',
  'Estudante Novo': 'estudante_novo',
  'Visitante': 'estudante_novo', // Fallback
  'anciao': 'anciao',
  'servo_ministerial': 'servo_ministerial',
  'pioneiro_regular': 'pioneiro_regular',
  'publicador_batizado': 'publicador_batizado',
  'publicador_nao_batizado': 'publicador_nao_batizado',
  'estudante_novo': 'estudante_novo'
};

export const STATUS_MAPPING: Record<string, boolean> = {
  'Ativo': true,
  'Inativo': false,
  'ativo': true,
  'inativo': false,
  'true': true,
  'false': false,
  'VERDADEIRO': true,
  'FALSO': false,
  '1': true,
  '0': false
};

export const BOOLEAN_MAPPING: Record<string, boolean> = {
  'VERDADEIRO': true,
  'FALSO': false,
  'true': true,
  'false': false,
  '1': true,
  '0': false,
  'sim': true,
  'não': false,
  'yes': true,
  'no': false
};

// Template column definitions
export const TEMPLATE_COLUMNS = [
  'nome',
  'familia',
  'idade',
  'genero',
  'email',
  'telefone',
  'data_batismo',
  'cargo',
  'ativo',
  'observacoes',
  'data_nascimento',
  'chairman',
  'pray',
  'tresures',
  'gems',
  'reading',
  'starting',
  'following',
  'making',
  'explaining',
  'talk'
] as const;

// Sample data for template
export const TEMPLATE_SAMPLE_DATA: Partial<SpreadsheetRow>[] = [
  {
    "nome": "João Silva",
    "familia": "Silva",
    "idade": 25,
    "genero": "masculino",
    "email": "joao.silva@email.com",
    "telefone": "(11) 99999-9999",
    "data_batismo": "2020-06-20",
    "cargo": "publicador_batizado",
    "ativo": "VERDADEIRO",
    "observacoes": "Disponível para designações",
    "data_nascimento": "1999-03-15",
    "chairman": "FALSO",
    "pray": "VERDADEIRO",
    "tresures": "FALSO",
    "gems": "VERDADEIRO",
    "reading": "VERDADEIRO",
    "starting": "VERDADEIRO",
    "following": "VERDADEIRO",
    "making": "VERDADEIRO",
    "explaining": "VERDADEIRO",
    "talk": "VERDADEIRO"
  },
  {
    "nome": "Maria Santos",
    "familia": "Santos",
    "idade": 16,
    "genero": "feminino",
    "email": "maria.santos@email.com",
    "telefone": "(11) 88888-8888",
    "data_batismo": "",
    "cargo": "estudante_novo",
    "ativo": "VERDADEIRO",
    "observacoes": "Menor de idade",
    "data_nascimento": "2008-08-10",
    "chairman": "FALSO",
    "pray": "FALSO",
    "tresures": "FALSO",
    "gems": "FALSO",
    "reading": "VERDADEIRO",
    "starting": "VERDADEIRO",
    "following": "VERDADEIRO",
    "making": "VERDADEIRO",
    "explaining": "VERDADEIRO",
    "talk": "FALSO"
  }
];

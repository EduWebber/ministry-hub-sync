import { Cargo, Genero } from "./estudantes";

// Raw data from Excel spreadsheet - flexible interface
export interface SpreadsheetRow {
  [key: string]: any;
  // Common field variations
  "ID Estudante"?: string | number;
  "Nome Completo"?: string;
  "nome"?: string;
  "Idade"?: number;
  "idade"?: number;
  "Gênero (M/F)"?: string;
  "genero"?: string;
  "Data de Nascimento"?: string;
  "data_nascimento"?: string;
  "Parente Responsável"?: string;
  "parente_responsavel"?: string;
  "Parentesco"?: string;
  "parentesco"?: string;
  "Família / Agrupamento"?: string;
  "familia"?: string;
  "Data de Batismo"?: string;
  "data_batismo"?: string;
  "Cargo Congregacional"?: string;
  "cargo"?: string;
  "Telefone"?: string;
  "telefone"?: string;
  "E-mail"?: string;
  "email"?: string;
  "Observações"?: string;
  "observacoes"?: string;
  "Status (Ativo/Inativo)"?: string;
  "ativo"?: string | boolean;
}

// Processed data ready for database insertion
export interface ProcessedStudentData {
  id?: string;
  user_id?: string;
  family_id?: string;
  nome: string;
  familia: string;
  idade: number;
  genero: Genero;
  email?: string;
  telefone?: string;
  data_batismo?: string;
  cargo?: Cargo;
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
  treasures?: boolean;
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
  'VERDADEIRO': true,
  'FALSO': false,
  'true': true,
  'false': false,
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
  'family_id',
  'user_id',
  'nome',
  'familia',
  'idade',
  'genero',
  'estado_civil',
  'papel_familiar',
  'id_pai',
  'id_mae',
  'id_conjuge',
  'coabitacao',
  'menor',
  'responsavel_primario',
  'responsavel_secundario',
  'chairman',
  'pray',
  'treasures',
  'gems',
  'reading',
  'starting',
  'following',
  'making',
  'explaining',
  'talk',
  'data_nascimento'
] as const;

// Sample data for template
export const TEMPLATE_SAMPLE_DATA: Partial<SpreadsheetRow>[] = [
  {
    "family_id": "78814c76-75b0-42ae-bb7c-9a8f0a3e5919",
    "user_id": "",
    "nome": "Eduardo Almeida",
    "familia": "Almeida",
    "idade": 45,
    "genero": "masculino",
    "estado_civil": "casado",
    "papel_familiar": "pai",
    "id_pai": "",
    "id_mae": "",
    "id_conjuge": "",
    "coabitacao": true,
    "menor": false,
    "responsavel_primario": "",
    "responsavel_secundario": "",
    "chairman": true,
    "pray": true,
    "treasures": false,
    "gems": true,
    "reading": true,
    "starting": true,
    "following": true,
    "making": true,
    "explaining": true,
    "talk": true,
    "data_nascimento": "1980-08-22 00:00:00"
  },
  {
    "family_id": "78814c76-75b0-42ae-bb7c-9a8f0a3e5919",
    "user_id": "",
    "nome": "Thiago Almeida",
    "familia": "Almeida",
    "idade": 13,
    "genero": "masculino",
    "estado_civil": "solteiro",
    "papel_familiar": "filho",
    "id_pai": "3f9fb7cc-4efe-43b6-82b6-063f5c59ce74",
    "id_mae": "6c705a63-00b8-4cfb-867d-588dfc1aa850",
    "id_conjuge": "",
    "coabitacao": true,
    "menor": true,
    "responsavel_primario": "3f9fb7cc-4efe-43b6-82b6-063f5c59ce74",
    "responsavel_secundario": "6c705a63-00b8-4cfb-867d-588dfc1aa850",
    "chairman": false,
    "pray": false,
    "treasures": false,
    "gems": false,
    "reading": true,
    "starting": true,
    "following": true,
    "making": true,
    "explaining": true,
    "talk": false,
    "data_nascimento": "2012-08-18 00:00:00"
  }
];
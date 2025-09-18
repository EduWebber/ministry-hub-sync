/**
 * Enhanced Import System Types
 * Integrates all formats from docs/Oficial documentation
 */

// ============================================================================
// COMPREHENSIVE COLUMN MAPPING SYSTEM
// ============================================================================

export interface ColumnMapping {
  // Core identity fields
  id?: string;
  family_id?: string;
  user_id?: string;
  
  // Basic personal information
  nome: string[];           // ['nome', 'Nome Completo', 'name']
  familia: string[];        // ['familia', 'Família / Agrupamento', 'family']
  idade: string[];          // ['idade', 'Idade', 'age']
  genero: string[];         // ['genero', 'Gênero (M/F)', 'gender']
  
  // Contact and dates
  email: string[];          // ['email', 'E-mail', 'e-mail']
  telefone: string[];       // ['telefone', 'Telefone', 'phone']
  data_nascimento: string[]; // ['data_nascimento', 'Data de Nascimento', 'birth_date']
  data_batismo: string[];   // ['data_batismo', 'Data de Batismo', 'baptism_date']
  data_de_matricula: string[]; // ['data_de_matricula', 'Data de Matrícula', 'enrollment_date']
  
  // Organizational information
  cargo: string[];          // ['cargo', 'Cargo Congregacional', 'position']
  tempo: string[];          // ['tempo', 'Tempo de Serviço', 'service_time']
  ativo: string[];          // ['ativo', 'Status (Ativo/Inativo)', 'active']
  observacoes: string[];    // ['observacoes', 'Observações', 'notes']
  
  // Family relationships
  estado_civil: string[];   // ['estado_civil', 'Estado Civil', 'marital_status']
  papel_familiar: string[]; // ['papel_familiar', 'Papel Familiar', 'family_role']
  id_pai: string[];         // ['id_pai', 'ID Pai', 'father_id']
  id_mae: string[];         // ['id_mae', 'ID Mãe', 'mother_id']
  id_conjuge: string[];     // ['id_conjuge', 'ID Cônjuge', 'spouse_id']
  coabitacao: string[];     // ['coabitacao', 'Coabitação', 'cohabitation']
  menor: string[];          // ['menor', 'Menor de Idade', 'minor']
  responsavel_primario: string[]; // ['responsavel_primario', 'Parente Responsável', 'primary_guardian']
  responsavel_secundario: string[]; // ['responsavel_secundario', 'Responsável Secundário', 'secondary_guardian']
  parentesco: string[];     // ['parentesco', 'Parentesco', 'relationship']
  
  // S-38-T Qualifications (Ministry School Parts)
  chairman: string[];       // ['chairman', 'Presidente', 'chairperson']
  pray: string[];          // ['pray', 'Oração', 'prayer']
  tresures: string[];      // ['tresures', 'treasures', 'Tesouros da Palavra']
  gems: string[];          // ['gems', 'Joias Espirituais', 'spiritual_gems']
  reading: string[];       // ['reading', 'Leitura da Bíblia', 'bible_reading']
  starting: string[];      // ['starting', 'Primeira Conversa', 'initial_call']
  following: string[];     // ['following', 'Revisita', 'return_visit']
  making: string[];        // ['making', 'Estudo Bíblico', 'bible_study']
  explaining: string[];    // ['explaining', 'Explicando as Escrituras', 'explaining_scriptures']
  talk: string[];          // ['talk', 'Discurso', 'student_talk']
  
  // Timestamps
  created_at: string[];    // ['created_at', 'Data de Criação', 'creation_date']
  updated_at: string[];    // ['updated_at', 'Data de Atualização', 'update_date']
}

// ============================================================================
// SMART VALIDATION SYSTEM
// ============================================================================

export interface ValidationRule {
  field: string;
  type: 'required' | 'format' | 'range' | 'dependency' | 'business';
  message: string;
  validator: (value: any, row: any) => boolean;
  severity: 'error' | 'warning' | 'info';
}

export interface SmartValidationResult {
  isValid: boolean;
  severity: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  suggestedFix?: any;
  autoFixable: boolean;
}

// ============================================================================
// ADVANCED FAMILY DETECTION
// ============================================================================

export interface FamilyRelationship {
  type: 'spouse' | 'parent-child' | 'sibling' | 'guardian-ward';
  primaryId: string;
  secondaryId: string;
  confidence: number; // 0-1 confidence score
  evidence: string[]; // Reasons for the relationship detection
}

export interface FamilyAnalysis {
  families: Family[];
  relationships: FamilyRelationship[];
  orphans: string[]; // IDs with no detected family
  suggestions: FamilySuggestion[];
}

export interface Family {
  id: string;
  surname: string;
  members: FamilyMember[];
  structure: 'nuclear' | 'single-parent' | 'extended' | 'complex';
}

export interface FamilyMember {
  id: string;
  name: string;
  role: 'father' | 'mother' | 'son' | 'daughter' | 'guardian' | 'ward';
  age: number;
  relationships: string[]; // IDs of related family members
}

export interface FamilySuggestion {
  type: 'missing-parent' | 'age-inconsistency' | 'naming-pattern' | 'guardian-needed';
  affectedIds: string[];
  description: string;
  autoFixable: boolean;
  suggestedAction?: any;
}

// ============================================================================
// COMPREHENSIVE DATA PROCESSING
// ============================================================================

export interface EnhancedProcessingOptions {
  // Smart column detection
  autoDetectColumns: boolean;
  strictColumnMatching: boolean;
  fuzzyNameMatching: boolean;
  
  // Data validation
  enableSmartValidation: boolean;
  autoFixMinorIssues: boolean;
  requiredFieldsStrict: boolean;
  
  // Family analysis
  detectFamilyRelationships: boolean;
  autoLinkFamilies: boolean;
  generateMissingGuardians: boolean;
  
  // S-38 processing
  validateS38Qualifications: boolean;
  enforceBusinessRules: boolean;
  suggestQualificationUpdates: boolean;
  
  // Output options
  generateReport: boolean;
  createBackup: boolean;
  preserveOriginalData: boolean;
}

export interface ProcessingResult {
  summary: {
    totalRows: number;
    validRows: number;
    processedRows: number;
    errorsFixed: number;
    warningsGenerated: number;
    familiesDetected: number;
    relationshipsLinked: number;
  };
  
  validationResults: SmartValidationResult[];
  familyAnalysis: FamilyAnalysis;
  processedData: EnhancedStudentData[];
  originalData: any[];
  
  reports: {
    validationReport: string;
    familyReport: string;
    qualificationReport: string;
    processingLog: string[];
  };
}

// ============================================================================
// ENHANCED STUDENT DATA MODEL
// ============================================================================

export interface EnhancedStudentData {
  // Core identity
  id: string;
  family_id: string;
  user_id: string;
  
  // Personal information
  nome: string;
  familia: string;
  idade: number;
  genero: 'M' | 'F';
  email?: string;
  telefone?: string;
  data_nascimento?: string;
  
  // Spiritual progress
  data_batismo?: string;
  data_de_matricula?: string;
  tempo: number; // Years of service
  cargo: string;
  ativo: boolean;
  observacoes?: string;
  
  // Family structure
  estado_civil?: string;
  papel_familiar?: string;
  id_pai?: string;
  id_mae?: string;
  id_conjuge?: string;
  coabitacao?: boolean;
  menor: boolean;
  responsavel_primario?: string;
  responsavel_secundario?: string;
  parentesco?: string;
  
  // S-38-T Ministry School Qualifications
  qualifications: {
    chairman: boolean;
    pray: boolean;
    tresures: boolean;
    gems: boolean;
    reading: boolean;
    starting: boolean;
    following: boolean;
    making: boolean;
    explaining: boolean;
    talk: boolean;
  };
  
  // Metadata
  created_at: string;
  updated_at: string;
  
  // Processing metadata
  processingInfo: {
    originalRow: number;
    detectedFormat: string;
    autoFixesApplied: string[];
    validationWarnings: string[];
    familyRelationships: string[];
  };
}

// ============================================================================
// FORMAT DETECTION SYSTEM
// ============================================================================

export interface DetectedFormat {
  name: string;
  confidence: number;
  matchedColumns: { [key: string]: string };
  missingColumns: string[];
  extraColumns: string[];
  suggestions: string[];
}

export interface FormatDetector {
  detectFormat(headers: string[]): DetectedFormat[];
  mapColumns(headers: string[], format: DetectedFormat): { [key: string]: string };
  validateFormat(format: DetectedFormat): boolean;
}

// ============================================================================
// INTEGRATION WITH EXISTING TYPES
// ============================================================================

export type ImportMode = 'strict' | 'flexible' | 'auto-fix' | 'preview-only';

export interface EnhancedImportConfig {
  mode: ImportMode;
  options: EnhancedProcessingOptions;
  columnMapping?: ColumnMapping;
  customValidationRules?: ValidationRule[];
  targetFormat: 'supabase' | 'legacy' | 'enhanced';
}

// Export compatibility types
export type { ProcessedStudentData, ValidationResult, ImportSummary } from './spreadsheet';
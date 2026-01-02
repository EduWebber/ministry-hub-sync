export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      designacoes: {
        Row: {
          ajudante_id: string | null
          assignment_status: string | null
          cena: string | null
          congregacao_id: string | null
          created_at: string
          data_designacao: string | null
          estudante_id: string | null
          id: string
          observacoes: string | null
          programa_id: string | null
          status: string | null
          tempo_minutos: number | null
          tipo_parte: string | null
          titulo_parte: string
          updated_at: string
        }
        Insert: {
          ajudante_id?: string | null
          assignment_status?: string | null
          cena?: string | null
          congregacao_id?: string | null
          created_at?: string
          data_designacao?: string | null
          estudante_id?: string | null
          id?: string
          observacoes?: string | null
          programa_id?: string | null
          status?: string | null
          tempo_minutos?: number | null
          tipo_parte?: string | null
          titulo_parte: string
          updated_at?: string
        }
        Update: {
          ajudante_id?: string | null
          assignment_status?: string | null
          cena?: string | null
          congregacao_id?: string | null
          created_at?: string
          data_designacao?: string | null
          estudante_id?: string | null
          id?: string
          observacoes?: string | null
          programa_id?: string | null
          status?: string | null
          tempo_minutos?: number | null
          tipo_parte?: string | null
          titulo_parte?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "designacoes_ajudante_id_fkey"
            columns: ["ajudante_id"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designacoes_estudante_id_fkey"
            columns: ["estudante_id"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designacoes_programa_id_fkey"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "programas_ministeriais"
            referencedColumns: ["id"]
          },
        ]
      }
      estudantes: {
        Row: {
          ativo: boolean | null
          cargo: string | null
          congregacao_id: string | null
          created_at: string
          data_batismo: string | null
          data_nascimento: string | null
          email: string | null
          genero: string | null
          id: string
          idade: number | null
          instrutor_id: string | null
          nome: string
          observacoes: string | null
          parent_id: string | null
          qualificacoes: Json | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          cargo?: string | null
          congregacao_id?: string | null
          created_at?: string
          data_batismo?: string | null
          data_nascimento?: string | null
          email?: string | null
          genero?: string | null
          id?: string
          idade?: number | null
          instrutor_id?: string | null
          nome: string
          observacoes?: string | null
          parent_id?: string | null
          qualificacoes?: Json | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          cargo?: string | null
          congregacao_id?: string | null
          created_at?: string
          data_batismo?: string | null
          data_nascimento?: string | null
          email?: string | null
          genero?: string | null
          id?: string
          idade?: number | null
          instrutor_id?: string | null
          nome?: string
          observacoes?: string | null
          parent_id?: string | null
          qualificacoes?: Json | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estudantes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_primary_contact: boolean | null
          nome: string
          parentesco: string
          student_id: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_primary_contact?: boolean | null
          nome: string
          parentesco: string
          student_id: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_primary_contact?: boolean | null
          nome?: string
          parentesco?: string
          student_id?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations_log: {
        Row: {
          created_at: string
          family_member_id: string | null
          id: string
          invitation_type: string
          sent_at: string | null
          status: string | null
          student_id: string | null
        }
        Insert: {
          created_at?: string
          family_member_id?: string | null
          id?: string
          invitation_type: string
          sent_at?: string | null
          status?: string | null
          student_id?: string | null
        }
        Update: {
          created_at?: string
          family_member_id?: string | null
          id?: string
          invitation_type?: string
          sent_at?: string | null
          status?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_log_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_log_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          congregacao_id: string | null
          created_at: string
          email: string | null
          id: string
          nome: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          congregacao_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          congregacao_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      programas: {
        Row: {
          congregacao_id: string | null
          created_at: string
          descricao: string | null
          id: string
          mes_ano: string | null
          status: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          congregacao_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          mes_ano?: string | null
          status?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          congregacao_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          mes_ano?: string | null
          status?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      programas_ministeriais: {
        Row: {
          arquivo_nome: string | null
          arquivo_url: string | null
          congregacao_id: string | null
          created_at: string
          criado_por: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          id: string
          mes_ano: string
          status: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          arquivo_nome?: string | null
          arquivo_url?: string | null
          congregacao_id?: string | null
          created_at?: string
          criado_por?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          mes_ano: string
          status?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          arquivo_nome?: string | null
          arquivo_url?: string | null
          congregacao_id?: string | null
          created_at?: string
          criado_por?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          mes_ano?: string
          status?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

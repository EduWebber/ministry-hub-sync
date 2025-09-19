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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      congregacoes: {
        Row: {
          cidade: string
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          cidade: string
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          cidade?: string
          created_at?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      designacao_itens: {
        Row: {
          assistente_estudante_id: string | null
          congregacao_id: string
          created_at: string | null
          id: string
          observacoes: string | null
          principal_estudante_id: string | null
          programacao_id: string
          programacao_item_id: string
          status: string | null
        }
        Insert: {
          assistente_estudante_id?: string | null
          congregacao_id: string
          created_at?: string | null
          id?: string
          observacoes?: string | null
          principal_estudante_id?: string | null
          programacao_id: string
          programacao_item_id: string
          status?: string | null
        }
        Update: {
          assistente_estudante_id?: string | null
          congregacao_id?: string
          created_at?: string | null
          id?: string
          observacoes?: string | null
          principal_estudante_id?: string | null
          programacao_id?: string
          programacao_item_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "designacao_itens_assistente_estudante_id_fkey"
            columns: ["assistente_estudante_id"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designacao_itens_congregacao_id_fkey"
            columns: ["congregacao_id"]
            isOneToOne: false
            referencedRelation: "congregacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designacao_itens_principal_estudante_id_fkey"
            columns: ["principal_estudante_id"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designacao_itens_programacao_id_fkey"
            columns: ["programacao_id"]
            isOneToOne: false
            referencedRelation: "programacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designacao_itens_programacao_item_id_fkey"
            columns: ["programacao_item_id"]
            isOneToOne: false
            referencedRelation: "programacao_itens"
            referencedColumns: ["id"]
          },
        ]
      }
      designacoes: {
        Row: {
          ajudante_id: string | null
          created_at: string | null
          estudante_id: string
          id: string
          observacoes: string | null
          parte_id: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ajudante_id?: string | null
          created_at?: string | null
          estudante_id: string
          id?: string
          observacoes?: string | null
          parte_id: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ajudante_id?: string | null
          created_at?: string | null
          estudante_id?: string
          id?: string
          observacoes?: string | null
          parte_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
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
            foreignKeyName: "designacoes_parte_id_fkey"
            columns: ["parte_id"]
            isOneToOne: false
            referencedRelation: "partes_programa"
            referencedColumns: ["id"]
          },
        ]
      }
      estudantes: {
        Row: {
          ativo: boolean | null
          congregacao_id: string | null
          created_at: string | null
          disponibilidade: Json | null
          genero: string
          id: string
          profile_id: string
          qualificacoes: string[] | null
          user_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          congregacao_id?: string | null
          created_at?: string | null
          disponibilidade?: Json | null
          genero: string
          id?: string
          profile_id: string
          qualificacoes?: string[] | null
          user_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          congregacao_id?: string | null
          created_at?: string | null
          disponibilidade?: Json | null
          genero?: string
          id?: string
          profile_id?: string
          qualificacoes?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estudantes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      estudantes_import: {
        Row: {
          ativo: boolean | null
          cargo: string | null
          chairman: boolean | null
          coabitacao: boolean | null
          created_at: string | null
          created_at_sys: string | null
          data_batismo: string | null
          data_de_matricula: string | null
          data_nascimento: string | null
          email: string | null
          estado_civil: string | null
          explaining: boolean | null
          familia: string | null
          family_id: string | null
          following: boolean | null
          gems: boolean | null
          genero: string | null
          id: string
          id_conjuge: string | null
          id_mae: string | null
          id_pai: string | null
          idade: number | null
          making: boolean | null
          menor: boolean | null
          nome: string | null
          observacoes: string | null
          papel_familiar: string | null
          pray: boolean | null
          reading: boolean | null
          responsavel_primario: boolean | null
          responsavel_secundario: boolean | null
          starting: boolean | null
          talk: boolean | null
          telefone: string | null
          tempo: number | null
          tresures: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          cargo?: string | null
          chairman?: boolean | null
          coabitacao?: boolean | null
          created_at?: string | null
          created_at_sys?: string | null
          data_batismo?: string | null
          data_de_matricula?: string | null
          data_nascimento?: string | null
          email?: string | null
          estado_civil?: string | null
          explaining?: boolean | null
          familia?: string | null
          family_id?: string | null
          following?: boolean | null
          gems?: boolean | null
          genero?: string | null
          id?: string
          id_conjuge?: string | null
          id_mae?: string | null
          id_pai?: string | null
          idade?: number | null
          making?: boolean | null
          menor?: boolean | null
          nome?: string | null
          observacoes?: string | null
          papel_familiar?: string | null
          pray?: boolean | null
          reading?: boolean | null
          responsavel_primario?: boolean | null
          responsavel_secundario?: boolean | null
          starting?: boolean | null
          talk?: boolean | null
          telefone?: string | null
          tempo?: number | null
          tresures?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          cargo?: string | null
          chairman?: boolean | null
          coabitacao?: boolean | null
          created_at?: string | null
          created_at_sys?: string | null
          data_batismo?: string | null
          data_de_matricula?: string | null
          data_nascimento?: string | null
          email?: string | null
          estado_civil?: string | null
          explaining?: boolean | null
          familia?: string | null
          family_id?: string | null
          following?: boolean | null
          gems?: boolean | null
          genero?: string | null
          id?: string
          id_conjuge?: string | null
          id_mae?: string | null
          id_pai?: string | null
          idade?: number | null
          making?: boolean | null
          menor?: boolean | null
          nome?: string | null
          observacoes?: string | null
          papel_familiar?: string | null
          pray?: boolean | null
          reading?: boolean | null
          responsavel_primario?: boolean | null
          responsavel_secundario?: boolean | null
          starting?: boolean | null
          talk?: boolean | null
          telefone?: string | null
          tempo?: number | null
          tresures?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      family_members: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string | null
          gender: string | null
          id: string
          name: string
          phone: string | null
          relation: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          name: string
          phone?: string | null
          relation?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          name?: string
          phone?: string | null
          relation?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invitations_log: {
        Row: {
          created_at: string | null
          family_member_id: string
          id: string
          method: string | null
          sent_at: string | null
          sent_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          family_member_id: string
          id?: string
          method?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          family_member_id?: string
          id?: string
          method?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_log_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      partes_programa: {
        Row: {
          created_at: string | null
          duracao_minutos: number
          genero_requerido:
            | Database["public"]["Enums"]["genero_requerido"]
            | null
          id: string
          instrucoes: string | null
          ordem: number
          semana_id: string
          tipo_designacao: Database["public"]["Enums"]["tipo_designacao"]
          titulo: string
        }
        Insert: {
          created_at?: string | null
          duracao_minutos: number
          genero_requerido?:
            | Database["public"]["Enums"]["genero_requerido"]
            | null
          id?: string
          instrucoes?: string | null
          ordem: number
          semana_id: string
          tipo_designacao: Database["public"]["Enums"]["tipo_designacao"]
          titulo: string
        }
        Update: {
          created_at?: string | null
          duracao_minutos?: number
          genero_requerido?:
            | Database["public"]["Enums"]["genero_requerido"]
            | null
          id?: string
          instrucoes?: string | null
          ordem?: number
          semana_id?: string
          tipo_designacao?: Database["public"]["Enums"]["tipo_designacao"]
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "partes_programa_semana_id_fkey"
            columns: ["semana_id"]
            isOneToOne: false
            referencedRelation: "semanas_programa"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cargo: string | null
          congregacao: string | null
          congregacao_id: string | null
          created_at: string | null
          data_nascimento: string | null
          email: string
          id: string
          nome: string
          nome_completo: string | null
          role: Database["public"]["Enums"]["app_role"]
          telefone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cargo?: string | null
          congregacao?: string | null
          congregacao_id?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email: string
          id?: string
          nome: string
          nome_completo?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          telefone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cargo?: string | null
          congregacao?: string | null
          congregacao_id?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string
          id?: string
          nome?: string
          nome_completo?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          telefone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      programacao_itens: {
        Row: {
          created_at: string | null
          id: string
          lang: Json | null
          minutes: number
          order: number
          programacao_id: string
          rules: Json | null
          section: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lang?: Json | null
          minutes: number
          order: number
          programacao_id: string
          rules?: Json | null
          section: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lang?: Json | null
          minutes?: number
          order?: number
          programacao_id?: string
          rules?: Json | null
          section?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "programacao_itens_programacao_id_fkey"
            columns: ["programacao_id"]
            isOneToOne: false
            referencedRelation: "programacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      programacoes: {
        Row: {
          congregation_scope: string | null
          created_at: string | null
          id: string
          status: string | null
          updated_at: string | null
          week_end: string
          week_start: string
        }
        Insert: {
          congregation_scope?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          week_end: string
          week_start: string
        }
        Update: {
          congregation_scope?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
      programas: {
        Row: {
          assignment_status: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          assignment_status?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          assignment_status?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      programas_ministeriais: {
        Row: {
          arquivo_nome: string
          arquivo_url: string
          conteudo: Json | null
          created_at: string | null
          id: string
          mes_ano: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          arquivo_nome: string
          arquivo_url: string
          conteudo?: Json | null
          created_at?: string | null
          id?: string
          mes_ano: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          arquivo_nome?: string
          arquivo_url?: string
          conteudo?: Json | null
          created_at?: string | null
          id?: string
          mes_ano?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      semanas_programa: {
        Row: {
          created_at: string | null
          data_inicio: string
          id: string
          leitura_biblica: string | null
          programa_id: string
          semana_numero: number
          tema_semana: string
        }
        Insert: {
          created_at?: string | null
          data_inicio: string
          id?: string
          leitura_biblica?: string | null
          programa_id: string
          semana_numero: number
          tema_semana: string
        }
        Update: {
          created_at?: string | null
          data_inicio?: string
          id?: string
          leitura_biblica?: string | null
          programa_id?: string
          semana_numero?: number
          tema_semana?: string
        }
        Relationships: [
          {
            foreignKeyName: "semanas_programa_programa_id_fkey"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "programas_ministeriais"
            referencedColumns: ["id"]
          },
        ]
      }
      staging_estudantes: {
        Row: {
          ativo: string | null
          cargo: string | null
          chairman: string | null
          coabitacao: string | null
          created_at: string | null
          data_batismo: string | null
          data_de_matricula: string | null
          data_nascimento: string | null
          email: string | null
          estado_civil: string | null
          explaining: string | null
          familia: string | null
          family_id: string | null
          following: string | null
          gems: string | null
          genero: string | null
          id_conjuge: string | null
          id_mae: string | null
          id_pai: string | null
          idade: string | null
          making: string | null
          menor: string | null
          nome: string | null
          observacoes: string | null
          papel_familiar: string | null
          pray: string | null
          reading: string | null
          responsavel_primario: string | null
          responsavel_secundario: string | null
          starting: string | null
          talk: string | null
          telefone: string | null
          tempo: string | null
          tresures: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ativo?: string | null
          cargo?: string | null
          chairman?: string | null
          coabitacao?: string | null
          created_at?: string | null
          data_batismo?: string | null
          data_de_matricula?: string | null
          data_nascimento?: string | null
          email?: string | null
          estado_civil?: string | null
          explaining?: string | null
          familia?: string | null
          family_id?: string | null
          following?: string | null
          gems?: string | null
          genero?: string | null
          id_conjuge?: string | null
          id_mae?: string | null
          id_pai?: string | null
          idade?: string | null
          making?: string | null
          menor?: string | null
          nome?: string | null
          observacoes?: string | null
          papel_familiar?: string | null
          pray?: string | null
          reading?: string | null
          responsavel_primario?: string | null
          responsavel_secundario?: string | null
          starting?: string | null
          talk?: string | null
          telefone?: string | null
          tempo?: string | null
          tresures?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ativo?: string | null
          cargo?: string | null
          chairman?: string | null
          coabitacao?: string | null
          created_at?: string | null
          data_batismo?: string | null
          data_de_matricula?: string | null
          data_nascimento?: string | null
          email?: string | null
          estado_civil?: string | null
          explaining?: string | null
          familia?: string | null
          family_id?: string | null
          following?: string | null
          gems?: string | null
          genero?: string | null
          id_conjuge?: string | null
          id_mae?: string | null
          id_pai?: string | null
          idade?: string | null
          making?: string | null
          menor?: string | null
          nome?: string | null
          observacoes?: string | null
          papel_familiar?: string | null
          pray?: string | null
          reading?: string | null
          responsavel_primario?: string | null
          responsavel_secundario?: string | null
          starting?: string | null
          talk?: string | null
          telefone?: string | null
          tempo?: string | null
          tresures?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      batch_import_legacy_students: {
        Args: { p_instrutor_user_id: string }
        Returns: {
          estudante_ids: string[]
          imported_count: number
          profile_ids: string[]
        }[]
      }
      check_student_duplicate: {
        Args: {
          p_email?: string
          p_nome: string
          p_telefone?: string
          p_user_id: string
        }
        Returns: boolean
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      import_legacy_student_data: {
        Args: {
          p_ativo?: boolean
          p_cargo?: string
          p_chairman?: boolean
          p_data_batismo?: string
          p_data_nascimento?: string
          p_email?: string
          p_explaining?: boolean
          p_familia?: string
          p_following?: boolean
          p_gems?: boolean
          p_genero?: string
          p_idade?: number
          p_making?: boolean
          p_nome: string
          p_observacoes?: string
          p_pray?: boolean
          p_reading?: boolean
          p_starting?: boolean
          p_talk?: boolean
          p_telefone?: string
          p_treasures?: boolean
          p_user_id: string
        }
        Returns: string
      }
      import_student_simple: {
        Args: {
          p_ativo?: boolean
          p_cargo?: string
          p_email?: string
          p_genero?: string
          p_nome: string
          p_qualificacoes?: string[]
          p_telefone?: string
          p_user_id: string
        }
        Returns: {
          estudante_id: string
          profile_id: string
        }[]
      }
      load_estudantes_from_staging: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "instrutor" | "estudante"
      genero_requerido: "masculino" | "feminino" | "ambos"
      tipo_designacao:
        | "discurso_tesouros"
        | "joias_espirituais"
        | "leitura_biblica"
        | "iniciando_conversas"
        | "cultivando_interesse"
        | "fazendo_discipulos"
        | "explicando_crencas"
        | "discurso_ministerio"
        | "estudo_biblico_congregacao"
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
    Enums: {
      app_role: ["admin", "instrutor", "estudante"],
      genero_requerido: ["masculino", "feminino", "ambos"],
      tipo_designacao: [
        "discurso_tesouros",
        "joias_espirituais",
        "leitura_biblica",
        "iniciando_conversas",
        "cultivando_interesse",
        "fazendo_discipulos",
        "explicando_crencas",
        "discurso_ministerio",
        "estudo_biblico_congregacao",
      ],
    },
  },
} as const

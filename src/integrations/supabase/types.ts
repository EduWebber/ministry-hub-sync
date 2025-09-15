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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      app_cargo: "anciao" | "servo_ministerial" | "pioneiro_regular" | "publicador_batizado" | "publicador_nao_batizado" | "estudante_novo"
      app_genero: "masculino" | "feminino"
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

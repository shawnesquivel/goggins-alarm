export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      app_errors: {
        Row: {
          component: string | null
          created_at: string | null
          device_info: Json | null
          error_message: string | null
          error_type: string
          id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          component?: string | null
          created_at?: string | null
          device_info?: Json | null
          error_message?: string | null
          error_type: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          component?: string | null
          created_at?: string | null
          device_info?: Json | null
          error_message?: string | null
          error_type?: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_errors_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_errors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      periods: {
        Row: {
          actual_duration_minutes: number | null
          created_at: string | null
          ended_at: string | null
          id: string
          last_updated_at: string | null
          planned_duration_minutes: number
          quality_rating: number | null
          rest_activities_selected: string[] | null
          session_id: string | null
          started_at: string | null
          type: string
          user_notes: string | null
          work_time_completed: boolean | null
        }
        Insert: {
          actual_duration_minutes?: number | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          last_updated_at?: string | null
          planned_duration_minutes: number
          quality_rating?: number | null
          rest_activities_selected?: string[] | null
          session_id?: string | null
          started_at?: string | null
          type: string
          user_notes?: string | null
          work_time_completed?: boolean | null
        }
        Update: {
          actual_duration_minutes?: number | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          last_updated_at?: string | null
          planned_duration_minutes?: number
          quality_rating?: number | null
          rest_activities_selected?: string[] | null
          session_id?: string | null
          started_at?: string | null
          type?: string
          user_notes?: string | null
          work_time_completed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "periods_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          color: string | null
          created_at: string | null
          goal: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          goal?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          goal?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      revenuecat_errors: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          payload: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revenuecat_errors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          cancelled_reason_details: string | null
          cancelled_reasons: string[] | null
          completed: boolean | null
          created_at: string | null
          distraction_reasons_selected: string[] | null
          id: string
          intention_transcription: string | null
          last_updated_at: string | null
          project_id: string | null
          status: string | null
          task: string
          total_deep_rest_minutes: number | null
          total_deep_work_minutes: number | null
          transcription_error: string | null
          user_id: string | null
          user_notes: string | null
        }
        Insert: {
          cancelled_reason_details?: string | null
          cancelled_reasons?: string[] | null
          completed?: boolean | null
          created_at?: string | null
          distraction_reasons_selected?: string[] | null
          id?: string
          intention_transcription?: string | null
          last_updated_at?: string | null
          project_id?: string | null
          status?: string | null
          task: string
          total_deep_rest_minutes?: number | null
          total_deep_work_minutes?: number | null
          transcription_error?: string | null
          user_id?: string | null
          user_notes?: string | null
        }
        Update: {
          cancelled_reason_details?: string | null
          cancelled_reasons?: string[] | null
          completed?: boolean | null
          created_at?: string | null
          distraction_reasons_selected?: string[] | null
          id?: string
          intention_transcription?: string | null
          last_updated_at?: string | null
          project_id?: string | null
          status?: string | null
          task?: string
          total_deep_rest_minutes?: number | null
          total_deep_work_minutes?: number | null
          transcription_error?: string | null
          user_id?: string | null
          user_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          daily_goal_minutes: number | null
          default_deep_rest_minutes: number | null
          default_deep_work_minutes: number | null
          email: string | null
          id: string
          is_premium: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          daily_goal_minutes?: number | null
          default_deep_rest_minutes?: number | null
          default_deep_work_minutes?: number | null
          email?: string | null
          id: string
          is_premium?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          daily_goal_minutes?: number | null
          default_deep_rest_minutes?: number | null
          default_deep_work_minutes?: number | null
          email?: string | null
          id?: string
          is_premium?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_schema_completeness: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_config_info: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_rls_policies: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      handle_revenuecat_webhook: {
        Args: { webhook_data: Json }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const


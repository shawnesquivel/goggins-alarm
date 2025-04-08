export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      app_errors: {
        Row: {
          component: string | null;
          created_at: string | null;
          device_info: Json | null;
          error_message: string | null;
          error_type: string;
          id: string;
          session_id: string | null;
          user_id: string | null;
        };
        Insert: {
          component?: string | null;
          created_at?: string | null;
          device_info?: Json | null;
          error_message?: string | null;
          error_type: string;
          id?: string;
          session_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          component?: string | null;
          created_at?: string | null;
          device_info?: Json | null;
          error_message?: string | null;
          error_type?: string;
          id?: string;
          session_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "app_errors_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "app_errors_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      periods: {
        Row: {
          actual_duration_minutes: number | null;
          completed: boolean | null;
          created_at: string | null;
          distraction_reasons_selected: string[] | null;
          ended_at: string | null;
          id: string;
          last_updated_at: string | null;
          planned_duration_minutes: number;
          quality_rating: number | null;
          rest_activities_selected: string[] | null;
          session_id: string | null;
          started_at: string | null;
          type: string;
          user_notes: string | null;
        };
        Insert: {
          actual_duration_minutes?: number | null;
          completed?: boolean | null;
          created_at?: string | null;
          distraction_reasons_selected?: string[] | null;
          ended_at?: string | null;
          id?: string;
          last_updated_at?: string | null;
          planned_duration_minutes: number;
          quality_rating?: number | null;
          rest_activities_selected?: string[] | null;
          session_id?: string | null;
          started_at?: string | null;
          type: string;
          user_notes?: string | null;
        };
        Update: {
          actual_duration_minutes?: number | null;
          completed?: boolean | null;
          created_at?: string | null;
          distraction_reasons_selected?: string[] | null;
          ended_at?: string | null;
          id?: string;
          last_updated_at?: string | null;
          planned_duration_minutes?: number;
          quality_rating?: number | null;
          rest_activities_selected?: string[] | null;
          session_id?: string | null;
          started_at?: string | null;
          type?: string;
          user_notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "periods_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          }
        ];
      };
      projects: {
        Row: {
          color: string | null;
          created_at: string | null;
          goal: string | null;
          id: string;
          name: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          color?: string | null;
          created_at?: string | null;
          goal?: string | null;
          id?: string;
          name: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          color?: string | null;
          created_at?: string | null;
          goal?: string | null;
          id?: string;
          name?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      revenuecat_errors: {
        Row: {
          created_at: string | null;
          error_message: string | null;
          event_type: string;
          id: string;
          payload: Json | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          error_message?: string | null;
          event_type: string;
          id?: string;
          payload?: Json | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          error_message?: string | null;
          event_type?: string;
          id?: string;
          payload?: Json | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "revenuecat_errors_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      sessions: {
        Row: {
          cancelled_reason: string | null;
          cancelled_reasons: string[] | null;
          cancelled_reason_details: string | null;
          completed: boolean | null;
          created_at: string | null;
          id: string;
          intention_transcription: string | null;
          last_updated_at: string | null;
          project_id: string | null;
          status: string | null;
          task: string;
          total_deep_rest_minutes: number | null;
          total_deep_work_minutes: number | null;
          transcription_error: string | null;
          user_id: string | null;
          user_notes: string | null;
        };
        Insert: {
          cancelled_reason?: string | null;
          cancelled_reasons?: string[] | null;
          cancelled_reason_details?: string | null;
          completed?: boolean | null;
          created_at?: string | null;
          id?: string;
          intention_transcription?: string | null;
          last_updated_at?: string | null;
          project_id?: string | null;
          status?: string | null;
          task: string;
          total_deep_rest_minutes?: number | null;
          total_deep_work_minutes?: number | null;
          transcription_error?: string | null;
          user_id?: string | null;
          user_notes?: string | null;
        };
        Update: {
          cancelled_reason?: string | null;
          cancelled_reasons?: string[] | null;
          cancelled_reason_details?: string | null;
          completed?: boolean | null;
          created_at?: string | null;
          id?: string;
          intention_transcription?: string | null;
          last_updated_at?: string | null;
          project_id?: string | null;
          status?: string | null;
          task?: string;
          total_deep_rest_minutes?: number | null;
          total_deep_work_minutes?: number | null;
          transcription_error?: string | null;
          user_id?: string | null;
          user_notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: {
          created_at: string | null;
          daily_goal_minutes: number | null;
          default_deep_rest_minutes: number | null;
          default_deep_work_minutes: number | null;
          email: string | null;
          id: string;
          is_premium: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          daily_goal_minutes?: number | null;
          default_deep_rest_minutes?: number | null;
          default_deep_work_minutes?: number | null;
          email?: string | null;
          id: string;
          is_premium?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          daily_goal_minutes?: number | null;
          default_deep_rest_minutes?: number | null;
          default_deep_work_minutes?: number | null;
          email?: string | null;
          id?: string;
          is_premium?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      daily_analytics: {
        Row: {
          all_distraction_reasons: string[] | null;
          avg_quality_rating: number | null;
          day: string | null;
          total_rest_minutes: number | null;
          total_work_minutes: number | null;
          user_id: string | null;
          work_periods_count: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      monthly_analytics: {
        Row: {
          all_distraction_reasons: string[] | null;
          avg_quality_rating: number | null;
          month_start: string | null;
          total_rest_minutes: number | null;
          total_work_minutes: number | null;
          user_id: string | null;
          work_periods_count: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      weekly_analytics: {
        Row: {
          all_distraction_reasons: string[] | null;
          avg_quality_rating: number | null;
          total_rest_minutes: number | null;
          total_work_minutes: number | null;
          user_id: string | null;
          week_start: string | null;
          work_periods_count: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Functions: {
      check_schema_completeness: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      get_config_info: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      get_rls_policies: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      handle_revenuecat_webhook: {
        Args: {
          webhook_data: Json;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

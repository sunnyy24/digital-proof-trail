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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      chain_of_custody_events: {
        Row: {
          created_at: string
          detail: string | null
          event: string
          id: string
          provider: string | null
          scan_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          event: string
          id?: string
          provider?: string | null
          scan_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          event?: string
          id?: string
          provider?: string | null
          scan_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chain_of_custody_events_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      detection_results: {
        Row: {
          ai_generated_score: number | null
          created_at: string
          deepfake_score: number | null
          id: string
          media_type: string | null
          message: string | null
          not_ai_generated_score: number | null
          provider: string
          raw_response: Json | null
          scan_id: string
          source_confidence: number | null
          source_name: string | null
          status: string
          user_id: string
        }
        Insert: {
          ai_generated_score?: number | null
          created_at?: string
          deepfake_score?: number | null
          id?: string
          media_type?: string | null
          message?: string | null
          not_ai_generated_score?: number | null
          provider: string
          raw_response?: Json | null
          scan_id: string
          source_confidence?: number | null
          source_name?: string | null
          status?: string
          user_id: string
        }
        Update: {
          ai_generated_score?: number | null
          created_at?: string
          deepfake_score?: number | null
          id?: string
          media_type?: string | null
          message?: string | null
          not_ai_generated_score?: number | null
          provider?: string
          raw_response?: Json | null
          scan_id?: string
          source_confidence?: number | null
          source_name?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "detection_results_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_items: {
        Row: {
          category: string
          certainty: string
          confidence: number | null
          created_at: string
          explanation: string | null
          id: string
          scan_id: string
          source: string | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          category: string
          certainty?: string
          confidence?: number | null
          created_at?: string
          explanation?: string | null
          id?: string
          scan_id: string
          source?: string | null
          status: string
          title: string
          user_id: string
        }
        Update: {
          category?: string
          certainty?: string
          confidence?: number | null
          created_at?: string
          explanation?: string | null
          id?: string
          scan_id?: string
          source?: string | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_items_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      forensic_results: {
        Row: {
          created_at: string
          id: string
          indicators: Json | null
          media_kind: string | null
          metadata: Json | null
          scan_id: string
          technical: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          indicators?: Json | null
          media_kind?: string | null
          metadata?: Json | null
          scan_id: string
          technical?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          indicators?: Json | null
          media_kind?: string | null
          metadata?: Json | null
          scan_id?: string
          technical?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forensic_results_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      media_fingerprints: {
        Row: {
          algorithm: string
          created_at: string
          id: string
          kind: string
          scan_id: string
          user_id: string
          value: string
        }
        Insert: {
          algorithm: string
          created_at?: string
          id?: string
          kind: string
          scan_id: string
          user_id: string
          value: string
        }
        Update: {
          algorithm?: string
          created_at?: string
          id?: string
          kind?: string
          scan_id?: string
          user_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_fingerprints_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      media_segments: {
        Row: {
          confidence: number | null
          created_at: string
          detail: string | null
          detector: string | null
          end_seconds: number | null
          id: string
          label: string
          scan_id: string
          start_seconds: number
          track: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          detail?: string | null
          detector?: string | null
          end_seconds?: number | null
          id?: string
          label: string
          scan_id: string
          start_seconds: number
          track: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          detail?: string | null
          detector?: string | null
          end_seconds?: number | null
          id?: string
          label?: string
          scan_id?: string
          start_seconds?: number
          track?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_segments_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      provenance_results: {
        Row: {
          ai_indicated: boolean | null
          created_at: string
          creation_time: string | null
          creation_tool: string | null
          creator: string | null
          history: Json | null
          id: string
          issuer: string | null
          message: string | null
          provider: string
          scan_id: string
          state: string
          user_id: string
        }
        Insert: {
          ai_indicated?: boolean | null
          created_at?: string
          creation_time?: string | null
          creation_tool?: string | null
          creator?: string | null
          history?: Json | null
          id?: string
          issuer?: string | null
          message?: string | null
          provider: string
          scan_id: string
          state: string
          user_id: string
        }
        Update: {
          ai_indicated?: boolean | null
          created_at?: string
          creation_time?: string | null
          creation_tool?: string | null
          creator?: string | null
          history?: Json | null
          id?: string
          issuer?: string | null
          message?: string | null
          provider?: string
          scan_id?: string
          state?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provenance_results_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          format: string
          id: string
          payload: Json
          scan_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          format?: string
          id?: string
          payload: Json
          scan_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          format?: string
          id?: string
          payload?: Json
          scan_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      scans: {
        Row: {
          case_id: string | null
          completed_at: string | null
          confidence: number | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          evidence_id: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          is_demo: boolean
          media_kind: string
          risk_level: string | null
          sha256: string
          stage: string | null
          status: string
          storage_path: string | null
          user_id: string
          verdict: string | null
        }
        Insert: {
          case_id?: string | null
          completed_at?: string | null
          confidence?: number | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          evidence_id: string
          file_name: string
          file_size: number
          file_type: string
          id?: string
          is_demo?: boolean
          media_kind: string
          risk_level?: string | null
          sha256: string
          stage?: string | null
          status?: string
          storage_path?: string | null
          user_id: string
          verdict?: string | null
        }
        Update: {
          case_id?: string | null
          completed_at?: string | null
          confidence?: number | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          evidence_id?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          is_demo?: boolean
          media_kind?: string
          risk_level?: string | null
          sha256?: string
          stage?: string | null
          status?: string
          storage_path?: string | null
          user_id?: string
          verdict?: string | null
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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

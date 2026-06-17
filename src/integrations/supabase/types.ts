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
      campaign_influencers: {
        Row: {
          campaign_id: string
          coupon: string
          created_at: string
          id: string
          influencer_id: string
          post_status: string
          proof_status: string
          updated_at: string
          views_delivered: number
        }
        Insert: {
          campaign_id: string
          coupon: string
          created_at?: string
          id?: string
          influencer_id: string
          post_status?: string
          proof_status?: string
          updated_at?: string
          views_delivered?: number
        }
        Update: {
          campaign_id?: string
          coupon?: string
          created_at?: string
          id?: string
          influencer_id?: string
          post_status?: string
          proof_status?: string
          updated_at?: string
          views_delivered?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaign_influencers_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_influencers_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          client_id: string
          client_price: number
          cpm_commercial: number
          cpm_internal: number
          created_at: string
          creative: string | null
          duration_hours: number
          general_coupon: string | null
          id: string
          name: string
          notes: string | null
          product: string
          start_date: string
          status: string
          updated_at: string
          views_goal: number
        }
        Insert: {
          client_id: string
          client_price?: number
          cpm_commercial?: number
          cpm_internal?: number
          created_at?: string
          creative?: string | null
          duration_hours?: number
          general_coupon?: string | null
          id?: string
          name: string
          notes?: string | null
          product: string
          start_date: string
          status?: string
          updated_at?: string
          views_goal?: number
        }
        Update: {
          client_id?: string
          client_price?: number
          cpm_commercial?: number
          cpm_internal?: number
          created_at?: string
          creative?: string | null
          duration_hours?: number
          general_coupon?: string | null
          id?: string
          name?: string
          notes?: string | null
          product?: string
          start_date?: string
          status?: string
          updated_at?: string
          views_goal?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          campaigns: number
          city: string
          company: string
          created_at: string
          email: string
          id: string
          notes: string | null
          responsible: string
          segment: string
          status: string
          total_invested: number
          updated_at: string
          whatsapp: string
        }
        Insert: {
          campaigns?: number
          city: string
          company: string
          created_at?: string
          email: string
          id?: string
          notes?: string | null
          responsible: string
          segment: string
          status?: string
          total_invested?: number
          updated_at?: string
          whatsapp: string
        }
        Update: {
          campaigns?: number
          city?: string
          company?: string
          created_at?: string
          email?: string
          id?: string
          notes?: string | null
          responsible?: string
          segment?: string
          status?: string
          total_invested?: number
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      influencers: {
        Row: {
          avg_views: number
          city: string
          cpm_internal: number
          created_at: string
          id: string
          instagram: string | null
          last_campaign: string | null
          name: string
          neighborhood: string
          niche: string
          notes: string | null
          public_name: string
          reliability: string
          status: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          avg_views?: number
          city: string
          cpm_internal?: number
          created_at?: string
          id?: string
          instagram?: string | null
          last_campaign?: string | null
          name: string
          neighborhood: string
          niche: string
          notes?: string | null
          public_name: string
          reliability?: string
          status?: string
          updated_at?: string
          whatsapp: string
        }
        Update: {
          avg_views?: number
          city?: string
          cpm_internal?: number
          created_at?: string
          id?: string
          instagram?: string | null
          last_campaign?: string | null
          name?: string
          neighborhood?: string
          niche?: string
          notes?: string | null
          public_name?: string
          reliability?: string
          status?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          campaign_id: string
          created_at: string
          due_date: string
          id: string
          influencer_id: string
          status: string
          updated_at: string
          views: number
        }
        Insert: {
          amount?: number
          campaign_id: string
          created_at?: string
          due_date: string
          id?: string
          influencer_id: string
          status?: string
          updated_at?: string
          views?: number
        }
        Update: {
          amount?: number
          campaign_id?: string
          created_at?: string
          due_date?: string
          id?: string
          influencer_id?: string
          status?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "payments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      proofs: {
        Row: {
          campaign_id: string
          collected_at: string
          created_at: string
          id: string
          image_url: string
          influencer_id: string
          published_at: string
          status: string
          type: string
          updated_at: string
          views: number
        }
        Insert: {
          campaign_id: string
          collected_at: string
          created_at?: string
          id?: string
          image_url?: string
          influencer_id: string
          published_at: string
          status?: string
          type: string
          updated_at?: string
          views?: number
        }
        Update: {
          campaign_id?: string
          collected_at?: string
          created_at?: string
          id?: string
          image_url?: string
          influencer_id?: string
          published_at?: string
          status?: string
          type?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "proofs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proofs_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
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

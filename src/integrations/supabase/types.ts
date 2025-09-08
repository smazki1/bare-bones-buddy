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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          operation: string
          record_id: string | null
          table_name: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          operation: string
          record_id?: string | null
          table_name: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          operation?: string
          record_id?: string | null
          table_name?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      background_images: {
        Row: {
          active: boolean | null
          created_at: string
          id: string
          language: string
          title: string
          url: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          id?: string
          language: string
          title: string
          url: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          id?: string
          language?: string
          title?: string
          url?: string
        }
        Relationships: []
      }
      client_images: {
        Row: {
          category: string
          client_id: string
          created_at: string | null
          dish_name: string
          id: string
          image_after: string
          image_before: string | null
          service_type: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          client_id: string
          created_at?: string | null
          dish_name: string
          id?: string
          image_after: string
          image_before?: string | null
          service_type?: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          client_id?: string
          created_at?: string | null
          dish_name?: string
          id?: string
          image_after?: string
          image_before?: string | null
          service_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_images_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          business_name: string
          business_type: string
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          monthly_savings: number | null
          notes: string | null
          package_type: string
          phone: string | null
          signup_date: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          business_name: string
          business_type: string
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          monthly_savings?: number | null
          notes?: string | null
          package_type?: string
          phone?: string | null
          signup_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          business_name?: string
          business_type?: string
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          monthly_savings?: number | null
          notes?: string | null
          package_type?: string
          phone?: string | null
          signup_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dishes: {
        Row: {
          after_url: string | null
          before_url: string | null
          caption: string | null
          combined_before_after_url: string | null
          created_at: string
          display_order: number | null
          id: string
          img_full: string
          img_thumb: string
          is_featured: boolean | null
          keywords: string[] | null
          title: string
        }
        Insert: {
          after_url?: string | null
          before_url?: string | null
          caption?: string | null
          combined_before_after_url?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          img_full: string
          img_thumb: string
          is_featured?: boolean | null
          keywords?: string[] | null
          title: string
        }
        Update: {
          after_url?: string | null
          before_url?: string | null
          caption?: string | null
          combined_before_after_url?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          img_full?: string
          img_thumb?: string
          is_featured?: boolean | null
          keywords?: string[] | null
          title?: string
        }
        Relationships: []
      }
      landing_texts: {
        Row: {
          id: string
          lang: string
          name: string
          updated_at: string | null
          value: string
        }
        Insert: {
          id?: string
          lang?: string
          name: string
          updated_at?: string | null
          value: string
        }
        Update: {
          id?: string
          lang?: string
          name?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          business_name: string
          business_type: string
          category: string
          created_at: string
          id: number
          image_after: string
          image_before: string | null
          pinned: boolean
          service_type: string
          size: string
          tags: string[] | null
        }
        Insert: {
          business_name: string
          business_type: string
          category: string
          created_at?: string
          id?: never
          image_after: string
          image_before?: string | null
          pinned?: boolean
          service_type: string
          size: string
          tags?: string[] | null
        }
        Update: {
          business_name?: string
          business_type?: string
          category?: string
          created_at?: string
          id?: never
          image_after?: string
          image_before?: string | null
          pinned?: boolean
          service_type?: string
          size?: string
          tags?: string[] | null
        }
        Relationships: []
      }
      site_configs: {
        Row: {
          content: Json
          key: string
          updated_at: string
        }
        Insert: {
          content: Json
          key: string
          updated_at?: string
        }
        Update: {
          content?: Json
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          business_name: string
          category: string
          created_at: string | null
          display_order: number
          enabled: boolean
          id: string
          image_url: string
          link_facebook: string | null
          link_instagram: string | null
          link_x: string | null
          updated_at: string | null
        }
        Insert: {
          business_name: string
          category: string
          created_at?: string | null
          display_order?: number
          enabled?: boolean
          id?: string
          image_url: string
          link_facebook?: string | null
          link_instagram?: string | null
          link_x?: string | null
          updated_at?: string | null
        }
        Update: {
          business_name?: string
          category?: string
          created_at?: string | null
          display_order?: number
          enabled?: boolean
          id?: string
          image_url?: string
          link_facebook?: string | null
          link_instagram?: string | null
          link_x?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_user: {
        Args: { user_id_param: string }
        Returns: {
          email: string
          user_id: string
        }[]
      }
      link_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      verify_admin_user: {
        Args: { user_id_param: string }
        Returns: boolean
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

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
      admin_users: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
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
          language?: string
          title?: string
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
      categories: {
        Row: {
          created_at: string
          description: string
          icon_url: string
          id: string
          is_active: boolean
          name: string
          order_index: number
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string
          icon_url?: string
          id?: string
          is_active?: boolean
          name: string
          order_index?: number
          slug: string
        }
        Update: {
          created_at?: string
          description?: string
          icon_url?: string
          id?: string
          is_active?: boolean
          name?: string
          order_index?: number
          slug?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          business_name: string
          created_at: string
          email: string
          id: string
          name: string
          phone: string
          status: string
        }
        Insert: {
          business_name?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          status?: string
        }
        Update: {
          business_name?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          status?: string
        }
        Relationships: []
      }
      faq: {
        Row: {
          answer: string
          category: string
          created_at: string
          id: string
          is_active: boolean
          order_index: number
          question: string
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          order_index?: number
          question: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          order_index?: number
          question?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          category_ids: string[]
          created_at: string
          description: string | null
          id: string
          image_after_thumb_url: string
          image_after_url: string
          image_before_url: string
          is_featured: boolean
          order_index: number
          size: string
          title: string
          updated_at: string
        }
        Insert: {
          category_ids?: string[]
          created_at?: string
          description?: string | null
          id?: string
          image_after_thumb_url?: string
          image_after_url?: string
          image_before_url?: string
          is_featured?: boolean
          order_index?: number
          size?: string
          title: string
          updated_at?: string
        }
        Update: {
          category_ids?: string[]
          created_at?: string
          description?: string | null
          id?: string
          image_after_thumb_url?: string
          image_after_url?: string
          image_before_url?: string
          is_featured?: boolean
          order_index?: number
          size?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          cta_link: string
          cta_text: string
          description: string
          id: string
          image_url: string
          is_active: boolean
          name: string
          order_index: number
        }
        Insert: {
          created_at?: string
          cta_link?: string
          cta_text?: string
          description?: string
          id?: string
          image_url?: string
          is_active?: boolean
          name: string
          order_index?: number
        }
        Update: {
          created_at?: string
          cta_link?: string
          cta_text?: string
          description?: string
          id?: string
          image_url?: string
          is_active?: boolean
          name?: string
          order_index?: number
        }
        Relationships: []
      }
      site_content: {
        Row: {
          created_at: string
          description: string
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          client_business: string
          client_name: string
          content: string
          created_at: string
          id: string
          is_featured: boolean
          order_index: number
          rating: number
        }
        Insert: {
          client_business?: string
          client_name: string
          content: string
          created_at?: string
          id?: string
          is_featured?: boolean
          order_index?: number
          rating?: number
        }
        Update: {
          client_business?: string
          client_name?: string
          content?: string
          created_at?: string
          id?: string
          is_featured?: boolean
          order_index?: number
          rating?: number
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
          user_id: string
        }[]
      }
      link_admin_user: { Args: never; Returns: undefined }
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

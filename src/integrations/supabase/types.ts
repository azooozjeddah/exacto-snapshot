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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          balance: number
          code: string
          created_at: string
          id: number
          is_active: boolean
          name_ar: string
          name_en: string | null
          notes: string | null
          parent_id: number | null
          type: string
          updated_at: string
        }
        Insert: {
          balance?: number
          code: string
          created_at?: string
          id?: number
          is_active?: boolean
          name_ar: string
          name_en?: string | null
          notes?: string | null
          parent_id?: number | null
          type: string
          updated_at?: string
        }
        Update: {
          balance?: number
          code?: string
          created_at?: string
          id?: number
          is_active?: boolean
          name_ar?: string
          name_en?: string | null
          notes?: string | null
          parent_id?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          created_at: string
          file_key: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: number
          related_id: number
          related_type: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_key?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: number
          related_id: number
          related_type: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_key?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: number
          related_id?: number
          related_type?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: number | null
          entity_type: string
          id: number
          ip_address: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: number | null
          entity_type: string
          id?: number
          ip_address?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: number | null
          entity_type?: string
          id?: number
          ip_address?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      gallery_photos: {
        Row: {
          alt_text_ar: string | null
          alt_text_en: string | null
          category: string
          created_at: string
          file_key: string | null
          id: number
          is_active: boolean
          sort_order: number
          updated_at: string
          url: string
        }
        Insert: {
          alt_text_ar?: string | null
          alt_text_en?: string | null
          category?: string
          created_at?: string
          file_key?: string | null
          id?: number
          is_active?: boolean
          sort_order?: number
          updated_at?: string
          url: string
        }
        Update: {
          alt_text_ar?: string | null
          alt_text_en?: string | null
          category?: string
          created_at?: string
          file_key?: string | null
          id?: number
          is_active?: boolean
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          description_ar: string
          description_en: string | null
          id: number
          invoice_id: number
          quantity: number
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description_ar: string
          description_en?: string | null
          id?: number
          invoice_id: number
          quantity?: number
          total?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description_ar?: string
          description_en?: string | null
          id?: number
          invoice_id?: number
          quantity?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_address: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          created_by: string | null
          discount: number
          due_date: string | null
          id: number
          invoice_date: string
          invoice_number: string
          notes: string | null
          status: string
          subtotal: number
          tax_amount: number
          tax_rate: number
          total: number
          updated_at: string
        }
        Insert: {
          client_address?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          discount?: number
          due_date?: string | null
          id?: number
          invoice_date?: string
          invoice_number: string
          notes?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          updated_at?: string
        }
        Update: {
          client_address?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          discount?: number
          due_date?: string | null
          id?: number
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          created_at: string
          created_by: string | null
          description_ar: string | null
          description_en: string | null
          entry_date: string
          entry_number: string
          id: number
          reference_id: number | null
          reference_type: string | null
          status: string
          total_credit: number
          total_debit: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          entry_date?: string
          entry_number: string
          id?: number
          reference_id?: number | null
          reference_type?: string | null
          status?: string
          total_credit?: number
          total_debit?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          entry_date?: string
          entry_number?: string
          id?: number
          reference_id?: number | null
          reference_type?: string | null
          status?: string
          total_credit?: number
          total_debit?: number
          updated_at?: string
        }
        Relationships: []
      }
      journal_entry_lines: {
        Row: {
          account_id: number
          created_at: string
          credit: number
          debit: number
          description: string | null
          id: number
          journal_entry_id: number
        }
        Insert: {
          account_id: number
          created_at?: string
          credit?: number
          debit?: number
          description?: string | null
          id?: number
          journal_entry_id: number
        }
        Update: {
          account_id?: number
          created_at?: string
          credit?: number
          debit?: number
          description?: string | null
          id?: number
          journal_entry_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          created_at: string
          email: string | null
          id: number
          is_active: boolean
          name_ar: string
          name_en: string | null
          notes: string | null
          phone: string | null
          profit_percentage: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
          is_active?: boolean
          name_ar: string
          name_en?: string | null
          notes?: string | null
          phone?: string | null
          profit_percentage?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          is_active?: boolean
          name_ar?: string
          name_en?: string | null
          notes?: string | null
          phone?: string | null
          profit_percentage?: number
          updated_at?: string
        }
        Relationships: []
      }
      profit_distribution_lines: {
        Row: {
          amount: number
          created_at: string
          distribution_id: number
          id: number
          partner_id: number
          percentage: number
        }
        Insert: {
          amount?: number
          created_at?: string
          distribution_id: number
          id?: number
          partner_id: number
          percentage: number
        }
        Update: {
          amount?: number
          created_at?: string
          distribution_id?: number
          id?: number
          partner_id?: number
          percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "profit_distribution_lines_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "profit_distributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profit_distribution_lines_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      profit_distributions: {
        Row: {
          created_at: string
          created_by: string | null
          distribution_date: string
          id: number
          notes: string | null
          period_end: string
          period_start: string
          total_profit: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          distribution_date?: string
          id?: number
          notes?: string | null
          period_end: string
          period_start: string
          total_profit?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          distribution_date?: string
          id?: number
          notes?: string | null
          period_end?: string
          period_start?: string
          total_profit?: number
        }
        Relationships: []
      }
      project_features: {
        Row: {
          created_at: string
          description_ar: string | null
          description_en: string | null
          icon: string | null
          id: number
          is_active: boolean
          sort_order: number
          title_ar: string
          title_en: string | null
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean
          sort_order?: number
          title_ar: string
          title_en?: string | null
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean
          sort_order?: number
          title_ar?: string
          title_en?: string | null
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      purchase_items: {
        Row: {
          created_at: string
          description_ar: string
          description_en: string | null
          id: number
          purchase_id: number
          quantity: number
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description_ar: string
          description_en?: string | null
          id?: number
          purchase_id: number
          quantity?: number
          total?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description_ar?: string
          description_en?: string | null
          id?: number
          purchase_id?: number
          quantity?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          created_at: string
          created_by: string | null
          id: number
          notes: string | null
          purchase_date: string
          purchase_number: string
          status: string
          subtotal: number
          supplier_id: number | null
          tax_amount: number
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: number
          notes?: string | null
          purchase_date?: string
          purchase_number: string
          status?: string
          subtotal?: number
          supplier_id?: number | null
          tax_amount?: number
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: number
          notes?: string | null
          purchase_date?: string
          purchase_number?: string
          status?: string
          subtotal?: number
          supplier_id?: number | null
          tax_amount?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          id: number
          setting_group: string
          setting_key: string
          setting_type: string
          updated_at: string
          value_ar: string | null
          value_en: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          setting_group?: string
          setting_key: string
          setting_type?: string
          updated_at?: string
          value_ar?: string | null
          value_en?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          setting_group?: string
          setting_key?: string
          setting_type?: string
          updated_at?: string
          value_ar?: string | null
          value_en?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: number
          is_active: boolean
          name_ar: string
          name_en: string | null
          phone: string | null
          tax_number: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: number
          is_active?: boolean
          name_ar: string
          name_en?: string | null
          phone?: string | null
          tax_number?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: number
          is_active?: boolean
          name_ar?: string
          name_en?: string | null
          phone?: string | null
          tax_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          created_at: string
          description_ar: string | null
          description_en: string | null
          floor_number: string | null
          id: number
          is_active: boolean
          logo_file_key: string | null
          logo_url: string | null
          menu_url: string | null
          name_ar: string
          name_en: string | null
          phone_number: string | null
          sort_order: number
          type: string
          unit_number: string | null
          updated_at: string
          website_url: string | null
          working_hours: string | null
        }
        Insert: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          floor_number?: string | null
          id?: number
          is_active?: boolean
          logo_file_key?: string | null
          logo_url?: string | null
          menu_url?: string | null
          name_ar: string
          name_en?: string | null
          phone_number?: string | null
          sort_order?: number
          type?: string
          unit_number?: string | null
          updated_at?: string
          website_url?: string | null
          working_hours?: string | null
        }
        Update: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          floor_number?: string | null
          id?: number
          is_active?: boolean
          logo_file_key?: string | null
          logo_url?: string | null
          menu_url?: string | null
          name_ar?: string
          name_en?: string | null
          phone_number?: string | null
          sort_order?: number
          type?: string
          unit_number?: string | null
          updated_at?: string
          website_url?: string | null
          working_hours?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "photo_manager"
        | "tenant_manager"
        | "features_manager"
        | "settings_manager"
        | "accountant"
        | "data_entry"
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
      app_role: [
        "admin",
        "photo_manager",
        "tenant_manager",
        "features_manager",
        "settings_manager",
        "accountant",
        "data_entry",
      ],
    },
  },
} as const

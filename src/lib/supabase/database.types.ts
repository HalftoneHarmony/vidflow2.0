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
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: number
          ip_address: unknown
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: number
          ip_address?: unknown
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: number
          ip_address?: unknown
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_customer_ltv"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_worker_performance"
            referencedColumns: ["worker_id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: number
          is_active: boolean | null
          is_pinned: boolean | null
          starts_at: string | null
          target_audience: string | null
          title: string
          type: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: number
          is_active?: boolean | null
          is_pinned?: boolean | null
          starts_at?: string | null
          target_audience?: string | null
          title: string
          type?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: number
          is_active?: boolean | null
          is_pinned?: boolean | null
          starts_at?: string | null
          target_audience?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_customer_ltv"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_worker_performance"
            referencedColumns: ["worker_id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          admin_notes: string | null
          category: string | null
          created_at: string | null
          email: string
          id: number
          message: string
          name: string
          responded_at: string | null
          responded_by: string | null
          status: string | null
          subject: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          category?: string | null
          created_at?: string | null
          email: string
          id?: number
          message: string
          name: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: string | null
          created_at?: string | null
          email?: string
          id?: number
          message?: string
          name?: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_submissions_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_submissions_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "v_customer_ltv"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "contact_submissions_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "v_worker_performance"
            referencedColumns: ["worker_id"]
          },
          {
            foreignKeyName: "contact_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_customer_ltv"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "contact_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_worker_performance"
            referencedColumns: ["worker_id"]
          },
        ]
      }
      deliverables: {
        Row: {
          card_id: number | null
          created_at: string | null
          download_count: number | null
          external_link_url: string | null
          file_name: string | null
          first_downloaded_at: string | null
          id: number
          is_downloaded: boolean | null
          link_last_checked_at: string | null
          link_status: string | null
          type: string
        }
        Insert: {
          card_id?: number | null
          created_at?: string | null
          download_count?: number | null
          external_link_url?: string | null
          file_name?: string | null
          first_downloaded_at?: string | null
          id?: number
          is_downloaded?: boolean | null
          link_last_checked_at?: string | null
          link_status?: string | null
          type: string
        }
        Update: {
          card_id?: number | null
          created_at?: string | null
          download_count?: number | null
          external_link_url?: string | null
          file_name?: string | null
          first_downloaded_at?: string | null
          id?: number
          is_downloaded?: boolean | null
          link_last_checked_at?: string | null
          link_status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "pipeline_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          disciplines: Json | null
          event_date: string
          id: number
          is_active: boolean | null
          location: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          disciplines?: Json | null
          event_date: string
          id?: number
          is_active?: boolean | null
          location?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          disciplines?: Json | null
          event_date?: string
          id?: number
          is_active?: boolean | null
          location?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_customer_ltv"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_worker_performance"
            referencedColumns: ["worker_id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          event_id: number | null
          expensed_at: string | null
          id: number
          is_auto_generated: boolean | null
          related_worker_id: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_id?: number | null
          expensed_at?: string | null
          id?: number
          is_auto_generated?: boolean | null
          related_worker_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_id?: number | null
          expensed_at?: string | null
          id?: number
          is_auto_generated?: boolean | null
          related_worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_customer_ltv"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_worker_performance"
            referencedColumns: ["worker_id"]
          },
          {
            foreignKeyName: "expenses_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "mv_event_summary"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "expenses_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_event_analytics"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "expenses_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_event_revenue"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "expenses_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_expense_breakdown"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "expenses_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_order_summary"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "expenses_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_package_performance"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "expenses_related_worker_id_fkey"
            columns: ["related_worker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_related_worker_id_fkey"
            columns: ["related_worker_id"]
            isOneToOne: false
            referencedRelation: "v_customer_ltv"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "expenses_related_worker_id_fkey"
            columns: ["related_worker_id"]
            isOneToOne: false
            referencedRelation: "v_worker_performance"
            referencedColumns: ["worker_id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          id: number
          is_published: boolean | null
          question: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          id?: number
          is_published?: boolean | null
          question: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          id?: number
          is_published?: boolean | null
          question?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      general_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: string
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: string
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      legal_documents: {
        Row: {
          content: string
          id: number
          is_active: boolean | null
          published_at: string | null
          title: string
          type: string
          updated_at: string | null
          version: string | null
        }
        Insert: {
          content: string
          id?: number
          is_active?: boolean | null
          published_at?: string | null
          title: string
          type: string
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          content?: string
          id?: number
          is_active?: boolean | null
          published_at?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          created_at: string | null
          discipline: string | null
          event_id: number | null
          id: number
          notes: string | null
          package_id: number | null
          payment_id: string | null
          refunded_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          discipline?: string | null
          event_id?: number | null
          id?: number
          notes?: string | null
          package_id?: number | null
          payment_id?: string | null
          refunded_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          discipline?: string | null
          event_id?: number | null
          id?: number
          notes?: string | null
          package_id?: number | null
          payment_id?: string | null
          refunded_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "mv_event_summary"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_event_analytics"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_event_revenue"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_expense_breakdown"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_order_summary"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_package_performance"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "orders_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "v_order_summary"
            referencedColumns: ["package_id"]
          },
          {
            foreignKeyName: "orders_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "v_package_performance"
            referencedColumns: ["package_id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_customer_ltv"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_worker_performance"
            referencedColumns: ["worker_id"]
          },
        ]
      }
      packages: {
        Row: {
          composition: Json
          created_at: string | null
          description: string | null
          display_order: number | null
          event_id: number | null
          id: number
          is_featured: boolean | null
          is_sold_out: boolean | null
          name: string
          price: number
          specs: Json | null
          updated_at: string | null
        }
        Insert: {
          composition?: Json
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          event_id?: number | null
          id?: number
          is_featured?: boolean | null
          is_sold_out?: boolean | null
          name: string
          price: number
          specs?: Json | null
          updated_at?: string | null
        }
        Update: {
          composition?: Json
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          event_id?: number | null
          id?: number
          is_featured?: boolean | null
          is_sold_out?: boolean | null
          name?: string
          price?: number
          specs?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "packages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "mv_event_summary"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "packages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_event_analytics"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "packages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_event_revenue"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "packages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_expense_breakdown"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "packages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_order_summary"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "packages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_package_performance"
            referencedColumns: ["event_id"]
          },
        ]
      }
      pipeline_cards: {
        Row: {
          assignee_id: string | null
          id: number
          order_id: number | null
          stage: string
          stage_entered_at: string | null
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          id?: number
          order_id?: number | null
          stage?: string
          stage_entered_at?: string | null
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          id?: number
          order_id?: number | null
          stage?: string
          stage_entered_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_cards_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_cards_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "v_customer_ltv"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "pipeline_cards_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "v_worker_performance"
            referencedColumns: ["worker_id"]
          },
          {
            foreignKeyName: "pipeline_cards_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_cards_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_deliverable_tracking"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "pipeline_cards_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_order_summary"
            referencedColumns: ["order_id"]
          },
        ]
      }
      profiles: {
        Row: {
          commission_rate: number | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string | null
          email: string
          id: string
          name: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          commission_rate?: number | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      showcase_items: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: number
          is_best_cut: boolean | null
          media_url: string
          package_id: number | null
          thumbnail_url: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: number
          is_best_cut?: boolean | null
          media_url: string
          package_id?: number | null
          thumbnail_url?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: number
          is_best_cut?: boolean | null
          media_url?: string
          package_id?: number | null
          thumbnail_url?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "showcase_items_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "showcase_items_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "v_order_summary"
            referencedColumns: ["package_id"]
          },
          {
            foreignKeyName: "showcase_items_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "v_package_performance"
            referencedColumns: ["package_id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          email_notifications: boolean | null
          language: string | null
          sms_notifications: boolean | null
          theme: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          email_notifications?: boolean | null
          language?: string | null
          sms_notifications?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          email_notifications?: boolean | null
          language?: string | null
          sms_notifications?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_customer_ltv"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_worker_performance"
            referencedColumns: ["worker_id"]
          },
        ]
      }
    }
    Views: {
      mv_event_summary: {
        Row: {
          event_date: string | null
          event_id: number | null
          is_active: boolean | null
          net_profit: number | null
          package_count: number | null
          refreshed_at: string | null
          title: string | null
          total_expenses: number | null
          total_orders: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      v_customer_ltv: {
        Row: {
          avg_order_value: number | null
          days_since_last_order: number | null
          email: string | null
          last_order_date: string | null
          name: string | null
          registered_at: string | null
          total_orders: number | null
          total_spent: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v_daily_revenue: {
        Row: {
          order_count: number | null
          order_date: string | null
          refunds: number | null
          revenue: number | null
          unique_customers: number | null
        }
        Relationships: []
      }
      v_deliverable_tracking: {
        Row: {
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          deliverable_id: number | null
          deliverable_type: string | null
          event_title: string | null
          is_downloaded: boolean | null
          link_status: string | null
          order_id: number | null
          package_name: string | null
          pipeline_stage: string | null
        }
        Relationships: []
      }
      v_event_analytics: {
        Row: {
          avg_package_price: number | null
          event_date: string | null
          event_id: number | null
          gross_revenue: number | null
          is_active: boolean | null
          location: string | null
          net_profit: number | null
          package_count: number | null
          title: string | null
          total_expenses: number | null
          total_orders: number | null
          unique_customers: number | null
        }
        Relationships: []
      }
      v_event_revenue: {
        Row: {
          event_date: string | null
          event_id: number | null
          event_title: string | null
          location: string | null
          net_profit: number | null
          paid_revenue: number | null
          refunded_amount: number | null
          total_expenses: number | null
          total_orders: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      v_expense_breakdown: {
        Row: {
          category: string | null
          event_id: number | null
          event_title: string | null
          expense_count: number | null
          total_amount: number | null
        }
        Relationships: []
      }
      v_monthly_growth: {
        Row: {
          month: string | null
          orders: number | null
          prev_month_revenue: number | null
          revenue: number | null
          revenue_growth_pct: number | null
        }
        Relationships: []
      }
      v_order_summary: {
        Row: {
          amount: number | null
          assignee_id: string | null
          event_date: string | null
          event_id: number | null
          event_title: string | null
          order_date: string | null
          order_id: number | null
          order_status: string | null
          package_id: number | null
          package_name: string | null
          package_price: number | null
          pipeline_stage: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
          worker_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_customer_ltv"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_worker_performance"
            referencedColumns: ["worker_id"]
          },
          {
            foreignKeyName: "pipeline_cards_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_cards_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "v_customer_ltv"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "pipeline_cards_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "v_worker_performance"
            referencedColumns: ["worker_id"]
          },
        ]
      }
      v_package_performance: {
        Row: {
          event_id: number | null
          event_title: string | null
          is_sold_out: boolean | null
          package_id: number | null
          package_name: string | null
          price: number | null
          times_sold: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      v_pipeline_bottleneck: {
        Row: {
          avg_hours_in_stage: number | null
          card_count: number | null
          max_hours_in_stage: number | null
          stage: string | null
          unassigned_count: number | null
        }
        Relationships: []
      }
      v_pipeline_overview: {
        Row: {
          count: number | null
          percentage: number | null
          stage: string | null
        }
        Relationships: []
      }
      v_worker_performance: {
        Row: {
          assigned_cards: number | null
          avg_completion_hours: number | null
          commission_rate: number | null
          completed_cards: number | null
          role: string | null
          worker_id: string | null
          worker_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      bulk_assign_pipeline: {
        Args: { p_assignee_id: string; p_card_ids: number[] }
        Returns: Json
      }
      check_is_admin: { Args: never; Returns: boolean }
      check_is_staff: { Args: never; Returns: boolean }
      cleanup_old_logs: { Args: { p_days?: number }; Returns: number }
      duplicate_event: {
        Args: { p_event_id: number; p_new_date: string; p_new_title: string }
        Returns: number
      }
      get_comprehensive_stats: { Args: never; Returns: Json }
      get_customer_orders: {
        Args: { p_user_id: string }
        Returns: {
          amount: number
          event_title: string
          order_date: string
          order_id: number
          package_name: string
          pipeline_stage: string
          status: string
        }[]
      }
      get_customer_segments: { Args: never; Returns: Json }
      get_dashboard_stats: { Args: never; Returns: Json }
      get_event_profitability: { Args: { p_event_id: number }; Returns: Json }
      get_monthly_revenue: {
        Args: { p_year?: number }
        Returns: {
          month: number
          order_count: number
          revenue: number
        }[]
      }
      get_quick_stats: {
        Args: never
        Returns: {
          metric: string
          value: number
        }[]
      }
      get_top_packages: {
        Args: { p_limit?: number }
        Returns: {
          event_title: string
          package_id: number
          package_name: string
          times_sold: number
          total_revenue: number
        }[]
      }
      get_weekly_stats: { Args: never; Returns: Json }
      log_activity: {
        Args: {
          p_action: string
          p_entity_id?: string
          p_entity_type?: string
          p_metadata?: Json
          p_new_value?: Json
          p_old_value?: Json
        }
        Returns: undefined
      }
      refresh_materialized_views: { Args: never; Returns: undefined }
      search_orders: {
        Args: { p_query: string }
        Returns: {
          amount: number
          created_at: string
          event_title: string
          order_id: number
          package_name: string
          status: string
          user_email: string
          user_name: string
        }[]
      }
      update_pipeline_stage: {
        Args: { p_assignee_id?: string; p_card_id: number; p_new_stage: string }
        Returns: Json
      }
      upsert_setting: {
        Args: { setting_key: string; setting_value: string }
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

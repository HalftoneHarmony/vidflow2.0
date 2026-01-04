/**
 * 🗄️ Supabase Database Types
 * 
 * VidFlow Manager 2.0 Database Types
 * 새로 추가된 테이블들(announcements, contact_submissions, activity_logs, user_preferences) 포함
 * 
 * @author Agent 4 (Backend/Integration Master)
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    name: string
                    role: "ADMIN" | "EDITOR" | "USER"
                    phone: string | null
                    commission_rate: number
                    created_at: string
                }
                Insert: {
                    id: string
                    email: string
                    name: string
                    role?: "ADMIN" | "EDITOR" | "USER"
                    phone?: string | null
                    commission_rate?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    name?: string
                    role?: "ADMIN" | "EDITOR" | "USER"
                    phone?: string | null
                    commission_rate?: number
                    created_at?: string
                }
            }
            events: {
                Row: {
                    id: number
                    title: string
                    event_date: string
                    location: string | null
                    is_active: boolean
                    thumbnail_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: number
                    title: string
                    event_date: string
                    location?: string | null
                    is_active?: boolean
                    thumbnail_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: number
                    title?: string
                    event_date?: string
                    location?: string | null
                    is_active?: boolean
                    thumbnail_url?: string | null
                    created_at?: string
                }
            }
            packages: {
                Row: {
                    id: number
                    event_id: number | null
                    name: string
                    price: number
                    description: string | null
                    composition: Json
                    specs: Json | null
                    is_sold_out: boolean
                }
                Insert: {
                    id?: number
                    event_id?: number | null
                    name: string
                    price: number
                    description?: string | null
                    composition?: Json
                    specs?: Json | null
                    is_sold_out?: boolean
                }
                Update: {
                    id?: number
                    event_id?: number | null
                    name?: string
                    price?: number
                    description?: string | null
                    composition?: Json
                    specs?: Json | null
                    is_sold_out?: boolean
                }
            }
            showcase_items: {
                Row: {
                    id: number
                    package_id: number | null
                    type: "VIDEO" | "IMAGE" | null
                    media_url: string
                    thumbnail_url: string | null
                    is_best_cut: boolean
                }
                Insert: {
                    id?: number
                    package_id?: number | null
                    type?: "VIDEO" | "IMAGE" | null
                    media_url: string
                    thumbnail_url?: string | null
                    is_best_cut?: boolean
                }
                Update: {
                    id?: number
                    package_id?: number | null
                    type?: "VIDEO" | "IMAGE" | null
                    media_url?: string
                    thumbnail_url?: string | null
                    is_best_cut?: boolean
                }
            }
            orders: {
                Row: {
                    id: number
                    user_id: string | null
                    event_id: number | null
                    package_id: number | null
                    payment_id: string | null
                    amount: number
                    status: "PENDING" | "PAID" | "REFUNDED"
                    created_at: string
                }
                Insert: {
                    id?: number
                    user_id?: string | null
                    event_id?: number | null
                    package_id?: number | null
                    payment_id?: string | null
                    amount: number
                    status?: "PENDING" | "PAID" | "REFUNDED"
                    created_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string | null
                    event_id?: number | null
                    package_id?: number | null
                    payment_id?: string | null
                    amount?: number
                    status?: "PENDING" | "PAID" | "REFUNDED"
                    created_at?: string
                }
            }
            pipeline_cards: {
                Row: {
                    id: number
                    order_id: number | null
                    stage: "WAITING" | "SHOOTING" | "EDITING" | "READY" | "DELIVERED"
                    assignee_id: string | null
                    stage_entered_at: string
                    updated_at: string
                }
                Insert: {
                    id?: number
                    order_id?: number | null
                    stage?: "WAITING" | "SHOOTING" | "EDITING" | "READY" | "DELIVERED"
                    assignee_id?: string | null
                    stage_entered_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: number
                    order_id?: number | null
                    stage?: "WAITING" | "SHOOTING" | "EDITING" | "READY" | "DELIVERED"
                    assignee_id?: string | null
                    stage_entered_at?: string
                    updated_at?: string
                }
            }
            deliverables: {
                Row: {
                    id: number
                    card_id: number | null
                    type: string
                    external_link_url: string | null
                    link_status: "UNCHECKED" | "VALID" | "INVALID"
                    link_last_checked_at: string | null
                    is_downloaded: boolean
                    first_downloaded_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: number
                    card_id?: number | null
                    type: string
                    external_link_url?: string | null
                    link_status?: "UNCHECKED" | "VALID" | "INVALID"
                    link_last_checked_at?: string | null
                    is_downloaded?: boolean
                    first_downloaded_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: number
                    card_id?: number | null
                    type?: string
                    external_link_url?: string | null
                    link_status?: "UNCHECKED" | "VALID" | "INVALID"
                    link_last_checked_at?: string | null
                    is_downloaded?: boolean
                    first_downloaded_at?: string | null
                    created_at?: string
                }
            }
            expenses: {
                Row: {
                    id: number
                    event_id: number | null
                    category: "LABOR" | "FOOD" | "TRAVEL" | "EQUIPMENT" | "ETC"
                    description: string | null
                    amount: number
                    is_auto_generated: boolean
                    related_worker_id: string | null
                    expensed_at: string
                }
                Insert: {
                    id?: number
                    event_id?: number | null
                    category: "LABOR" | "FOOD" | "TRAVEL" | "EQUIPMENT" | "ETC"
                    description?: string | null
                    amount: number
                    is_auto_generated?: boolean
                    related_worker_id?: string | null
                    expensed_at?: string
                }
                Update: {
                    id?: number
                    event_id?: number | null
                    category?: "LABOR" | "FOOD" | "TRAVEL" | "EQUIPMENT" | "ETC"
                    description?: string | null
                    amount?: number
                    is_auto_generated?: boolean
                    related_worker_id?: string | null
                    expensed_at?: string
                }
            }
            // =============================================
            // 새로 추가된 테이블들
            // =============================================
            announcements: {
                Row: {
                    id: number
                    title: string
                    content: string
                    type: "info" | "warning" | "promotion" | "maintenance" | "urgent"
                    target_audience: string
                    is_pinned: boolean
                    is_active: boolean
                    starts_at: string
                    expires_at: string | null
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: number
                    title: string
                    content: string
                    type?: "info" | "warning" | "promotion" | "maintenance" | "urgent"
                    target_audience?: string
                    is_pinned?: boolean
                    is_active?: boolean
                    starts_at?: string
                    expires_at?: string | null
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: number
                    title?: string
                    content?: string
                    type?: "info" | "warning" | "promotion" | "maintenance" | "urgent"
                    target_audience?: string
                    is_pinned?: boolean
                    is_active?: boolean
                    starts_at?: string
                    expires_at?: string | null
                    created_by?: string | null
                    created_at?: string
                }
            }
            contact_submissions: {
                Row: {
                    id: number
                    name: string
                    email: string
                    subject: string | null
                    message: string
                    category: string
                    status: "pending" | "in_progress" | "resolved" | "closed"
                    admin_notes: string | null
                    responded_at: string | null
                    responded_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: number
                    name: string
                    email: string
                    subject?: string | null
                    message: string
                    category?: string
                    status?: "pending" | "in_progress" | "resolved" | "closed"
                    admin_notes?: string | null
                    responded_at?: string | null
                    responded_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: number
                    name?: string
                    email?: string
                    subject?: string | null
                    message?: string
                    category?: string
                    status?: "pending" | "in_progress" | "resolved" | "closed"
                    admin_notes?: string | null
                    responded_at?: string | null
                    responded_by?: string | null
                    created_at?: string
                }
            }
            activity_logs: {
                Row: {
                    id: number
                    user_id: string | null
                    action: string
                    entity_type: string | null
                    entity_id: string | null
                    old_value: Json | null
                    new_value: Json | null
                    created_at: string
                }
                Insert: {
                    id?: number
                    user_id?: string | null
                    action: string
                    entity_type?: string | null
                    entity_id?: string | null
                    old_value?: Json | null
                    new_value?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string | null
                    action?: string
                    entity_type?: string | null
                    entity_id?: string | null
                    old_value?: Json | null
                    new_value?: Json | null
                    created_at?: string
                }
            }
            user_preferences: {
                Row: {
                    user_id: string
                    email_notifications: boolean
                    sms_notifications: boolean
                    language: string
                    timezone: string
                    theme: "light" | "dark" | "system"
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    user_id: string
                    email_notifications?: boolean
                    sms_notifications?: boolean
                    language?: string
                    timezone?: string
                    theme?: "light" | "dark" | "system"
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    user_id?: string
                    email_notifications?: boolean
                    sms_notifications?: boolean
                    language?: string
                    timezone?: string
                    theme?: "light" | "dark" | "system"
                    created_at?: string
                    updated_at?: string
                }
            }
            about_content: {
                Row: {
                    id: number
                    section: string
                    content: string
                    order_index: number
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: number
                    section: string
                    content: string
                    order_index?: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: number
                    section?: string
                    content?: string
                    order_index?: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            faq_items: {
                Row: {
                    id: number
                    question: string
                    answer: string
                    category: string
                    order_index: number
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: number
                    question: string
                    answer: string
                    category?: string
                    order_index?: number
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: number
                    question?: string
                    answer?: string
                    category?: string
                    order_index?: number
                    is_active?: boolean
                    created_at?: string
                }
            }
        }
        Views: {
            v_daily_revenue: {
                Row: {
                    order_date: string
                    total_orders: number
                    total_revenue: number
                    avg_order_value: number
                }
            }
            v_monthly_growth: {
                Row: {
                    month: string
                    revenue: number
                    orders: number
                    new_customers: number
                    growth_rate: number
                }
            }
            v_customer_ltv: {
                Row: {
                    user_id: string
                    name: string
                    email: string
                    total_orders: number
                    total_spent: number
                    first_order_date: string
                    last_order_date: string
                }
            }
            v_event_analytics: {
                Row: {
                    event_id: number
                    title: string
                    event_date: string
                    total_orders: number
                    total_revenue: number
                    total_expenses: number
                    net_profit: number
                    unique_customers: number
                }
            }
            v_pipeline_bottleneck: {
                Row: {
                    stage: string
                    card_count: number
                    avg_days_in_stage: number
                    max_days_in_stage: number
                }
            }
            v_pipeline_overview: {
                Row: {
                    stage: string
                    count: number
                    percentage: number
                }
            }
        }
        Functions: {
            get_comprehensive_stats: {
                Args: Record<string, never>
                Returns: Json
            }
            get_event_profitability: {
                Args: { p_event_id: number }
                Returns: Json
            }
            get_customer_segments: {
                Args: Record<string, never>
                Returns: Json
            }
            get_weekly_stats: {
                Args: Record<string, never>
                Returns: Json
            }
            get_quick_stats: {
                Args: Record<string, never>
                Returns: Array<{ metric: string; value: number }>
            }
            search_orders: {
                Args: { p_query: string }
                Returns: Json[]
            }
            duplicate_event: {
                Args: { p_event_id: number; p_new_title: string; p_new_date: string }
                Returns: number
            }
            log_activity: {
                Args: {
                    p_action: string
                    p_entity_type?: string | null
                    p_entity_id?: string | null
                    p_old_value?: Json | null
                    p_new_value?: Json | null
                }
                Returns: void
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}

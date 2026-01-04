/**
 * 🗄️ Supabase Database Types
 *
 * TODO: Run `npx supabase gen types typescript` to generate actual types
 * For now, we define placeholder types that match our schema
 */

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    name: string;
                    role: "ADMIN" | "EDITOR" | "USER";
                    phone: string | null;
                    commission_rate: number;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    name: string;
                    role?: "ADMIN" | "EDITOR" | "USER";
                    phone?: string | null;
                    commission_rate?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    name?: string;
                    role?: "ADMIN" | "EDITOR" | "USER";
                    phone?: string | null;
                    commission_rate?: number;
                    created_at?: string;
                };
            };
            events: {
                Row: {
                    id: number;
                    title: string;
                    event_date: string;
                    location: string | null;
                    is_active: boolean;
                    thumbnail_url: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: number;
                    title: string;
                    event_date: string;
                    location?: string | null;
                    is_active?: boolean;
                    thumbnail_url?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: number;
                    title?: string;
                    event_date?: string;
                    location?: string | null;
                    is_active?: boolean;
                    thumbnail_url?: string | null;
                    created_at?: string;
                };
            };
            packages: {
                Row: {
                    id: number;
                    event_id: number;
                    name: string;
                    price: number;
                    description: string | null;
                    composition: string[];
                    specs: Record<string, string> | null;
                    is_sold_out: boolean;
                };
                Insert: {
                    id?: number;
                    event_id: number;
                    name: string;
                    price: number;
                    description?: string | null;
                    composition?: string[];
                    specs?: Record<string, string> | null;
                    is_sold_out?: boolean;
                };
                Update: {
                    id?: number;
                    event_id?: number;
                    name?: string;
                    price?: number;
                    description?: string | null;
                    composition?: string[];
                    specs?: Record<string, string> | null;
                    is_sold_out?: boolean;
                };
            };
            showcase_items: {
                Row: {
                    id: number;
                    package_id: number;
                    type: "VIDEO" | "IMAGE";
                    media_url: string;
                    thumbnail_url: string | null;
                    is_best_cut: boolean;
                };
                Insert: {
                    id?: number;
                    package_id: number;
                    type: "VIDEO" | "IMAGE";
                    media_url: string;
                    thumbnail_url?: string | null;
                    is_best_cut?: boolean;
                };
                Update: {
                    id?: number;
                    package_id?: number;
                    type?: "VIDEO" | "IMAGE";
                    media_url?: string;
                    thumbnail_url?: string | null;
                    is_best_cut?: boolean;
                };
            };
            orders: {
                Row: {
                    id: number;
                    user_id: string;
                    event_id: number;
                    package_id: number;
                    payment_id: string;
                    amount: number;
                    status: "PENDING" | "PAID" | "REFUNDED";
                    created_at: string;
                };
                Insert: {
                    id?: number;
                    user_id: string;
                    event_id: number;
                    package_id: number;
                    payment_id: string;
                    amount: number;
                    status?: "PENDING" | "PAID" | "REFUNDED";
                    created_at?: string;
                };
                Update: {
                    id?: number;
                    user_id?: string;
                    event_id?: number;
                    package_id?: number;
                    payment_id?: string;
                    amount?: number;
                    status?: "PENDING" | "PAID" | "REFUNDED";
                    created_at?: string;
                };
            };
            pipeline_cards: {
                Row: {
                    id: number;
                    order_id: number;
                    stage: "WAITING" | "EDITING" | "READY" | "DELIVERED";
                    assignee_id: string | null;
                    stage_entered_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: number;
                    order_id: number;
                    stage?: "WAITING" | "SHOOTING" | "EDITING" | "READY" | "DELIVERED";
                    assignee_id?: string | null;
                    stage_entered_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: number;
                    order_id?: number;
                    stage?: "WAITING" | "SHOOTING" | "EDITING" | "READY" | "DELIVERED";
                    assignee_id?: string | null;
                    stage_entered_at?: string;
                    updated_at?: string;
                };
            };
            deliverables: {
                Row: {
                    id: number;
                    card_id: number;
                    type: string;
                    external_link_url: string | null;
                    link_status: "UNCHECKED" | "VALID" | "INVALID";
                    link_last_checked_at: string | null;
                    is_downloaded: boolean;
                    first_downloaded_at: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: number;
                    card_id: number;
                    type: string;
                    external_link_url?: string | null;
                    link_status?: "UNCHECKED" | "VALID" | "INVALID";
                    link_last_checked_at?: string | null;
                    is_downloaded?: boolean;
                    first_downloaded_at?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: number;
                    card_id?: number;
                    type?: string;
                    external_link_url?: string | null;
                    link_status?: "UNCHECKED" | "VALID" | "INVALID";
                    link_last_checked_at?: string | null;
                    is_downloaded?: boolean;
                    first_downloaded_at?: string | null;
                    created_at?: string;
                };
            };
            expenses: {
                Row: {
                    id: number;
                    event_id: number;
                    category: "LABOR" | "FOOD" | "TRAVEL" | "EQUIPMENT" | "ETC";
                    description: string | null;
                    amount: number;
                    is_auto_generated: boolean;
                    related_worker_id: string | null;
                    expensed_at: string;
                };
                Insert: {
                    id?: number;
                    event_id: number;
                    category: "LABOR" | "FOOD" | "TRAVEL" | "EQUIPMENT" | "ETC";
                    description?: string | null;
                    amount: number;
                    is_auto_generated?: boolean;
                    related_worker_id?: string | null;
                    expensed_at?: string;
                };
                Update: {
                    id?: number;
                    event_id?: number;
                    category?: "LABOR" | "FOOD" | "TRAVEL" | "EQUIPMENT" | "ETC";
                    description?: string | null;
                    amount?: number;
                    is_auto_generated?: boolean;
                    related_worker_id?: string | null;
                    expensed_at?: string;
                };
            };
            general_settings: {
                Row: {
                    key: string;
                    value: string;
                    description: string | null;
                    updated_at: string;
                    updated_by: string | null;
                };
                Insert: {
                    key: string;
                    value: string;
                    description?: string | null;
                    updated_at?: string;
                    updated_by?: string | null;
                };
                Update: {
                    key?: string;
                    value?: string;
                    description?: string | null;
                    updated_at?: string;
                    updated_by?: string | null;
                };
            };
            faqs: {
                Row: {
                    id: number;
                    question: string;
                    answer: string;
                    category: "general" | "payment" | "delivery" | "account" | "technical";
                    sort_order: number;
                    is_published: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: number;
                    question: string;
                    answer: string;
                    category?: "general" | "payment" | "delivery" | "account" | "technical";
                    sort_order?: number;
                    is_published?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: number;
                    question?: string;
                    answer?: string;
                    category?: "general" | "payment" | "delivery" | "account" | "technical";
                    sort_order?: number;
                    is_published?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            legal_documents: {
                Row: {
                    id: number;
                    type: "privacy" | "terms" | "cookie" | "refund";
                    title: string;
                    content: string;
                    version: string;
                    is_active: boolean;
                    published_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: number;
                    type: "privacy" | "terms" | "cookie" | "refund";
                    title: string;
                    content: string;
                    version?: string;
                    is_active?: boolean;
                    published_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: number;
                    type?: "privacy" | "terms" | "cookie" | "refund";
                    title?: string;
                    content?: string;
                    version?: string;
                    is_active?: boolean;
                    published_at?: string;
                    updated_at?: string;
                };
            };
            contact_submissions: {
                Row: {
                    id: number;
                    name: string;
                    email: string;
                    subject: string | null;
                    message: string;
                    category: "general" | "support" | "partnership" | "complaint" | "feedback";
                    status: "pending" | "in_progress" | "resolved" | "closed";
                    user_id: string | null;
                    admin_notes: string | null;
                    responded_at: string | null;
                    responded_by: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: number;
                    name: string;
                    email: string;
                    subject?: string | null;
                    message: string;
                    category?: "general" | "support" | "partnership" | "complaint" | "feedback";
                    status?: "pending" | "in_progress" | "resolved" | "closed";
                    user_id?: string | null;
                    admin_notes?: string | null;
                    responded_at?: string | null;
                    responded_by?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: number;
                    name?: string;
                    email?: string;
                    subject?: string | null;
                    message?: string;
                    category?: "general" | "support" | "partnership" | "complaint" | "feedback";
                    status?: "pending" | "in_progress" | "resolved" | "closed";
                    user_id?: string | null;
                    admin_notes?: string | null;
                    responded_at?: string | null;
                    responded_by?: string | null;
                    created_at?: string;
                };
            };
            announcements: {
                Row: {
                    id: number;
                    title: string;
                    content: string;
                    type: "info" | "warning" | "promotion" | "maintenance" | "urgent";
                    target_audience: "all" | "users" | "admins" | "editors";
                    is_pinned: boolean;
                    is_active: boolean;
                    starts_at: string;
                    expires_at: string | null;
                    created_by: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: number;
                    title: string;
                    content: string;
                    type?: "info" | "warning" | "promotion" | "maintenance" | "urgent";
                    target_audience?: "all" | "users" | "admins" | "editors";
                    is_pinned?: boolean;
                    is_active?: boolean;
                    starts_at?: string;
                    expires_at?: string | null;
                    created_by?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: number;
                    title?: string;
                    content?: string;
                    type?: "info" | "warning" | "promotion" | "maintenance" | "urgent";
                    target_audience?: "all" | "users" | "admins" | "editors";
                    is_pinned?: boolean;
                    is_active?: boolean;
                    starts_at?: string;
                    expires_at?: string | null;
                    created_by?: string | null;
                    created_at?: string;
                };
            };
            activity_logs: {
                Row: {
                    id: number;
                    user_id: string | null;
                    action: string;
                    entity_type: string | null;
                    entity_id: string | null;
                    old_value: Record<string, unknown> | null;
                    new_value: Record<string, unknown> | null;
                    metadata: Record<string, unknown> | null;
                    ip_address: string | null;
                    user_agent: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: number;
                    user_id?: string | null;
                    action: string;
                    entity_type?: string | null;
                    entity_id?: string | null;
                    old_value?: Record<string, unknown> | null;
                    new_value?: Record<string, unknown> | null;
                    metadata?: Record<string, unknown> | null;
                    ip_address?: string | null;
                    user_agent?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: number;
                    user_id?: string | null;
                    action?: string;
                    entity_type?: string | null;
                    entity_id?: string | null;
                    old_value?: Record<string, unknown> | null;
                    new_value?: Record<string, unknown> | null;
                    metadata?: Record<string, unknown> | null;
                    ip_address?: string | null;
                    user_agent?: string | null;
                    created_at?: string;
                };
            };
            user_preferences: {
                Row: {
                    user_id: string;
                    email_notifications: boolean;
                    sms_notifications: boolean;
                    language: string;
                    timezone: string;
                    theme: "light" | "dark" | "system";
                    updated_at: string;
                };
                Insert: {
                    user_id: string;
                    email_notifications?: boolean;
                    sms_notifications?: boolean;
                    language?: string;
                    timezone?: string;
                    theme?: "light" | "dark" | "system";
                    updated_at?: string;
                };
                Update: {
                    user_id?: string;
                    email_notifications?: boolean;
                    sms_notifications?: boolean;
                    language?: string;
                    timezone?: string;
                    theme?: "light" | "dark" | "system";
                    updated_at?: string;
                };
            };
        };
        Views: {
            v_order_summary: {
                Row: {
                    order_id: number;
                    user_id: string;
                    user_name: string;
                    user_email: string;
                    event_id: number;
                    event_title: string;
                    event_date: string;
                    package_id: number;
                    package_name: string;
                    package_price: number;
                    amount: number;
                    order_status: string;
                    pipeline_stage: string;
                    assignee_id: string | null;
                    worker_name: string | null;
                    order_date: string;
                };
            };
            v_event_revenue: {
                Row: {
                    event_id: number;
                    event_title: string;
                    event_date: string;
                    location: string | null;
                    total_orders: number;
                    total_revenue: number;
                    paid_revenue: number;
                    refunded_amount: number;
                    total_expenses: number;
                    net_profit: number;
                };
            };
            v_package_performance: {
                Row: {
                    package_id: number;
                    package_name: string;
                    price: number;
                    event_id: number;
                    event_title: string;
                    times_sold: number;
                    total_revenue: number;
                    is_sold_out: boolean;
                };
            };
            v_pipeline_overview: {
                Row: {
                    stage: string;
                    count: number;
                    percentage: number;
                };
            };
            v_worker_performance: {
                Row: {
                    worker_id: string;
                    worker_name: string;
                    role: string;
                    commission_rate: number;
                    assigned_cards: number;
                    completed_cards: number;
                    avg_completion_hours: number | null;
                };
            };
        };
        Functions: {
            get_dashboard_stats: {
                Args: Record<string, never>;
                Returns: Record<string, unknown>;
            };
            log_activity: {
                Args: {
                    p_action: string;
                    p_entity_type?: string;
                    p_entity_id?: string;
                    p_old_value?: Record<string, unknown>;
                    p_new_value?: Record<string, unknown>;
                    p_metadata?: Record<string, unknown>;
                };
                Returns: void;
            };
            get_monthly_revenue: {
                Args: {
                    p_year?: number;
                };
                Returns: Array<{
                    month: number;
                    revenue: number;
                    order_count: number;
                }>;
            };
            get_top_packages: {
                Args: {
                    p_limit?: number;
                };
                Returns: Array<{
                    package_id: number;
                    package_name: string;
                    event_title: string;
                    times_sold: number;
                    total_revenue: number;
                }>;
            };
            upsert_setting: {
                Args: {
                    setting_key: string;
                    setting_value: string;
                };
                Returns: void;
            };
        };
        Enums: Record<string, never>;
    };
};
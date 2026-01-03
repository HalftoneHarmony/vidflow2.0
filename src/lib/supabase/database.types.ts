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
                    stage: "WAITING" | "SHOOTING" | "EDITING" | "READY" | "DELIVERED";
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
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
    };
};
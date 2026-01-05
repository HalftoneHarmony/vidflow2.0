"use server";

import { createClient } from "@/lib/supabase/server";

// =============================================
// Types
// =============================================

export type UpsellCandidate = {
    user_id: string;
    customer_name: string;
    customer_email: string;
    phone: string | null;
    order_id: number;
    paid_amount: number;
    order_date: string;
    event_id: number;
    event_title: string;
    event_date: string;
    package_id: number;
    package_name: string;
    package_price: number;
    pipeline_stage: string;
    delivered_at: string;
    upgrade_options: {
        id: number;
        name: string;
        price: number;
        price_diff: number;
        upgrade_value_pct: number;
    }[] | null;
    upsell_priority_score: number;
    days_since_delivery: number;
    customer_ltv: number;
    total_orders: number;
};

export type SegmentCriteria = {
    minSpent?: number;
    maxSpent?: number;
    minOrders?: number;
    maxOrders?: number;
    minDaysSinceOrder?: number;
    maxDaysSinceOrder?: number;
    hasDelivered?: boolean;
};

export type SegmentCustomer = {
    user_id: string;
    customer_name: string;
    customer_email: string;
    phone: string | null;
    total_spent: number;
    total_orders: number;
    last_order_date: string;
    days_since_last_order: number;
    events_participated: string[];
    packages_purchased: string[];
};

export type UpsellSummary = {
    total_candidates: number;
    high_priority: number;
    medium_priority: number;
    low_priority: number;
    potential_revenue: number;
    recent_deliveries: number;
    active_campaigns: number;
    total_conversions: number;
};

export type SegmentCount = {
    count: number;
    total_value: number;
    avg_value: number;
};

// =============================================
// 업셀링 후보 조회
// =============================================

export async function getUpsellCandidates(
    limit: number = 50,
    minPriority?: number
): Promise<UpsellCandidate[]> {
    const supabase = await createClient();

    let query = supabase
        .from("v_upsell_candidates")
        .select("*")
        .order("upsell_priority_score", { ascending: false })
        .limit(limit);

    if (minPriority) {
        query = query.gte("upsell_priority_score", minPriority);
    }

    const { data, error } = await query;

    if (error) {
        console.error("[CRM] Error fetching upsell candidates:", error);
        return [];
    }

    return (data || []) as UpsellCandidate[];
}

// 이벤트별 업셀링 후보 조회
export async function getUpsellCandidatesByEvent(
    eventId: number
): Promise<UpsellCandidate[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("v_upsell_candidates")
        .select("*")
        .eq("event_id", eventId)
        .order("upsell_priority_score", { ascending: false });

    if (error) {
        console.error("[CRM] Error fetching upsell candidates by event:", error);
        return [];
    }

    return (data || []) as UpsellCandidate[];
}

// =============================================
// 업셀링 요약 통계
// =============================================

export async function getUpsellSummary(): Promise<UpsellSummary | null> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_upsell_summary");

    if (error) {
        console.error("[CRM] Error fetching upsell summary:", error);
        return null;
    }

    return data as UpsellSummary;
}

// =============================================
// 세그먼트 빌더
// =============================================

export async function getCustomerSegment(
    criteria: SegmentCriteria
): Promise<SegmentCustomer[]> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_customer_segment", {
        p_min_spent: criteria.minSpent || null,
        p_max_spent: criteria.maxSpent || null,
        p_min_orders: criteria.minOrders || null,
        p_max_orders: criteria.maxOrders || null,
        p_min_days_since_order: criteria.minDaysSinceOrder || null,
        p_max_days_since_order: criteria.maxDaysSinceOrder || null,
        p_has_delivered: criteria.hasDelivered ?? null,
    });

    if (error) {
        console.error("[CRM] Error fetching customer segment:", error);
        return [];
    }

    return (data || []) as SegmentCustomer[];
}

export async function countCustomerSegment(
    criteria: SegmentCriteria
): Promise<SegmentCount | null> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("count_customer_segment", {
        p_min_spent: criteria.minSpent || null,
        p_max_spent: criteria.maxSpent || null,
        p_min_orders: criteria.minOrders || null,
        p_max_orders: criteria.maxOrders || null,
        p_min_days_since_order: criteria.minDaysSinceOrder || null,
        p_max_days_since_order: criteria.maxDaysSinceOrder || null,
        p_has_delivered: criteria.hasDelivered ?? null,
    });

    if (error) {
        console.error("[CRM] Error counting customer segment:", error);
        return null;
    }

    return data as SegmentCount;
}

// =============================================
// 이벤트 목록 조회 (필터용)
// =============================================

export async function getEventsForFilter() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("events")
        .select("id, title, event_date")
        .order("event_date", { ascending: false });

    if (error) {
        console.error("[CRM] Error fetching events:", error);
        return [];
    }

    return data || [];
}

// =============================================
// 패키지 목록 조회 (이벤트 기준)
// =============================================

export async function getPackagesByEvent(eventId: number) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("packages")
        .select("id, name, price")
        .eq("event_id", eventId)
        .order("price", { ascending: true });

    if (error) {
        console.error("[CRM] Error fetching packages:", error);
        return [];
    }

    return data || [];
}

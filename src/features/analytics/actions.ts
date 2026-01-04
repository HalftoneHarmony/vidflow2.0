"use server";

import { createClient } from "@/lib/supabase/server";

// =============================================
// 대시보드 통계 관련
// =============================================

export type DashboardStats = {
    today: { orders: number; revenue: number };
    this_month: { orders: number; revenue: number; new_users: number };
    all_time: { total_revenue: number; total_orders: number; total_customers: number; avg_order_value: number };
    pipeline: { waiting: number; shooting: number; editing: number; ready: number; delivered: number; unassigned: number };
    active_events: number;
    pending_contacts: number;
};

// 종합 대시보드 통계 조회 (DB 함수 사용)
export async function getComprehensiveStats(): Promise<DashboardStats | null> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_comprehensive_stats");

    if (error) {
        console.error("Error fetching comprehensive stats:", error);
        return null;
    }

    return data as DashboardStats;
}

// 빠른 통계 조회
export async function getQuickStats(): Promise<Record<string, number>> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_quick_stats");

    if (error) {
        console.error("Error fetching quick stats:", error);
        return {};
    }

    // Convert array to object
    const stats: Record<string, number> = {};
    if (Array.isArray(data)) {
        data.forEach((item: { metric: string; value: number }) => {
            stats[item.metric] = item.value;
        });
    }

    return stats;
}

// =============================================
// 이벤트 분석 관련
// =============================================

export type EventProfitability = {
    event_id: number;
    title: string;
    gross_revenue: number;
    total_expenses: number;
    net_profit: number;
    total_orders: number;
    unique_customers: number;
};

// 이벤트 수익성 분석
export async function getEventProfitability(eventId: number): Promise<EventProfitability | null> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_event_profitability", {
        p_event_id: eventId,
    });

    if (error) {
        console.error("Error fetching event profitability:", error);
        return null;
    }

    return data as EventProfitability;
}

// 이벤트 분석 뷰 조회
export async function getEventAnalytics() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("v_event_analytics")
        .select("*")
        .order("event_date", { ascending: false });

    if (error) {
        console.error("Error fetching event analytics:", error);
        return [];
    }

    return data || [];
}

// =============================================
// 고객 분석 관련
// =============================================

export type CustomerSegments = {
    vip: { count: number; total_revenue: number };
    repeat: { count: number };
    new: { count: number };
};

// 고객 세그먼트 분석
export async function getCustomerSegments(): Promise<CustomerSegments | null> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_customer_segments");

    if (error) {
        console.error("Error fetching customer segments:", error);
        return null;
    }

    return data as CustomerSegments;
}

// 고객 LTV 조회
export async function getCustomerLTV(limit: number = 20) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("v_customer_ltv")
        .select("*")
        .order("total_spent", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching customer LTV:", error);
        return [];
    }

    return data || [];
}

// =============================================
// 매출 분석 관련
// =============================================

// 일별 매출 조회
export async function getDailyRevenue(days: number = 30) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("v_daily_revenue")
        .select("*")
        .order("order_date", { ascending: false })
        .limit(days);

    if (error) {
        console.error("Error fetching daily revenue:", error);
        return [];
    }

    return data || [];
}

// 월별 성장률 조회
export async function getMonthlyGrowth() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("v_monthly_growth")
        .select("*")
        .order("month", { ascending: false })
        .limit(12);

    if (error) {
        console.error("Error fetching monthly growth:", error);
        return [];
    }

    return data || [];
}

// =============================================
// 파이프라인 분석 관련
// =============================================

// 파이프라인 병목 분석
export async function getPipelineBottleneck() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("v_pipeline_bottleneck")
        .select("*");

    if (error) {
        console.error("Error fetching pipeline bottleneck:", error);
        return [];
    }

    return data || [];
}

// 파이프라인 통계
export async function getPipelineOverview() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("v_pipeline_overview")
        .select("*");

    if (error) {
        console.error("Error fetching pipeline overview:", error);
        return [];
    }

    return data || [];
}

// =============================================
// 주간 통계
// =============================================

export type WeeklyStats = {
    week_start: string;
    orders: number;
    revenue: number;
    new_customers: number;
    completed_deliveries: number;
};

export async function getWeeklyStats(): Promise<WeeklyStats | null> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_weekly_stats");

    if (error) {
        console.error("Error fetching weekly stats:", error);
        return null;
    }

    return data as WeeklyStats;
}

// =============================================
// 검색
// =============================================

export async function searchOrders(query: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("search_orders", {
        p_query: query,
    });

    if (error) {
        console.error("Error searching orders:", error);
        return [];
    }

    return data || [];
}

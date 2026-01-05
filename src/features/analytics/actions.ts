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

export type EventAnalyticsData = {
    event_id: number;
    event_title: string;
    event_date: string;
    total_revenue: number; // View might return string or number depending on driver, casting carefully
    gross_revenue: number;
    net_profit: number;
    total_expenses: number;
    total_orders: number;
    package_counts: Record<string, number>;
};

// 이벤트 분석 뷰 조회 및 패키지 분포 집계
export async function getEventAnalytics(): Promise<EventAnalyticsData[]> {
    const supabase = await createClient();

    // 1. 기본 분석 데이터 조회 (뷰)
    const { data: analyticsData, error: analyticsError } = await supabase
        .from("v_event_analytics")
        .select("*")
        .order("event_date", { ascending: false });

    if (analyticsError) {
        console.error("Error fetching event analytics:", analyticsError);
        return [];
    }

    // 2. 패키지 분포 데이터 조회 (전체 주문 + 패키지 JOIN)
    // Note: 대규모 데이터셋에서는 성능 이슈가 있을 수 있으나 현재 규모에서는 괜찮음.
    // 추후 event_id 별로 분할 조회하거나 DB 함수로 이관 권장.
    const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("event_id, packages(name)");

    if (orderError) {
        console.error("Error fetching order packages:", orderError);
        // 실패해도 기본 데이터는 리턴
    }

    return (analyticsData || []).map((event: any) => {
        const eventOrders = orderData?.filter((o: any) => o.event_id === event.event_id) || [];

        // 패키지별 카운트 집계
        const package_counts = eventOrders.reduce((acc: Record<string, number>, curr: any) => {
            const pkg = curr.packages?.name || "Unspecified";
            acc[pkg] = (acc[pkg] || 0) + 1;
            return acc;
        }, {});

        return {
            event_id: event.event_id,
            event_title: event.title, // DB의 'title'을 프론트엔드가 기대하는 'event_title'로 매핑
            event_date: event.event_date,
            total_revenue: Number(event.gross_revenue || 0), // DB에서는 gross_revenue로 반환
            gross_revenue: Number(event.gross_revenue || 0),
            net_profit: Number(event.net_profit || 0),
            total_expenses: Number(event.total_expenses || 0),
            total_orders: Number(event.total_orders || 0),
            profit_margin: Number(event.profit_margin_pct || 0),
            package_counts
        };
    });
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

// =============================================
// 종목별(Discipline) 분석
// =============================================

export type DisciplineStats = {
    discipline: string;
    total_orders: number;
    total_revenue: number;
    package_breakdown: Record<string, number>;
    event_breakdown: Record<string, number>;
};

// 종목별 통계 조회
export async function getDisciplineAnalytics(): Promise<DisciplineStats[]> {
    const supabase = await createClient();

    // 주문 데이터와 패키지, 이벤트 정보 조회
    const { data: orders, error } = await supabase
        .from("orders")
        .select(`
            id,
            discipline,
            amount,
            event_id,
            package_id,
            packages (name),
            events (title)
        `);

    if (error) {
        console.error("Error fetching discipline analytics:", error);
        return [];
    }

    // 종목별로 집계
    const disciplineMap = new Map<string, {
        total_orders: number;
        total_revenue: number;
        package_breakdown: Record<string, number>;
        event_breakdown: Record<string, number>;
    }>();

    (orders || []).forEach((order: any) => {
        const discipline = order.discipline || "미지정";
        const packageName = order.packages?.name || "Unknown Package";
        const eventTitle = order.events?.title || "Unknown Event";
        const amount = Number(order.amount) || 0;

        if (!disciplineMap.has(discipline)) {
            disciplineMap.set(discipline, {
                total_orders: 0,
                total_revenue: 0,
                package_breakdown: {},
                event_breakdown: {},
            });
        }

        const stats = disciplineMap.get(discipline)!;
        stats.total_orders += 1;
        stats.total_revenue += amount;
        stats.package_breakdown[packageName] = (stats.package_breakdown[packageName] || 0) + 1;
        stats.event_breakdown[eventTitle] = (stats.event_breakdown[eventTitle] || 0) + 1;
    });

    // Map을 배열로 변환 & 정렬
    return Array.from(disciplineMap.entries())
        .map(([discipline, stats]) => ({
            discipline,
            ...stats,
        }))
        .sort((a, b) => b.total_orders - a.total_orders);
}

// 패키지별 통합 통계
export type PackageStats = {
    package_name: string;
    total_orders: number;
    total_revenue: number;
    discipline_breakdown: Record<string, number>;
};

export async function getPackageAnalytics(): Promise<PackageStats[]> {
    const supabase = await createClient();

    const { data: orders, error } = await supabase
        .from("orders")
        .select(`
            id,
            discipline,
            amount,
            packages (name)
        `);

    if (error) {
        console.error("Error fetching package analytics:", error);
        return [];
    }

    const packageMap = new Map<string, {
        total_orders: number;
        total_revenue: number;
        discipline_breakdown: Record<string, number>;
    }>();

    (orders || []).forEach((order: any) => {
        const packageName = order.packages?.name || "Unknown Package";
        const discipline = order.discipline || "미지정";
        const amount = Number(order.amount) || 0;

        if (!packageMap.has(packageName)) {
            packageMap.set(packageName, {
                total_orders: 0,
                total_revenue: 0,
                discipline_breakdown: {},
            });
        }

        const stats = packageMap.get(packageName)!;
        stats.total_orders += 1;
        stats.total_revenue += amount;
        stats.discipline_breakdown[discipline] = (stats.discipline_breakdown[discipline] || 0) + 1;
    });

    return Array.from(packageMap.entries())
        .map(([package_name, stats]) => ({
            package_name,
            ...stats,
        }))
        .sort((a, b) => b.total_orders - a.total_orders);
}

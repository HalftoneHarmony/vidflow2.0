/**
 * 💰 Finance Queries
 * 순수익 계산 및 재무 분석
 * Agent 7: Gold (The Treasurer)
 */

import { createClient } from "@/lib/supabase/server";

// ============================================
// Types
// ============================================

export type ProfitSummary = {
    totalRevenue: number;
    pgFees: number;
    fixedExpenses: number;
    laborCosts: number;
    netProfit: number;
    profitMargin: number; // 순이익률 (%)
};

export type Expense = {
    id: number;
    event_id: number | null;
    category: "LABOR" | "FOOD" | "TRAVEL" | "EQUIPMENT" | "ETC";
    description: string | null;
    amount: number;
    is_auto_generated: boolean;
    related_worker_id: string | null;
    expensed_at: string;
};

export type PackageROI = {
    packageId: number;
    packageName: string;
    price: number;
    salesCount: number;
    totalRevenue: number;
    avgProcessTime: number; // hours
    profitMargin: number; // %
    efficiency: number; // revenue per hour
};

// ============================================
// Constants & Config
// ============================================

/** 기본 PG사 수수료율 (PortOne 기준 3.5%) - DB 설정이 없을 경우 사용 */
const DEFAULT_PG_FEE_RATE = 0.035;

/** PG 수수료율 캐시 (서버 인스턴스 생명주기 동안 유지) */
let cachedPgFeeRate: number | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5분 캐시

/**
 * DB에서 PG 수수료율을 조회합니다.
 * 캐시를 사용하여 빈번한 DB 호출을 방지합니다.
 */
async function getPgFeeRate(): Promise<number> {
    const now = Date.now();

    // 캐시가 유효한 경우 캐시된 값 반환
    if (cachedPgFeeRate !== null && (now - cacheTimestamp) < CACHE_TTL_MS) {
        return cachedPgFeeRate;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("general_settings")
        .select("value")
        .eq("key", "pg_fee_rate")
        .single();

    if (error || !data?.value) {
        console.warn("[Finance] PG 수수료율 DB 조회 실패, 기본값 사용:", DEFAULT_PG_FEE_RATE);
        cachedPgFeeRate = DEFAULT_PG_FEE_RATE;
    } else {
        const parsed = parseFloat(data.value);
        cachedPgFeeRate = isNaN(parsed) ? DEFAULT_PG_FEE_RATE : parsed;
    }

    cacheTimestamp = now;
    return cachedPgFeeRate;
}

// ============================================
// Queries
// ============================================

/**
 * 이벤트별 순수익 계산
 * 공식: 순수익 = 총 매출 - (PG 수수료 + 고정 지출 + 인건비)
 */
export async function calculateNetProfit(eventId: number): Promise<ProfitSummary> {
    const supabase = await createClient();

    // 0. PG 수수료율 조회 (DB 또는 캐시)
    const pgFeeRate = await getPgFeeRate();

    // 1. 총 매출 조회 (PAID 상태만)
    const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("amount")
        .eq("event_id", eventId)
        .eq("status", "PAID");

    if (ordersError) {
        console.error("순수익 계산 실패 - 주문 조회:", ordersError);
        throw new Error("주문 데이터를 불러올 수 없습니다.");
    }

    const totalRevenue = orders?.reduce((sum, order) => sum + (order.amount || 0), 0) ?? 0;

    // 2. PG 수수료 계산 (DB에서 조회한 수수료율 적용)
    const pgFees = Math.round(totalRevenue * pgFeeRate);

    // 3. 지출 조회 (고정 지출 vs 자동 생성 인건비)
    const { data: expenses, error: expensesError } = await supabase
        .from("expenses")
        .select("amount, is_auto_generated")
        .eq("event_id", eventId);

    if (expensesError) {
        console.error("순수익 계산 실패 - 지출 조회:", expensesError);
        throw new Error("지출 데이터를 불러올 수 없습니다.");
    }

    // 고정 지출: is_auto_generated = false (식대, 이동비 등 수동 입력)
    const fixedExpenses = expenses
        ?.filter((e) => !e.is_auto_generated)
        .reduce((sum, e) => sum + (e.amount || 0), 0) ?? 0;

    // 인건비: is_auto_generated = true (DELIVERED 시 자동 생성)
    const laborCosts = expenses
        ?.filter((e) => e.is_auto_generated)
        .reduce((sum, e) => sum + (e.amount || 0), 0) ?? 0;

    // 4. 순수익 계산
    const netProfit = totalRevenue - pgFees - fixedExpenses - laborCosts;

    // 5. 순이익률 계산
    const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

    return {
        totalRevenue,
        pgFees,
        fixedExpenses,
        laborCosts,
        netProfit,
        profitMargin,
    };
}

/**
 * 이벤트별 지출 목록 조회
 */
export async function getExpensesByEvent(eventId: number): Promise<Expense[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("event_id", eventId)
        .order("expensed_at", { ascending: false });

    if (error) {
        console.error("지출 조회 실패:", error);
        throw new Error("지출 데이터를 불러올 수 없습니다.");
    }

    return data as Expense[];
}

/**
 * 패키지별 ROI (수익률) 분석
 * - 판매량 대비 공정 소요 시간 분석
 * - 가성비가 떨어지는 상품 식별
 */
export async function getPackageROI(packageId: number): Promise<PackageROI> {
    const supabase = await createClient();
    const pgFeeRate = await getPgFeeRate();

    // 1. 패키지 정보 조회
    const { data: packageData, error: packageError } = await supabase
        .from("packages")
        .select("id, name, price")
        .eq("id", packageId)
        .single();

    if (packageError || !packageData) {
        console.error("패키지 조회 실패:", packageError);
        throw new Error("패키지 정보를 불러올 수 없습니다.");
    }

    // 2. 해당 패키지 주문 및 파이프라인 카드 조회
    const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select(`
            id,
            amount,
            created_at,
            pipeline_cards (
                stage,
                stage_entered_at,
                updated_at
            )
        `)
        .eq("package_id", packageId)
        .eq("status", "PAID");

    if (ordersError) {
        console.error("주문 조회 실패:", ordersError);
        throw new Error("주문 데이터를 불러올 수 없습니다.");
    }

    const salesCount = orders?.length ?? 0;
    const totalRevenue = orders?.reduce((sum, o) => sum + (o.amount || 0), 0) ?? 0;

    // 3. 평균 공정 시간 계산 (DELIVERED된 건만)
    let totalProcessHours = 0;
    let completedCount = 0;

    orders?.forEach((order) => {
        const card = Array.isArray(order.pipeline_cards)
            ? order.pipeline_cards[0]
            : order.pipeline_cards;

        if (card && card.stage === "DELIVERED") {
            const orderCreatedAt = new Date(order.created_at);
            const deliveredAt = new Date(card.updated_at);
            const processHours = (deliveredAt.getTime() - orderCreatedAt.getTime()) / (1000 * 60 * 60);
            totalProcessHours += processHours;
            completedCount++;
        }
    });

    const avgProcessTime = completedCount > 0 ? Math.round(totalProcessHours / completedCount) : 0;

    // 4. 수익률 및 효율성 계산
    const pgFees = Math.round(totalRevenue * pgFeeRate);
    const profitMargin = totalRevenue > 0
        ? Math.round(((totalRevenue - pgFees) / totalRevenue) * 100)
        : 0;

    // 시간당 수익 (효율성 지표)
    const efficiency = avgProcessTime > 0
        ? Math.round((packageData.price - (packageData.price * pgFeeRate)) / avgProcessTime)
        : 0;

    return {
        packageId: packageData.id,
        packageName: packageData.name,
        price: packageData.price,
        salesCount,
        totalRevenue,
        avgProcessTime,
        profitMargin,
        efficiency,
    };
}

/**
 * 전체 이벤트 순수익 요약 (대시보드용)
 */
export async function getAllEventsProfitSummary(): Promise<{
    events: Array<{ eventId: number; title: string; profit: ProfitSummary }>;
    totalNetProfit: number;
}> {
    const supabase = await createClient();

    // 활성 이벤트 조회
    const { data: events, error } = await supabase
        .from("events")
        .select("id, title")
        .eq("is_active", true);

    if (error) {
        console.error("이벤트 조회 실패:", error);
        throw new Error("이벤트 데이터를 불러올 수 없습니다.");
    }

    const eventProfits = await Promise.all(
        (events ?? []).map(async (event) => {
            try {
                const profit = await calculateNetProfit(event.id);
                return { eventId: event.id, title: event.title, profit };
            } catch {
                return {
                    eventId: event.id,
                    title: event.title,
                    profit: {
                        totalRevenue: 0,
                        pgFees: 0,
                        fixedExpenses: 0,
                        laborCosts: 0,
                        netProfit: 0,
                        profitMargin: 0,
                    },
                };
            }
        })
    );

    const totalNetProfit = eventProfits.reduce((sum, e) => sum + e.profit.netProfit, 0);

    return {
        events: eventProfits,
        totalNetProfit,
    };
}

// ============================================
// Detailed Analysis Query
// ============================================

export type EventDetailedAnalysis = {
    eventId: number;
    eventTitle: string;
    summary: {
        totalParticipants: number;
        totalRevenue: number;
        netProfit: number;
        totalExpenses: number;
        profitMargin: number;
    };
    revenueByPackage: {
        packageId: number;
        packageName: string;
        count: number;
        revenue: number;
    }[];
    topSellingPackage: {
        name: string;
        count: number;
        revenue: number;
    } | null;
};

/**
 * 특정 이벤트에 대한 상세 분석 (참가자, 패키지별 수익 등)
 */
export async function getEventDetailedAnalysis(eventId: number): Promise<EventDetailedAnalysis> {
    const supabase = await createClient();

    // 1. 이벤트 정보
    const { data: event, error: eventError } = await supabase
        .from("events")
        .select("title")
        .eq("id", eventId)
        .single();

    if (eventError || !event) {
        throw new Error("Cannot find event");
    }

    // 2. Orders (Revenue & Participants)
    const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("user_id, amount, package_id")
        .eq("event_id", eventId)
        .eq("status", "PAID");

    if (ordersError) {
        throw new Error("Failed to load orders");
    }

    // 3. Packages (Names)
    const { data: packages, error: packagesError } = await supabase
        .from("packages")
        .select("id, name")
        .eq("event_id", eventId);

    if (packagesError) {
        throw new Error("Failed to load packages");
    }

    // 4. Calculate Summary
    const uniqueParticipants = new Set(orders?.map(o => o.user_id).filter(Boolean)).size;
    const totalRevenue = orders?.reduce((acc, curr) => acc + (curr.amount || 0), 0) ?? 0;

    // Existing profit calc logic (reused partially)
    const pgFeeRate = await getPgFeeRate();
    const pgFees = Math.round(totalRevenue * pgFeeRate);
    const { data: expenses } = await supabase
        .from("expenses")
        .select("amount")
        .eq("event_id", eventId);

    const totalExpensesRaw = expenses?.reduce((acc, curr) => acc + (curr.amount || 0), 0) ?? 0;
    const totalExpenses = totalExpensesRaw + pgFees; // Total cost including PG feee
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

    // 5. Calculate Revenue by Package
    const packageMap = new Map<number, { name: string; count: number; revenue: number }>();

    // Initialize with all packages (even if 0 sales)
    packages?.forEach(pkg => {
        packageMap.set(pkg.id, { name: pkg.name, count: 0, revenue: 0 });
    });

    orders?.forEach(order => {
        if (order.package_id && packageMap.has(order.package_id)) {
            const entry = packageMap.get(order.package_id)!;
            entry.count += 1;
            entry.revenue += (order.amount || 0);
        }
    });

    const revenueByPackage = Array.from(packageMap.entries()).map(([id, data]) => ({
        packageId: id,
        packageName: data.name,
        count: data.count,
        revenue: data.revenue
    })).sort((a, b) => b.revenue - a.revenue);

    const topSellingPackage = revenueByPackage.length > 0 ? {
        name: revenueByPackage[0].packageName,
        count: revenueByPackage[0].count,
        revenue: revenueByPackage[0].revenue
    } : null;

    return {
        eventId,
        eventTitle: event.title,
        summary: {
            totalParticipants: uniqueParticipants,
            totalRevenue,
            netProfit,
            totalExpenses,
            profitMargin,
        },
        revenueByPackage,
        topSellingPackage
    };
}


import { Metadata } from "next";
import { TrendingUp, RefreshCcw } from "lucide-react";
import { AnalyticsDashboard } from "@/features/analytics/components/AnalyticsDashboard";
import {
    getDailyRevenue,
    getMonthlyGrowth,
    getCustomerSegments,
    getCustomerLTV,
    getPipelineBottleneck,
    getEventAnalytics,
    getDisciplineAnalytics,
    getPackageAnalytics,
} from "@/features/analytics/actions";
import { getAllEventsProfitSummary } from "@/features/finance/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
    title: "Analytics | VidFlow Admin",
    description: "통합 데이터 분석 및 재무 관리",
};

/**
 * 📊 Analytics Page (Admin Integrated)
 * 기존 Analytics와 Finance 기능을 통합한 마스터 대시보드
 * 
 * [Tabs]
 * 1. Overview: 핵심 지표, 매출/고객/병목 요약
 * 2. Performance: 이벤트/종목별 성과 상세 비교 (New)
 * 3. Financials: 상세 재무(매출/지출/순수익) 관리 (Old Finance)
 * 
 * @author Agent 3
 */
export default async function AnalyticsPage() {
    const supabase = await createClient();

    // 1. Fetch Analytics Data
    const [
        dailyRevenue,
        monthlyGrowth,
        customerSegments,
        customerLTV,
        pipelineBottleneck,
        eventAnalytics,
        disciplineAnalytics,
        packageAnalytics,
    ] = await Promise.all([
        getDailyRevenue(30),
        getMonthlyGrowth(),
        getCustomerSegments(),
        getCustomerLTV(20),
        getPipelineBottleneck(),
        getEventAnalytics(),
        getDisciplineAnalytics(),
        getPackageAnalytics(),
    ]);

    // 2. Fetch Finance Data (from FinancePage)
    // 2.1 수익/지출 요약
    const { events: financeEvents, totalNetProfit } = await getAllEventsProfitSummary();

    // 2.2 이벤트 목록 (드롭다운용)
    const { data: eventList } = await supabase
        .from("events")
        .select("id, title")
        .order("event_date", { ascending: false });

    // 2.3 지출 내역 (최근 100개)
    const { data: allExpenses } = await supabase
        .from("expenses")
        .select(`
            id,
            event_id,
            category,
            description,
            amount,
            is_auto_generated,
            expensed_at,
            events (title)
        `)
        .order("expensed_at", { ascending: false })
        .limit(100);

    // Finance Data Processing (Server-side calculation)
    const totalStats = financeEvents.reduce(
        (acc, curr) => ({
            totalRevenue: acc.totalRevenue + curr.profit.totalRevenue,
            pgFees: acc.pgFees + curr.profit.pgFees,
            fixedExpenses: acc.fixedExpenses + curr.profit.fixedExpenses,
            laborCosts: acc.laborCosts + curr.profit.laborCosts,
            netProfit: acc.netProfit + curr.profit.netProfit,
        }),
        { totalRevenue: 0, pgFees: 0, fixedExpenses: 0, laborCosts: 0, netProfit: 0 }
    );

    const chartData = {
        profitChartData: financeEvents.map(e => ({
            name: e.title,
            revenue: e.profit.totalRevenue,
            profit: e.profit.netProfit,
            expense: e.profit.pgFees + e.profit.fixedExpenses + e.profit.laborCosts
        })),
        costBreakdownData: [
            { name: "Labor Costs", value: totalStats.laborCosts, color: "#3b82f6" },
            { name: "Fixed Expenses", value: totalStats.fixedExpenses, color: "#ef4444" },
            { name: "PG Fees", value: totalStats.pgFees, color: "#a1a1aa" },
        ].filter(d => d.value > 0)
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-oswald)] uppercase">
                            Analytics Center
                        </h1>
                        <p className="text-sm text-zinc-400">
                            통합 데이터 분석 및 재무 관리 시스템
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 bg-zinc-900/50 border border-zinc-800 px-3 py-1.5 rounded-full flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Last updated: {new Date().toLocaleTimeString()}
                    </span>
                    <a
                        href="/admin/analytics"
                        className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors rounded-full"
                        title="새로고침"
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </a>
                </div>
            </div>

            {/* Integrated Dashboard */}
            <AnalyticsDashboard
                // Analytics Props
                dailyRevenue={dailyRevenue}
                monthlyGrowth={monthlyGrowth}
                customerSegments={customerSegments}
                customerLTV={customerLTV}
                pipelineBottleneck={pipelineBottleneck}
                eventAnalytics={eventAnalytics}
                disciplineAnalytics={disciplineAnalytics}
                packageAnalytics={packageAnalytics}

                // Finance Props
                financeEvents={financeEvents}
                eventList={eventList || []}
                allExpenses={allExpenses || []}
                totalStats={totalStats}
                financeChartData={chartData}
            />
        </div>
    );
}

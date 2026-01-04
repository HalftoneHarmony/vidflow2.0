/**
 * 💰 Finance Center Page
 * 재무 관리 및 수익 분석 대시보드
 * Agent 7: Gold (The Treasurer)
 */

import { getAllEventsProfitSummary } from "@/features/finance/queries";
import { EventProfitTable } from "@/features/finance/components/EventProfitTable";
import { ExpenseDetailSection } from "@/features/finance/components/ExpenseDetailSection";
import { EventProfitChart, CostBreakdownChart } from "@/features/finance/components/FinanceCharts";
import { FinanceDashboard } from "@/features/finance/components/FinanceDashboard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// 통계 카드 컴포넌트
function StatCard({
    label,
    value,
    type = "default"
}: {
    label: string;
    value: string;
    type?: "revenue" | "expense" | "profit" | "rate" | "default";
}) {
    const colorMap = {
        revenue: "text-emerald-400 border-emerald-600",
        expense: "text-red-400 border-red-600",
        profit: "text-yellow-400 border-yellow-500",
        rate: "text-blue-400 border-blue-600",
        default: "text-white border-zinc-700",
    };

    return (
        <div className={`bg-zinc-900 border-l-4 ${colorMap[type]} p-6`}>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-mono mb-2">
                {label}
            </p>
            <p className="text-3xl font-black font-mono text-white">
                {value}
            </p>
        </div>
    );
}

export default async function FinancePage() {
    // 1. 전체 수익 데이터 조회
    const { events, totalNetProfit } = await getAllEventsProfitSummary();

    // 전체 통계 합산
    const totalStats = events.reduce(
        (acc, curr) => ({
            totalRevenue: acc.totalRevenue + curr.profit.totalRevenue,
            pgFees: acc.pgFees + curr.profit.pgFees,
            fixedExpenses: acc.fixedExpenses + curr.profit.fixedExpenses,
            laborCosts: acc.laborCosts + curr.profit.laborCosts,
            netProfit: acc.netProfit + curr.profit.netProfit,
        }),
        { totalRevenue: 0, pgFees: 0, fixedExpenses: 0, laborCosts: 0, netProfit: 0 }
    );

    const totalExpenses = totalStats.pgFees + totalStats.fixedExpenses + totalStats.laborCosts;
    const profitMargin = totalStats.totalRevenue > 0
        ? Math.round((totalStats.netProfit / totalStats.totalRevenue) * 100)
        : 0;

    // 차트용 데이터 가공
    const profitChartData = events.map(e => ({
        name: e.title,
        revenue: e.profit.totalRevenue,
        profit: e.profit.netProfit,
        expense: e.profit.pgFees + e.profit.fixedExpenses + e.profit.laborCosts
    }));

    const costBreakdownData = [
        { name: "Labor Costs", value: totalStats.laborCosts, color: "#3b82f6" }, // Blue
        { name: "Fixed Expenses", value: totalStats.fixedExpenses, color: "#ef4444" }, // Red
        { name: "PG Fees", value: totalStats.pgFees, color: "#a1a1aa" }, // Zinc
    ].filter(d => d.value > 0);

    // 2. 이벤트 목록 조회 (드롭다운용)
    const supabase = await createClient();
    const { data: eventList } = await supabase
        .from("events")
        .select("id, title")
        .order("event_date", { ascending: false });

    // 3. 전체 지출 내역 조회 (최근 100개)
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

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("ko-KR", {
            style: "currency",
            currency: "KRW",
            maximumFractionDigits: 0,
        }).format(value);

    return (
        <FinanceDashboard eventList={eventList || []}>
            <div className="space-y-8 pb-10">
                {/* Header */}
                <div className="border-b border-zinc-800 pb-6">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                        Finance Center
                    </h1>
                    <p className="text-zinc-500 font-mono text-sm mt-1">
                        Revenue Analytics & Expense Management
                    </p>
                </div>

                {/* Step 2: 요약 통계 카드 영역 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Revenue"
                        value={formatCurrency(totalStats.totalRevenue)}
                        type="revenue"
                    />
                    <StatCard
                        label="Total Expenses"
                        value={formatCurrency(totalExpenses)}
                        type="expense"
                    />
                    <StatCard
                        label="Net Profit"
                        value={formatCurrency(totalStats.netProfit)}
                        type={totalStats.netProfit >= 0 ? "profit" : "expense"}
                    />
                    <StatCard
                        label="Profit Margin"
                        value={`${profitMargin}%`}
                        type="rate"
                    />
                </div>

                {/* New: Visual Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
                    <div className="lg:col-span-2 h-full">
                        <EventProfitChart data={profitChartData} />
                    </div>
                    <div className="lg:col-span-1 h-full">
                        <CostBreakdownChart data={costBreakdownData} />
                    </div>
                </div>

                {/* Step 3: 이벤트별 수익 분석 테이블 */}
                <div className="bg-zinc-900 border border-zinc-800 p-6">
                    <h2 className="text-lg font-bold text-white border-l-4 border-yellow-500 pl-3 mb-6">
                        Event Profitability Analysis
                    </h2>
                    <EventProfitTable events={events} />
                </div>

                {/* Step 4 & 5 & 6: 지출 내역 상세 섹션 */}
                <ExpenseDetailSection
                    expenses={allExpenses || []}
                    eventList={eventList || []}
                />
            </div>
        </FinanceDashboard>
    );
}

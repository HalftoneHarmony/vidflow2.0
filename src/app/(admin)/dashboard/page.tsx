/**
 * 📊 Dashboard Page
 * 수익 분석 및 KPI 대시보드
 * Agent 7: Gold (The Treasurer)
 */

import { getAllEventsProfitSummary, getExpensesByEvent } from "@/features/finance/queries";
import { ProfitSummaryCard, ProfitTicker } from "@/features/finance/components/ProfitSummaryCard";
import { ProfitChart } from "@/features/finance/components/ProfitChart";
import { ExpenseTable } from "@/features/finance/components/ExpenseTable";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
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

    const totalProfitMargin = totalStats.totalRevenue > 0
        ? Math.round((totalStats.netProfit / totalStats.totalRevenue) * 100)
        : 0;

    // 차트 데이터 변환
    const chartData = events.map(e => ({
        name: e.title,
        revenue: e.profit.totalRevenue,
        profit: e.profit.netProfit
    }));

    // 2. 최근 지출 내역 조회 (활성 이벤트 중 첫 번째)
    const activeEventId = events.length > 0 ? events[0].eventId : null;
    let recentExpenses: any[] = [];

    if (activeEventId) {
        recentExpenses = await getExpensesByEvent(activeEventId);
    } else {
        // 활성 이벤트가 없으면 전체 지출 중 최근 10개 조회 (임시 로직)
        // queries.ts에 getAllExpenses가 없으므로 여기서는 빈 배열 처리하거나
        // 직접 supabase 호출하여 처리
        const supabase = await createClient();
        const { data } = await supabase
            .from("expenses")
            .select("*")
            .order("expensed_at", { ascending: false })
            .limit(10);
        recentExpenses = data || [];
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header Area */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end border-b border-zinc-800 pb-4">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                            Fin. Dashboard
                        </h1>
                        <p className="text-zinc-500 font-mono text-sm mt-1">
                            Real-time Profit Intelligence
                        </p>
                    </div>

                    {/* Real-time Ticker */}
                    <ProfitTicker
                        netProfit={totalNetProfit}
                        profitMargin={totalProfitMargin}
                    />
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Profit Card */}
                <div className="lg:col-span-1">
                    <ProfitSummaryCard
                        title="TOTAL NET PROFIT (ALL TIME)"
                        profit={{ ...totalStats, profitMargin: totalProfitMargin }}
                    />
                </div>

                {/* Profit Chart */}
                <div className="lg:col-span-2">
                    <ProfitChart data={chartData} />
                </div>
            </div>

            {/* Expense Detail Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-white border-l-4 border-red-600 pl-3">
                    Recent Expenses Log
                    {activeEventId && <span className="text-xs text-zinc-500 font-normal ml-2">(Event ID: {activeEventId})</span>}
                </h2>
                <ExpenseTable expenses={recentExpenses} title="Latest Transactions" />
            </div>
        </div>
    );
}


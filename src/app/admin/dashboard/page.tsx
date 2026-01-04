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
        const supabase = await createClient();
        const { data } = await supabase
            .from("expenses")
            .select("*")
            .order("expensed_at", { ascending: false })
            .limit(10);
        recentExpenses = data || [];
    }

    // 3. 패키지 ROI 현황 (효율성 분석)
    const supabase = await createClient();
    const { data: allPackages } = await supabase
        .from("packages")
        .select("id, name")
        .limit(10);

    const packageROIs = await Promise.all(
        (allPackages ?? []).map(async (pkg) => {
            try {
                const { getPackageROI } = await import("@/features/finance/queries");
                return await getPackageROI(pkg.id);
            } catch {
                return null;
            }
        })
    );

    // 효율성(시간당 수익) 기준 정렬
    const topEfficiencyPackages = packageROIs
        .filter((roi): roi is any => roi !== null && roi.salesCount > 0)
        .sort((a, b) => b.efficiency - a.efficiency)
        .slice(0, 5);

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

                    <ProfitTicker
                        netProfit={totalNetProfit}
                        profitMargin={totalProfitMargin}
                    />
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <ProfitSummaryCard
                        title="TOTAL NET PROFIT (ALL TIME)"
                        profit={{ ...totalStats, profitMargin: totalProfitMargin }}
                    />
                </div>
                <div className="lg:col-span-2">
                    <ProfitChart data={chartData} />
                </div>
            </div>

            {/* ROI Efficiency Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Efficiency Packages */}
                <div className="bg-zinc-900 border border-zinc-800 p-6">
                    <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500" />
                        Top Efficiency (Hourly Profit)
                    </h2>
                    <div className="space-y-4">
                        {topEfficiencyPackages.length > 0 ? (
                            topEfficiencyPackages.map((pkg) => (
                                <div key={pkg.packageId} className="flex justify-between items-center p-3 bg-black border border-zinc-800">
                                    <div>
                                        <p className="text-white font-bold">{pkg.packageName}</p>
                                        <p className="text-xs text-zinc-500 font-mono">Process: {pkg.avgProcessTime}h / Sales: {pkg.salesCount}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-emerald-400 font-black font-mono">
                                            ₩{pkg.efficiency.toLocaleString()}<span className="text-[10px] ml-1 text-zinc-600">/hr</span>
                                        </p>
                                        <p className="text-[10px] text-zinc-600 uppercase">Revenue Efficiency</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-zinc-600 py-10 text-center border border-dashed border-zinc-800">분석된 데이터가 부족합니다.</p>
                        )}
                    </div>
                </div>

                {/* Expense Quick Summary */}
                <div className="bg-zinc-900 border border-zinc-800 p-6">
                    <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500" />
                        Cost Breakdown
                    </h2>
                    <div className="grid grid-cols-2 gap-4 h-full">
                        <div className="bg-black border border-zinc-800 p-4 flex flex-col justify-center">
                            <span className="text-[10px] text-zinc-600 uppercase font-mono">Fixed Expenses</span>
                            <span className="text-xl font-bold text-white font-mono">₩{totalStats.fixedExpenses.toLocaleString()}</span>
                        </div>
                        <div className="bg-black border border-zinc-800 p-4 flex flex-col justify-center">
                            <span className="text-[10px] text-zinc-600 uppercase font-mono">Labor Costs</span>
                            <span className="text-xl font-bold text-white font-mono">₩{totalStats.laborCosts.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expense Detail Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-white border-l-4 border-red-600 pl-3">
                    Recent Expenses Log
                </h2>
                <ExpenseTable expenses={recentExpenses} title="Latest Transactions" />
            </div>
        </div>
    );
}

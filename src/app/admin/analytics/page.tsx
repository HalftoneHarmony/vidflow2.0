import { Metadata } from "next";
import { TrendingUp, RefreshCcw } from "lucide-react";
import { AnalyticsDashboard } from "@/features/analytics/components/AnalyticsDashboard";
import {
    getDailyRevenue,
    getMonthlyGrowth,
    getCustomerSegments,
    getCustomerLTV,
    getPipelineBottleneck,
} from "@/features/analytics/actions";

export const metadata: Metadata = {
    title: "Analytics | VidFlow Admin",
    description: "심층 데이터 분석 및 비즈니스 인사이트",
};

/**
 * 📊 Analytics Page
 * 심층 데이터 분석 대시보드
 * 
 * 사용하는 DB 함수:
 * - getDailyRevenue(days) - 일별 매출
 * - getMonthlyGrowth() - 월별 성장률
 * - getCustomerSegments() - 고객 세그먼트
 * - getCustomerLTV(limit) - 고객 LTV
 * - getPipelineBottleneck() - 파이프라인 병목
 * 
 * @author Agent 3 (Analytics Master)
 */
export default async function AnalyticsPage() {
    // Fetch all analytics data in parallel
    const [
        dailyRevenue,
        monthlyGrowth,
        customerSegments,
        customerLTV,
        pipelineBottleneck,
    ] = await Promise.all([
        getDailyRevenue(30),
        getMonthlyGrowth(),
        getCustomerSegments(),
        getCustomerLTV(20),
        getPipelineBottleneck(),
    ]);

    // Calculate some quick stats for the header
    const totalMonthlyRevenue = monthlyGrowth[0]?.monthly_revenue || 0;
    const latestGrowth = monthlyGrowth[0]?.revenue_growth || 0;
    const totalCustomers = customerLTV.length;

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
                            Analytics
                        </h1>
                        <p className="text-sm text-zinc-400">
                            심층 데이터 분석 및 비즈니스 인사이트
                        </p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/50 border border-zinc-800">
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">이번 달</p>
                            <p className="text-lg font-bold text-white font-mono">
                                {new Intl.NumberFormat("ko-KR", { notation: "compact" }).format(totalMonthlyRevenue)}
                            </p>
                        </div>
                        {latestGrowth !== 0 && (
                            <span className={`text-xs font-mono font-bold ${latestGrowth >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                {latestGrowth >= 0 ? "+" : ""}{latestGrowth.toFixed(1)}%
                            </span>
                        )}
                    </div>
                    <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-zinc-900/50 border border-zinc-800">
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">분석 고객</p>
                            <p className="text-lg font-bold text-white font-mono">{totalCustomers}</p>
                        </div>
                    </div>
                    <a
                        href="/admin/analytics"
                        className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                        title="새로고침"
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </a>
                </div>
            </div>

            {/* Dashboard Grid */}
            <AnalyticsDashboard
                dailyRevenue={dailyRevenue}
                monthlyGrowth={monthlyGrowth}
                customerSegments={customerSegments}
                customerLTV={customerLTV}
                pipelineBottleneck={pipelineBottleneck}
            />
        </div>
    );
}

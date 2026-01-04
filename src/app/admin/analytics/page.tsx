

import { Metadata } from "next";
import { TrendingUp } from "lucide-react";

export const metadata: Metadata = {
    title: "Analytics | VidFlow Admin",
    description: "심층 데이터 분석 및 비즈니스 인사이트",
};

/**
 * 📊 Analytics Page
 * 심층 데이터 분석 대시보드
 * 
 * 사용 가능한 함수:
 * - getComprehensiveStats() - 종합 통계
 * - getDailyRevenue(days) - 일별 매출
 * - getMonthlyGrowth() - 월별 성장률
 * - getCustomerSegments() - 고객 세그먼트
 * - getCustomerLTV(limit) - 고객 LTV
 * - getPipelineBottleneck() - 파이프라인 병목
 * 
 * @author Agent 4 (Backend/Integration Master)
 * @todo Agent 3 (Analytics Master)가 차트 UI 구현 예정
 */
export default async function AnalyticsPage() {
    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
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

            {/* Placeholder Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Revenue Chart Placeholder */}
                <div className="col-span-full lg:col-span-2 bg-zinc-900/50 border border-zinc-800 p-6 min-h-[300px] flex items-center justify-center">
                    <div className="text-center text-zinc-500">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm uppercase tracking-wider">매출 추이 차트</p>
                        <p className="text-xs mt-2 text-zinc-600">Agent 3가 구현 예정</p>
                    </div>
                </div>

                {/* Customer Segments Placeholder */}
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 min-h-[300px] flex items-center justify-center">
                    <div className="text-center text-zinc-500">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-zinc-700 opacity-50" />
                        <p className="text-sm uppercase tracking-wider">고객 세그먼트</p>
                        <p className="text-xs mt-2 text-zinc-600">VIP/단골/신규/휴면</p>
                    </div>
                </div>

                {/* Customer LTV Placeholder */}
                <div className="col-span-full lg:col-span-2 bg-zinc-900/50 border border-zinc-800 p-6">
                    <h3 className="text-lg font-bold text-white mb-4 font-[family-name:var(--font-oswald)] uppercase">
                        고객 LTV 랭킹
                    </h3>
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-3 bg-zinc-800/30 border border-zinc-800/50">
                                <div className="w-8 h-8 bg-zinc-700 animate-pulse" />
                                <div className="flex-1 h-4 bg-zinc-700 animate-pulse" />
                                <div className="w-20 h-4 bg-zinc-700 animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pipeline Bottleneck Placeholder */}
                <div className="bg-zinc-900/50 border border-zinc-800 p-6">
                    <h3 className="text-lg font-bold text-white mb-4 font-[family-name:var(--font-oswald)] uppercase">
                        파이프라인 병목
                    </h3>
                    <div className="space-y-3">
                        {["대기", "촬영", "편집", "완료"].map((stage) => (
                            <div key={stage} className="space-y-1">
                                <div className="flex justify-between text-xs text-zinc-400">
                                    <span>{stage}</span>
                                    <span>0%</span>
                                </div>
                                <div className="h-2 bg-zinc-800 overflow-hidden">
                                    <div className="h-full bg-zinc-600 w-0" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

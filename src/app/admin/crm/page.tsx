import { Metadata } from "next";
import { Suspense } from "react";
import {
    Target,
    Users,
    TrendingUp,
    Megaphone,
    BarChart3,
    Filter,
    ArrowUpRight,
} from "lucide-react";
import {
    getUpsellCandidates,
    getUpsellSummary,
    getEventsForFilter,
} from "@/features/crm/actions";
import {
    UpsellSummaryCards,
    UpsellCandidateTable,
    SegmentBuilder,
} from "@/features/crm/components";

export const metadata: Metadata = {
    title: "Marketing CRM | VidFlow Admin",
    description: "업셀링 및 고객 세그먼트 관리",
};

// Loading skeleton
function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="h-32 bg-zinc-900/50 border border-zinc-800 animate-pulse"
                    />
                ))}
            </div>
            <div className="h-96 bg-zinc-900/50 border border-zinc-800 animate-pulse" />
        </div>
    );
}

export default async function MarketingCRMPage() {
    // Fetch data in parallel
    const [summary, candidates, events] = await Promise.all([
        getUpsellSummary(),
        getUpsellCandidates(50),
        getEventsForFilter(),
    ]);

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white font-[family-name:var(--font-oswald)] uppercase tracking-wider flex items-center gap-3">
                        <div className="p-2 bg-violet-500/10 border border-violet-500/30">
                            <Megaphone className="w-6 h-6 text-violet-400" />
                        </div>
                        Marketing CRM
                    </h1>
                    <p className="text-zinc-500 mt-1">
                        업셀링 대상 고객 분석 및 세그먼트 빌더
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <a
                        href="/admin/analytics"
                        className="flex items-center gap-2 px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors text-sm"
                    >
                        <BarChart3 className="w-4 h-4" />
                        Analytics
                        <ArrowUpRight className="w-3 h-3" />
                    </a>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-zinc-800">
                <nav className="flex gap-1">
                    {[
                        { id: "upsell", label: "Upsell Opportunities", icon: TrendingUp },
                        { id: "segment", label: "Segment Builder", icon: Filter },
                    ].map((tab, index) => (
                        <a
                            key={tab.id}
                            href={`#${tab.id}`}
                            className={`
                                flex items-center gap-2 px-4 py-3 text-sm font-medium uppercase tracking-wider
                                border-b-2 transition-all
                                ${index === 0
                                    ? "border-violet-500 text-white bg-violet-500/5"
                                    : "border-transparent text-zinc-500 hover:text-white hover:bg-zinc-800/30"
                                }
                            `}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </a>
                    ))}
                </nav>
            </div>

            {/* Section 1: Upsell Dashboard */}
            <section id="upsell" className="space-y-6">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-xl font-bold text-white font-[family-name:var(--font-oswald)] uppercase tracking-wider">
                        Upsell Opportunities
                    </h2>
                </div>

                {/* Summary Cards */}
                <Suspense fallback={<LoadingSkeleton />}>
                    <UpsellSummaryCards summary={summary} />
                </Suspense>

                {/* Candidates Table */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Upsell Candidates
                        </h3>
                        <div className="flex items-center gap-2">
                            <select className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm px-3 py-1.5 focus:outline-none focus:border-violet-500">
                                <option value="">All Events</option>
                                {events.map((event) => (
                                    <option key={event.id} value={event.id}>
                                        {event.title}
                                    </option>
                                ))}
                            </select>
                            <select className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm px-3 py-1.5 focus:outline-none focus:border-violet-500">
                                <option value="">All Priorities</option>
                                <option value="high">🔥 High Priority</option>
                                <option value="medium">🌡️ Medium Priority</option>
                                <option value="low">❄️ Low Priority</option>
                            </select>
                        </div>
                    </div>

                    <Suspense
                        fallback={
                            <div className="h-64 bg-zinc-900/50 border border-zinc-800 animate-pulse" />
                        }
                    >
                        <UpsellCandidateTable candidates={candidates} />
                    </Suspense>
                </div>
            </section>

            {/* Section 2: Segment Builder */}
            <section id="segment" className="space-y-6 pt-8 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-violet-400" />
                    <h2 className="text-xl font-bold text-white font-[family-name:var(--font-oswald)] uppercase tracking-wider">
                        Audience Segment Builder
                    </h2>
                </div>
                <p className="text-sm text-zinc-500 max-w-2xl">
                    조건을 조합하여 타겟 고객 세그먼트를 생성하세요.
                    생성된 세그먼트는 벌크 이메일 발송이나 마케팅 캠페인에 활용할 수 있습니다.
                </p>

                <SegmentBuilder />
            </section>

            {/* Tips Section */}
            <section className="p-6 border border-amber-500/20 bg-amber-500/5">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    💡 Upsell Best Practices
                </h3>
                <ul className="text-sm text-zinc-400 space-y-2">
                    <li className="flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        <span><strong className="text-white">납품 후 7일 이내</strong>가 업셀링 골든타임입니다. 영상에 만족한 직후가 가장 효과적!</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        <span><strong className="text-white">가격 차이가 50% 이내</strong>인 업그레이드가 전환율이 높습니다.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        <span><strong className="text-white">VIP 고객</strong>에게는 독점 프리미엄 패키지를 제안하세요.</span>
                    </li>
                </ul>
            </section>
        </div>
    );
}

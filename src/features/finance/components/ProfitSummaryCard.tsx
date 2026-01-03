/**
 * 💰 Profit Summary Card
 * 순수익 요약 카드 (대시보드용)
 * Agent 7: Gold (The Treasurer)
 */

import { ProfitSummary } from "../queries";

// ============================================
// Types
// ============================================

type ProfitSummaryCardProps = {
    title: string;
    profit: ProfitSummary;
    showDetails?: boolean;
};

type StatItemProps = {
    label: string;
    value: number;
    type: "revenue" | "expense" | "profit";
    isPercentage?: boolean;
};

// ============================================
// Sub Components
// ============================================

function StatItem({ label, value, type, isPercentage = false }: StatItemProps) {
    const colorMap = {
        revenue: "text-emerald-400",
        expense: "text-red-400",
        profit: value >= 0 ? "text-yellow-400" : "text-red-500",
    };

    const formatValue = () => {
        if (isPercentage) {
            return `${value}%`;
        }
        return new Intl.NumberFormat("ko-KR", {
            style: "currency",
            currency: "KRW",
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-b-0">
            <span className="text-sm text-zinc-400">{label}</span>
            <span className={`text-sm font-bold font-mono ${colorMap[type]}`}>
                {type === "expense" && value > 0 && "-"}
                {formatValue()}
            </span>
        </div>
    );
}

function ProfitIndicator({ netProfit, profitMargin }: { netProfit: number; profitMargin: number }) {
    const isProfit = netProfit >= 0;
    const indicatorColor = isProfit ? "bg-emerald-500" : "bg-red-500";
    const textColor = isProfit ? "text-emerald-400" : "text-red-400";
    const statusText = isProfit ? "PROFIT" : "LOSS";

    return (
        <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${indicatorColor} animate-pulse`} />
            <div className="flex flex-col">
                <span className={`text-xs font-bold ${textColor}`}>{statusText}</span>
                <span className="text-xs text-zinc-500">마진율 {profitMargin}%</span>
            </div>
        </div>
    );
}

// ============================================
// Main Component
// ============================================

export function ProfitSummaryCard({ title, profit, showDetails = true }: ProfitSummaryCardProps) {
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("ko-KR", {
            style: "currency",
            currency: "KRW",
            maximumFractionDigits: 0,
        }).format(value);

    return (
        <div className="bg-zinc-900 border border-zinc-800 p-6 relative overflow-hidden">
            {/* Heavy Metal 테마 - 대각선 장식 */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-yellow-500/10 to-transparent" />

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                        {title}
                    </h3>
                    <p className="text-3xl font-black font-mono text-white">
                        {formatCurrency(profit.netProfit)}
                    </p>
                </div>
                <ProfitIndicator
                    netProfit={profit.netProfit}
                    profitMargin={profit.profitMargin}
                />
            </div>

            {/* Net Profit Formula Visual */}
            <div className="mb-6 p-4 bg-black/50 border border-zinc-800">
                <div className="text-xs text-zinc-500 mb-2 font-mono">순수익 공식</div>
                <div className="flex items-center gap-2 text-sm font-mono flex-wrap">
                    <span className="text-emerald-400">{formatCurrency(profit.totalRevenue)}</span>
                    <span className="text-zinc-600">-</span>
                    <span className="text-red-400">{formatCurrency(profit.pgFees)}</span>
                    <span className="text-zinc-600">-</span>
                    <span className="text-red-400">{formatCurrency(profit.fixedExpenses)}</span>
                    <span className="text-zinc-600">-</span>
                    <span className="text-red-400">{formatCurrency(profit.laborCosts)}</span>
                    <span className="text-zinc-600">=</span>
                    <span className={`font-bold ${profit.netProfit >= 0 ? "text-yellow-400" : "text-red-500"}`}>
                        {formatCurrency(profit.netProfit)}
                    </span>
                </div>
            </div>

            {/* Detailed Breakdown */}
            {showDetails && (
                <div className="space-y-1">
                    <StatItem
                        label="총 매출"
                        value={profit.totalRevenue}
                        type="revenue"
                    />
                    <StatItem
                        label="PG 수수료 (3.5%)"
                        value={profit.pgFees}
                        type="expense"
                    />
                    <StatItem
                        label="고정 지출"
                        value={profit.fixedExpenses}
                        type="expense"
                    />
                    <StatItem
                        label="인건비 (자동)"
                        value={profit.laborCosts}
                        type="expense"
                    />
                    <div className="pt-3 mt-3 border-t-2 border-zinc-700">
                        <StatItem
                            label="순수익"
                            value={profit.netProfit}
                            type="profit"
                        />
                        <StatItem
                            label="순이익률"
                            value={profit.profitMargin}
                            type="profit"
                            isPercentage
                        />
                    </div>
                </div>
            )}

            {/* Quick Stats Bar */}
            <div className="mt-6 pt-4 border-t border-zinc-800 grid grid-cols-3 gap-4">
                <div className="text-center">
                    <div className="text-lg font-bold text-white font-mono">
                        {Math.round((profit.pgFees / profit.totalRevenue) * 100) || 0}%
                    </div>
                    <div className="text-xs text-zinc-500">PG 비율</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-white font-mono">
                        {Math.round((profit.laborCosts / profit.totalRevenue) * 100) || 0}%
                    </div>
                    <div className="text-xs text-zinc-500">인건비 비율</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-white font-mono">
                        {Math.round((profit.fixedExpenses / profit.totalRevenue) * 100) || 0}%
                    </div>
                    <div className="text-xs text-zinc-500">고정비 비율</div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// Compact Variant (대시보드 티커용)
// ============================================

export function ProfitTicker({
    netProfit,
    profitMargin,
    trend = 0
}: {
    netProfit: number;
    profitMargin: number;
    trend?: number; // 전 대회 대비 변동률
}) {
    const isProfit = netProfit >= 0;
    const isUp = trend >= 0;

    return (
        <div className="flex items-center gap-4 px-4 py-2 bg-black border-l-4 border-yellow-500">
            <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">순수익</span>
                <span className={`text-xl font-black font-mono ${isProfit ? "text-yellow-400" : "text-red-500"}`}>
                    {new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(netProfit)}
                </span>
            </div>
            <div className="h-6 w-px bg-zinc-700" />
            <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">마진</span>
                <span className={`text-sm font-bold ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
                    {profitMargin}%
                </span>
            </div>
            {trend !== 0 && (
                <>
                    <div className="h-6 w-px bg-zinc-700" />
                    <div className={`flex items-center gap-1 text-sm font-bold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                        <span>{isUp ? "▲" : "▼"}</span>
                        <span>{Math.abs(trend)}%</span>
                    </div>
                </>
            )}
        </div>
    );
}

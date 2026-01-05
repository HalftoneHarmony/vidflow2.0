/**
 * 💰 Profit Summary Card
 * 순수익 요약 카드 (대시보드용)
 * Agent 7: Gold (The Treasurer)
 */

import { ProfitSummary } from "../queries";
import { MoneyTicker } from "./MoneyTicker";

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
        <div className="bg-zinc-900 border border-zinc-800 p-6 relative overflow-hidden group hover:border-zinc-700 transition-colors duration-500">
            {/* Heavy Metal 테마 - 대각선 장식 & Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-500/10 to-transparent transition-opacity duration-500 group-hover:from-yellow-500/20" />
            <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-yellow-500/5 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            {/* Header */}
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        {title}
                        <span className="w-1 h-1 rounded-full bg-yellow-500 animate-pulse" />
                    </h3>
                    <div className="text-3xl font-black text-white flex items-baseline gap-1">
                        <MoneyTicker value={profit.netProfit} />
                    </div>
                </div>
                <ProfitIndicator
                    netProfit={profit.netProfit}
                    profitMargin={profit.profitMargin}
                />
            </div>

            {/* Net Profit Formula Visual - Floating Card Effect */}
            <div className="mb-6 p-4 bg-black/40 border border-zinc-800 backdrop-blur-sm rounded-lg hover:bg-black/60 transition-colors duration-300 hover:shadow-lg hover:shadow-black/50 hover:-translate-y-0.5 transform">
                <div className="text-[10px] text-zinc-500 mb-3 font-mono uppercase tracking-widest">Net Profit Formula</div>
                <div className="flex items-center gap-2 text-sm font-mono flex-wrap">
                    <span className="text-emerald-400 hover:scale-110 transition-transform cursor-help" title="Total Revenue">
                        <MoneyTicker value={profit.totalRevenue} />
                    </span>
                    <span className="text-zinc-600">-</span>
                    <span className="text-red-400 hover:scale-110 transition-transform cursor-help" title="PG Fees">
                        <MoneyTicker value={profit.pgFees} />
                    </span>
                    <span className="text-zinc-600">-</span>
                    <span className="text-red-400 hover:scale-110 transition-transform cursor-help" title="Fixed Expenses">
                        <MoneyTicker value={profit.fixedExpenses} />
                    </span>
                    <span className="text-zinc-600">-</span>
                    <span className="text-red-400 hover:scale-110 transition-transform cursor-help" title="Labor Costs">
                        <MoneyTicker value={profit.laborCosts} />
                    </span>
                    <span className="text-zinc-600">=</span>
                    <span className={`font-bold border-b-2 border-dashed ${profit.netProfit >= 0 ? "text-yellow-400 border-yellow-500/50" : "text-red-500 border-red-500/50"}`}>
                        <MoneyTicker value={profit.netProfit} />
                    </span>
                </div>
            </div>

            {/* Detailed Breakdown */}
            {showDetails && (
                <div className="space-y-1 relative z-10">
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
                    <div className="pt-3 mt-3 border-t-2 border-zinc-800">
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
                <div className="text-center group/stat hover:bg-zinc-800/50 rounded py-2 transition-colors">
                    <div className="text-lg font-bold text-white font-mono group-hover/stat:text-emerald-400 transition-colors">
                        {Math.round((profit.pgFees / profit.totalRevenue) * 100) || 0}%
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider">PG Ratio</div>
                </div>
                <div className="text-center group/stat hover:bg-zinc-800/50 rounded py-2 transition-colors">
                    <div className="text-lg font-bold text-white font-mono group-hover/stat:text-blue-400 transition-colors">
                        {Math.round((profit.laborCosts / profit.totalRevenue) * 100) || 0}%
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Labor</div>
                </div>
                <div className="text-center group/stat hover:bg-zinc-800/50 rounded py-2 transition-colors">
                    <div className="text-lg font-bold text-white font-mono group-hover/stat:text-purple-400 transition-colors">
                        {Math.round((profit.fixedExpenses / profit.totalRevenue) * 100) || 0}%
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Fixed</div>
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
        <div className="flex items-center gap-4 px-4 py-2 bg-black border-l-4 border-yellow-500 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">순수익</span>
                <span className={`text-xl font-black font-mono ${isProfit ? "text-yellow-400" : "text-red-500"}`}>
                    <MoneyTicker value={netProfit} />
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
                        <span className={isUp ? "animate-bounce-up" : "animate-bounce-down"}>{isUp ? "▲" : "▼"}</span>
                        <span>{Math.abs(trend)}%</span>
                    </div>
                </>
            )}
        </div>
    );
}

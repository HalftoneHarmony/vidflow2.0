"use client";

/**
 * 💎 Customer LTV Table
 * 고객 생애 가치(LTV) 랭킹 테이블
 * @author Agent 3 (Analytics Master)
 */

import { motion } from "framer-motion";
import { Trophy, Medal, Award, Crown, TrendingUp, ShoppingBag } from "lucide-react";

// ==========================================
// Types
// ==========================================

type CustomerLTV = {
    customer_id: string;
    customer_name: string;
    customer_email: string;
    total_orders: number;
    total_spent: number;
    first_order_date: string;
    last_order_date: string;
    avg_order_value: number;
};

type Props = {
    data: CustomerLTV[];
};

// ==========================================
// Utils
// ==========================================

const currencyFormatter = (value: number) =>
    new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "KRW",
        maximumFractionDigits: 0,
    }).format(value);

const compactFormatter = (value: number) =>
    new Intl.NumberFormat("ko-KR", { notation: "compact" }).format(value);

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
};

const getRankIcon = (rank: number) => {
    switch (rank) {
        case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
        case 2: return <Medal className="w-5 h-5 text-zinc-400" />;
        case 3: return <Award className="w-5 h-5 text-amber-600" />;
        default: return <span className="text-sm font-mono text-zinc-500">{rank}</span>;
    }
};

const getRankBg = (rank: number) => {
    switch (rank) {
        case 1: return "bg-yellow-500/10 border-yellow-500/30";
        case 2: return "bg-zinc-500/10 border-zinc-500/30";
        case 3: return "bg-amber-600/10 border-amber-600/30";
        default: return "bg-zinc-800/30 border-zinc-700/50";
    }
};

// ==========================================
// Main Component
// ==========================================

export function CustomerLTVTable({ data }: Props) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 flex items-center justify-center min-h-[300px]">
                <div className="text-center text-zinc-500">
                    <Crown className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm uppercase tracking-wider">고객 LTV 데이터 없음</p>
                </div>
            </div>
        );
    }

    // Stats
    const totalLTV = data.reduce((sum, c) => sum + c.total_spent, 0);
    const avgLTV = data.length > 0 ? totalLTV / data.length : 0;
    const topCustomer = data[0];

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                        <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white font-[family-name:var(--font-oswald)] uppercase">
                            Customer LTV Leaderboard
                        </h3>
                        <p className="text-xs text-zinc-500">고객 생애 가치 랭킹</p>
                    </div>
                </div>

                {/* Summary Chips */}
                <div className="hidden md:flex items-center gap-2">
                    <div className="px-3 py-1 bg-zinc-800/50 border border-zinc-700 text-xs">
                        <span className="text-zinc-500">Top 1: </span>
                        <span className="text-yellow-500 font-mono font-bold">{compactFormatter(topCustomer?.total_spent || 0)}</span>
                    </div>
                    <div className="px-3 py-1 bg-zinc-800/50 border border-zinc-700 text-xs">
                        <span className="text-zinc-500">Avg: </span>
                        <span className="text-white font-mono font-bold">{compactFormatter(avgLTV)}</span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="space-y-2 relative z-10">
                {data.slice(0, 10).map((customer, index) => {
                    const rank = index + 1;
                    return (
                        <motion.div
                            key={customer.customer_id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-center gap-4 p-3 border ${getRankBg(rank)} hover:bg-zinc-800/50 transition-all group`}
                        >
                            {/* Rank */}
                            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                {getRankIcon(rank)}
                            </div>

                            {/* Customer Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-white truncate">
                                        {customer.customer_name}
                                    </p>
                                    {rank <= 3 && (
                                        <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-500 text-[10px] font-bold uppercase">
                                            VIP
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-zinc-500 truncate">
                                    {customer.customer_email}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="hidden sm:flex items-center gap-4">
                                <div className="text-center">
                                    <p className="text-[10px] text-zinc-500 uppercase">주문</p>
                                    <p className="text-sm font-mono font-bold text-white flex items-center gap-1">
                                        <ShoppingBag className="w-3 h-3 text-zinc-400" />
                                        {customer.total_orders}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-zinc-500 uppercase">평균</p>
                                    <p className="text-sm font-mono text-zinc-300">
                                        {compactFormatter(customer.avg_order_value)}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-zinc-500 uppercase">최근</p>
                                    <p className="text-sm font-mono text-zinc-300">
                                        {formatDate(customer.last_order_date)}
                                    </p>
                                </div>
                            </div>

                            {/* Total LTV */}
                            <div className="text-right">
                                <p className="text-[10px] text-zinc-500 uppercase">LTV</p>
                                <p className={`text-base font-mono font-bold ${rank === 1 ? "text-yellow-500" : rank <= 3 ? "text-white" : "text-zinc-300"}`}>
                                    {compactFormatter(customer.total_spent)}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* View More */}
            {data.length > 10 && (
                <div className="mt-4 text-center">
                    <p className="text-xs text-zinc-500">
                        + {data.length - 10}명 더 있음
                    </p>
                </div>
            )}
        </div>
    );
}

"use client";

/**
 * 📈 Revenue Chart Component
 * 일별/월별 매출 추이 시각화
 * @author Agent 3 (Analytics Master)
 */

import { useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";

// ==========================================
// Types
// ==========================================

type DailyRevenue = {
    order_date: string;
    daily_revenue: number;
    daily_orders: number;
};

type MonthlyGrowth = {
    month: string;
    monthly_revenue: number;
    monthly_orders: number;
    revenue_growth: number | null;
    order_growth: number | null;
};

type Props = {
    dailyData: DailyRevenue[];
    monthlyData: MonthlyGrowth[];
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

const formatDate = (dateStr: string, isMonthly: boolean) => {
    const date = new Date(dateStr);
    if (isMonthly) {
        return date.toLocaleDateString("ko-KR", { month: "short" });
    }
    return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
};

// ==========================================
// Custom Tooltip
// ==========================================

function CustomTooltip({ active, payload, label, isMonthly }: any) {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const growth = isMonthly ? data.revenue_growth : null;

        return (
            <div className="bg-zinc-950/95 border border-zinc-800 p-4 rounded-lg shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-2 mb-3 border-b border-zinc-800 pb-2">
                    <Calendar className="w-4 h-4 text-zinc-500" />
                    <span className="text-zinc-400 font-mono text-xs uppercase tracking-wider">
                        {label}
                    </span>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-6">
                        <span className="text-zinc-400 text-sm">매출</span>
                        <span className="text-white font-mono font-bold text-base">
                            {currencyFormatter(payload[0].value)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-6">
                        <span className="text-zinc-400 text-sm">주문</span>
                        <span className="text-zinc-300 font-mono text-sm">
                            {isMonthly ? data.monthly_orders : data.daily_orders}건
                        </span>
                    </div>
                    {growth !== null && growth !== undefined && (
                        <div className="flex items-center justify-between gap-6 pt-2 border-t border-zinc-800">
                            <span className="text-zinc-400 text-sm">성장률</span>
                            <span className={`font-mono font-bold text-sm flex items-center gap-1 ${growth >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                {growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {growth >= 0 ? "+" : ""}{growth.toFixed(1)}%
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
}

// ==========================================
// Main Component
// ==========================================

export function RevenueChart({ dailyData, monthlyData }: Props) {
    const [viewMode, setViewMode] = useState<"daily" | "monthly">("daily");

    // Transform data for chart
    const chartData = viewMode === "daily"
        ? dailyData.slice().reverse().map(d => ({
            ...d,
            label: formatDate(d.order_date, false),
            value: d.daily_revenue,
        }))
        : monthlyData.slice().reverse().map(d => ({
            ...d,
            label: formatDate(d.month, true),
            value: d.monthly_revenue,
        }));

    // Calculate summary stats
    const totalRevenue = chartData.reduce((sum, d) => sum + d.value, 0);
    const avgRevenue = chartData.length > 0 ? totalRevenue / chartData.length : 0;
    const latestGrowth = viewMode === "monthly" && monthlyData[0]?.revenue_growth;

    if (chartData.length === 0) {
        return (
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 min-h-[400px] flex items-center justify-center">
                <div className="text-center text-zinc-500">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm uppercase tracking-wider">매출 데이터 없음</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white font-[family-name:var(--font-oswald)] uppercase">
                            Revenue Trend
                        </h3>
                        <p className="text-xs text-zinc-500">매출 추이 분석</p>
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-zinc-800/50 p-1 border border-zinc-700">
                    <button
                        onClick={() => setViewMode("daily")}
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${viewMode === "daily"
                                ? "bg-blue-600 text-white"
                                : "text-zinc-400 hover:text-white"
                            }`}
                    >
                        일별
                    </button>
                    <button
                        onClick={() => setViewMode("monthly")}
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${viewMode === "monthly"
                                ? "bg-blue-600 text-white"
                                : "text-zinc-400 hover:text-white"
                            }`}
                    >
                        월별
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-zinc-800/30 border border-zinc-700/50 p-3">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                        {viewMode === "daily" ? "30일" : "12개월"} 총 매출
                    </p>
                    <p className="text-xl font-bold text-white font-mono">
                        {compactFormatter(totalRevenue)}
                    </p>
                </div>
                <div className="bg-zinc-800/30 border border-zinc-700/50 p-3">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                        평균 {viewMode === "daily" ? "일" : "월"} 매출
                    </p>
                    <p className="text-xl font-bold text-white font-mono">
                        {compactFormatter(avgRevenue)}
                    </p>
                </div>
                {viewMode === "monthly" && typeof latestGrowth === "number" && (
                    <div className="bg-zinc-800/30 border border-zinc-700/50 p-3">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                            최근 성장률
                        </p>
                        <p className={`text-xl font-bold font-mono flex items-center gap-1 ${latestGrowth >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {latestGrowth >= 0 ? "+" : ""}{latestGrowth.toFixed(1)}%
                            <ArrowUpRight className={`w-4 h-4 ${latestGrowth < 0 ? "rotate-180" : ""}`} />
                        </p>
                    </div>
                )}
            </div>

            {/* Chart */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={viewMode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="h-[280px] w-full"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#ffffff08"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="label"
                                stroke="#52525b"
                                tick={{ fill: "#71717a", fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#52525b"
                                tick={{ fill: "#71717a", fontSize: 11, fontFamily: "monospace" }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={compactFormatter}
                            />
                            <Tooltip
                                content={<CustomTooltip isMonthly={viewMode === "monthly"} />}
                                cursor={{ stroke: "#ffffff20" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="url(#revenueGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

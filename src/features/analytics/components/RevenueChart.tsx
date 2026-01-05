"use client";

/**
 * 📈 Revenue Chart Component
 * 일별/월별 매출 추이 시각화
 * @author Agent 3 (Analytics Master)
 */

import { useState, useEffect, useRef } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence, animate } from "framer-motion";
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
// Utils & Components
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

function CountUp({ value, formatter, className }: { value: number, formatter: (v: number) => string, className?: string }) {
    const nodeRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const node = nodeRef.current;
        if (!node) return;

        const controls = animate(0, value, {
            duration: 1.5,
            ease: "easeOut",
            onUpdate(value) {
                node.textContent = formatter(value);
            },
        });

        return () => controls.stop();
    }, [value, formatter]);

    return <span ref={nodeRef} className={className}>{formatter(0)}</span>;
}

// ==========================================
// Custom Tooltip
// ==========================================

function CustomTooltip({ active, payload, label, isMonthly }: any) {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const growth = isMonthly ? data.revenue_growth : null;

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-zinc-950/90 border border-zinc-800 p-4 rounded-xl shadow-2xl backdrop-blur-xl ring-1 ring-white/10"
            >
                <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-300 font-mono text-xs uppercase tracking-wider font-bold">
                        {label}
                    </span>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-8">
                        <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Revenue</span>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                            <span className="text-white font-mono font-bold text-lg tracking-tight">
                                {currencyFormatter(payload[0].value)}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-8">
                        <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Orders</span>
                        <span className="text-zinc-300 font-mono text-sm">
                            {isMonthly ? data.monthly_orders : data.daily_orders} <span className="text-zinc-500 text-xs">orders</span>
                        </span>
                    </div>
                    {growth !== null && growth !== undefined && (
                        <div className="flex items-center justify-between gap-8 pt-2 border-t border-white/5">
                            <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Growth</span>
                            <span className={`font-mono font-bold text-sm flex items-center gap-1 ${growth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {growth >= 0 ? "+" : ""}{growth.toFixed(1)}%
                            </span>
                        </div>
                    )}
                </div>
            </motion.div>
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
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 relative overflow-hidden rounded-2xl group">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-transparent pointer-events-none group-hover:from-blue-600/10 transition-colors duration-500" />

            {/* Header */}
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center rounded-xl shadow-lg shadow-blue-900/20 ring-1 ring-white/10">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white font-[family-name:var(--font-oswald)] uppercase tracking-wide">
                            Revenue Trend
                        </h3>
                        <p className="text-xs text-zinc-400 font-medium">매출 추이 및 성장 분석</p>
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-zinc-950/50 p-1.5 border border-zinc-800 rounded-lg backdrop-blur-sm">
                    {["daily", "monthly"].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode as any)}
                            className={`
                                relative px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all rounded-md z-0
                                ${viewMode === mode ? "text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}
                            `}
                        >
                            {viewMode === mode && (
                                <motion.div
                                    layoutId="revenue-tab"
                                    className="absolute inset-0 bg-zinc-800 rounded-md -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            {mode === "daily" ? "일별" : "월별"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl hover:bg-zinc-800/50 transition-colors"
                >
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-medium">
                        {viewMode === "daily" ? "30일" : "12개월"} 총 매출
                    </p>
                    <p className="text-2xl font-bold text-white font-mono tracking-tight">
                        <CountUp value={totalRevenue} formatter={compactFormatter} />
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl hover:bg-zinc-800/50 transition-colors"
                >
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-medium">
                        평균 {viewMode === "daily" ? "일" : "월"} 매출
                    </p>
                    <p className="text-2xl font-bold text-white font-mono tracking-tight">
                        <CountUp value={avgRevenue} formatter={compactFormatter} />
                    </p>
                </motion.div>

                {viewMode === "monthly" && typeof latestGrowth === "number" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl hover:bg-zinc-800/50 transition-colors"
                    >
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-medium">
                            최근 성장률
                        </p>
                        <p className={`text-2xl font-bold font-mono tracking-tight flex items-center gap-1 ${latestGrowth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {latestGrowth >= 0 ? "+" : ""}<CountUp value={latestGrowth} formatter={(v) => v.toFixed(1)} />%
                            <ArrowUpRight className={`w-5 h-5 ${latestGrowth < 0 ? "rotate-180" : ""}`} />
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Chart */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={viewMode}
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.98 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-[320px] w-full"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                                tick={{ fill: "#71717a", fontSize: 11, fontWeight: 500 }}
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
                                cursor={{ stroke: "#3b82f6", strokeWidth: 1, strokeDasharray: "5 5" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fill="url(#revenueGradient)"
                                animationDuration={2000}
                                animationEasing="ease-out"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

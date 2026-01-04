"use client";

/**
 * 📊 Event Comparison Chart
 * 이벤트별 매출, 순이익, 주문 수 비교 분석
 * @author Agent 3 (Analytics Master)
 */

import { useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ReferenceLine
} from "recharts";
import { Calendar, DollarSign, TrendingUp } from "lucide-react";

// ==========================================
// Types
// ==========================================

export type EventAnalyticsData = {
    event_id: number;
    event_title: string;
    event_date: string;
    total_orders: number;
    gross_revenue: number;
    total_expenses: number;
    net_profit: number;
    profit_margin?: number;
    package_counts?: Record<string, number>;
};

type Props = {
    data: EventAnalyticsData[];
    onEventClick?: (event: EventAnalyticsData) => void;
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

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-950/95 border border-zinc-800 p-4 rounded-lg shadow-2xl backdrop-blur-md z-50">
                <p className="text-zinc-300 font-bold mb-3 border-b border-zinc-800 pb-2">{label}</p>
                <div className="space-y-2">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-4 min-w-[200px]">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-zinc-400 text-xs uppercase">{entry.name}</span>
                            </div>
                            <span className="text-white font-mono font-bold text-sm">
                                {typeof entry.value === 'number' && entry.name !== 'Total Orders'
                                    ? currencyFormatter(entry.value)
                                    : entry.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

// ==========================================
// Main Component
// ==========================================

export function EventComparisonChart({ data, onEventClick }: Props) {
    const [sortBy, setSortBy] = useState<"date" | "revenue" | "profit" | "orders">("date");

    // Process and sort data
    const chartData = [...data].sort((a, b) => {
        if (sortBy === "revenue") return b.gross_revenue - a.gross_revenue;
        if (sortBy === "profit") return b.net_profit - a.net_profit;
        if (sortBy === "orders") return b.total_orders - a.total_orders;
        return new Date(b.event_date).getTime() - new Date(a.event_date).getTime(); // Default: Newest first
    }).slice(0, 10); // Show top 10 only

    if (data.length === 0) {
        return (
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 flex flex-col items-center justify-center min-h-[400px]">
                <div className="text-center text-zinc-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm uppercase tracking-wider">이벤트 데이터 없음</p>
                </div>
            </div>
        );
    }

    const isOrderView = sortBy === "orders";

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 relative overflow-hidden h-full rounded-2xl">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center rounded-lg shadow-lg shadow-emerald-900/20">
                        {isOrderView ? <TrendingUp className="w-5 h-5 text-white" /> : <DollarSign className="w-5 h-5 text-white" />}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white font-[family-name:var(--font-oswald)] uppercase">
                            Event Performance
                        </h3>
                        <p className="text-xs text-zinc-500">
                            {isOrderView ? "이벤트별 신청 건수 비교 (Top 10)" : "이벤트별 실적 비교 (Top 10)"}
                        </p>
                    </div>
                </div>

                {/* Sort Controls */}
                <div className="flex items-center gap-1 bg-zinc-800/50 p-1 border border-zinc-700 rounded-lg">
                    <button
                        onClick={() => setSortBy("date")}
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all rounded-md ${sortBy === "date" ? "bg-zinc-600 text-white shadow-lg" : "text-zinc-400 hover:text-white"}`}
                    >
                        최신순
                    </button>
                    <button
                        onClick={() => setSortBy("orders")}
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all rounded-md ${sortBy === "orders" ? "bg-blue-600 text-white shadow-lg" : "text-zinc-400 hover:text-white"}`}
                    >
                        신청순
                    </button>
                    <button
                        onClick={() => setSortBy("revenue")}
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all rounded-md ${sortBy === "revenue" ? "bg-emerald-600 text-white shadow-lg" : "text-zinc-400 hover:text-white"}`}
                    >
                        매출순
                    </button>
                    <button
                        onClick={() => setSortBy("profit")}
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all rounded-md ${sortBy === "profit" ? "bg-emerald-600 text-white shadow-lg" : "text-zinc-400 hover:text-white"}`}
                    >
                        수익순
                    </button>
                </div>
            </div>

            {/* Chart */}
            <div className="h-[300px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%" minHeight={280}>
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                        barSize={isOrderView ? 40 : 20}
                        onClick={(data: any) => {
                            if (data && data.activePayload && data.activePayload.length > 0) {
                                onEventClick?.(data.activePayload[0].payload as EventAnalyticsData);
                            }
                        }}
                        className="cursor-pointer"
                    >
                        <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                                <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                                <stop offset="100%" stopColor="#047857" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                                <stop offset="100%" stopColor="#2563eb" stopOpacity={1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                        <XAxis
                            dataKey="event_title"
                            stroke="#52525b"
                            tick={{ fill: "#71717a", fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => val.length > 10 ? `${val.substring(0, 8)}...` : val}
                        />
                        <YAxis
                            stroke="#52525b"
                            tick={{ fill: "#71717a", fontSize: 11, fontFamily: "monospace" }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={isOrderView ? (val) => val : compactFormatter}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff05" }} />
                        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                        <ReferenceLine y={0} stroke="#52525b" />

                        {isOrderView ? (
                            <Bar
                                dataKey="total_orders"
                                name="Total Orders"
                                fill="url(#orderGradient)"
                                radius={[4, 4, 0, 0]}
                            />
                        ) : (
                            <>
                                <Bar
                                    dataKey="gross_revenue"
                                    name="Total Revenue"
                                    fill="url(#revenueGradient)"
                                    radius={[4, 4, 0, 0]}
                                    opacity={0.6}
                                />
                                <Bar
                                    dataKey="net_profit"
                                    name="Net Profit"
                                    fill="url(#profitGradient)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </>
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Top Analysis Footer (Dynamic) */}
            {chartData.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-500">{isOrderView ? "최다 신청 이벤트:" : "최고 수익 이벤트:"}</span>
                        <span className={isOrderView ? "text-blue-500 font-bold" : "text-emerald-500 font-bold"}>
                            {isOrderView
                                ? chartData.reduce((prev, current) => (prev.total_orders > current.total_orders) ? prev : current).event_title
                                : chartData.reduce((prev, current) => (prev.net_profit > current.net_profit) ? prev : current).event_title
                            }
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

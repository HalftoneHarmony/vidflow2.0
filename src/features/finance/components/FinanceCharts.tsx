/**
 * 📊 Finance Charts
 * 재무 관리 페이지용 상세 분석 차트 모음
 * Agent 7: Gold (The Treasurer)
 */

"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Sector,
} from "recharts";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// ==========================================
// Types
// ==========================================

type EventFinancialData = {
    name: string;
    revenue: number;
    profit: number;
    expense: number;
};

type EventProfitChartProps = {
    data: EventFinancialData[];
};

type CostData = {
    name: string;
    value: number;
    color: string;
};

type CostBreakdownChartProps = {
    data: CostData[];
};

// ==========================================
// Gradients & Utilities
// ==========================================

const ChartGradients = () => (
    <defs>
        <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity={1} />
            <stop offset="100%" stopColor="#d97706" stopOpacity={1} />
        </linearGradient>
        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={1} />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
    </defs>
);

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
            <div className="bg-zinc-950/90 border border-zinc-800 p-4 rounded-xl shadow-2xl backdrop-blur-md z-50">
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-wider mb-3 border-b border-zinc-800 pb-2">
                    {label}
                </p>
                <div className="space-y-2">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-4 min-w-[200px]">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-zinc-300 text-sm font-medium">
                                    {entry.name}
                                </span>
                            </div>
                            <span className="text-white font-mono font-bold text-sm">
                                {currencyFormatter(entry.value)}
                            </span>
                        </div>
                    ))}
                    {/* Total Summary (Optional, assumes stacked) */}
                    {payload.length > 1 && (
                        <div className="flex items-center justify-between gap-4 pt-2 border-t border-zinc-800 mt-2">
                            <span className="text-zinc-400 text-sm font-medium">Total Revenue</span>
                            <span className="text-white font-mono font-bold text-sm">
                                {currencyFormatter(
                                    payload.reduce((acc: number, curr: any) => acc + curr.value, 0)
                                )}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

// ==========================================
// 1. Event Profitability Chart (Stacked)
// ==========================================

export function EventProfitChart({ data }: EventProfitChartProps) {
    if (!data || data.length === 0) return <NoDataMessage />;

    return (
        <div className="w-full bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-2xl h-full backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/20 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></span>
                    Revenue Composition
                </h3>
                <div className="flex text-xs font-mono text-zinc-500 gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-yellow-500 rounded-sm" /> Net Profit
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-red-500 rounded-sm" /> Expenses
                    </div>
                </div>
            </div>

            <div className="h-[320px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        barSize={32}
                    >
                        <ChartGradients />
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#ffffff08"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="name"
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
                            content={<CustomTooltip />}
                            cursor={{ fill: "#ffffff05" }}
                        />
                        {/* Stacked Bars: Expense first (bottom), then Profit (top) */}
                        <Bar
                            dataKey="expense"
                            name="Expenses"
                            stackId="a"
                            fill="url(#expenseGradient)"
                            radius={[0, 0, 0, 0]}
                        />
                        <Bar
                            dataKey="profit"
                            name="Net Profit"
                            stackId="a"
                            fill="url(#profitGradient)"
                            radius={[6, 6, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ==========================================
// 2. Cost Breakdown Chart (Active Donut)
// ==========================================

const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;

    return (
        <g>
            <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#fff" className="font-mono font-bold text-2xl">
                {payload.name}
            </text>
            <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="#71717a" className="font-mono text-sm">
                {compactFormatter(value)}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 8}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                stroke="rgba(0,0,0,0.5)"
                strokeWidth={2}
                style={{ filter: "drop-shadow(0px 0px 10px rgba(0,0,0,0.5))" }}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={innerRadius - 6}
                outerRadius={innerRadius - 2}
                fill={fill}
                fillOpacity={0.3}
            />
        </g>
    );
};

export function CostBreakdownChart({ data }: CostBreakdownChartProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const total = data.reduce((acc, curr) => acc + curr.value, 0);

    const onPieEnter = (_: unknown, index: number) => {
        setActiveIndex(index);
    };

    if (total === 0) return <NoDataMessage />;

    // Get active item info for center display
    const activeItem = data[activeIndex];

    return (
        <div className="w-full bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-2xl h-full backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/10 to-transparent pointer-events-none" />

            <h3 className="text-sm font-bold text-zinc-300 mb-8 uppercase tracking-wider flex items-center gap-2 relative z-10">
                <span className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]"></span>
                Cost Breakdown
            </h3>

            <div className="h-[320px] w-full relative z-10 flex items-center justify-center -mt-4">
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                    <span className="text-white font-mono font-bold text-xl">{activeItem?.name}</span>
                    <span className="text-zinc-500 font-mono text-sm">{compactFormatter(activeItem?.value || 0)}</span>
                </div>

                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={4}
                            dataKey="value"
                            onMouseEnter={onPieEnter}
                            stroke="rgba(0,0,0,0)"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    stroke="rgba(0,0,0,0.2)"
                                    style={{
                                        filter: activeIndex === index ? "brightness(1.2)" : "brightness(1)",
                                        transform: activeIndex === index ? "scale(1.05)" : "scale(1)",
                                        transformOrigin: "center",
                                        transition: "all 0.2s ease-out"
                                    }}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function NoDataMessage() {
    return (
        <div className="w-full bg-zinc-900/50 border border-zinc-800/50 p-6 h-full flex flex-col items-center justify-center rounded-2xl">
            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            </div>
            <p className="text-zinc-500 font-mono text-sm">No financial data available</p>
        </div>
    );
}

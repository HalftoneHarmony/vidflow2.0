"use client";

import { EventDetailedAnalysis } from "../queries";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    Legend,
    Sector,
} from "recharts";
import { motion } from "framer-motion";
import { useState } from "react";

interface Props {
    data: EventDetailedAnalysis;
    onBack: () => void;
}

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

// Gradients for charts
const AnalysisGradients = () => (
    <defs>
        <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#2563eb" stopOpacity={1} />
        </linearGradient>
        <filter id="cardGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
    </defs>
);

function KPICard({ label, value, subtext, type = "default" }: { label: string; value: string; subtext?: string; type?: "default" | "success" | "warning" }) {
    const borderColors = {
        default: "border-zinc-800",
        success: "border-emerald-500/50",
        warning: "border-amber-500/50"
    };

    const bgColors = {
        default: "bg-zinc-900/50",
        success: "bg-emerald-900/10",
        warning: "bg-amber-900/10"
    };

    return (
        <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`${bgColors[type]} border ${borderColors[type]} p-6 rounded-xl relative overflow-hidden backdrop-blur-sm group shadow-lg`}
        >
            <div className={`absolute top-0 right-0 p-20 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/10 transition-colors`} />
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-2 relative z-10">{label}</p>
            <p className="text-3xl font-black text-white relative z-10 font-mono">{value}</p>
            {subtext && <p className="text-xs text-zinc-400 mt-2 relative z-10 flex items-center gap-1">
                {type === 'success' && <span className="text-emerald-500">▲</span>}
                {subtext}
            </p>}
        </motion.div>
    );
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-950/90 border border-zinc-700 p-4 rounded-xl shadow-2xl backdrop-blur-md">
                <p className="text-zinc-400 text-xs font-mono uppercase mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                        <span className="text-white font-bold font-mono">
                            {new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(entry.value)}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// Active Shape for Donut
const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
    return (
        <g>
            <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#fff" className="font-bold text-xl">
                {(percent * 100).toFixed(0)}%
            </text>
            <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="#71717a" className="text-xs font-mono">
                {payload.packageName.substring(0, 10)}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 6}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                stroke="rgba(0,0,0,0.5)"
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={innerRadius - 4}
                outerRadius={innerRadius}
                fill={fill}
                fillOpacity={0.4}
            />
        </g>
    );
};

export function EventDetailAnalysis({ data, onBack }: Props) {
    const [activeIndex, setActiveIndex] = useState(0);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(val);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
                <div>
                    <button
                        onClick={onBack}
                        className="group flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-white mb-3 transition-colors px-3 py-1.5 rounded-full hover:bg-zinc-800/50"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> BACK TO OVERVIEW
                    </button>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <span className="w-3 h-8 bg-blue-600 rounded-sm inline-block" />
                        {data.eventTitle}
                    </h1>
                </div>
                <div className="text-right">
                    <p className="text-sm text-zinc-500 font-mono">ANALYSIS REPORT</p>
                    <p className="text-xs text-zinc-600">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <KPICard
                    label="Total Revenue"
                    value={formatCurrency(data.summary.totalRevenue)}
                    subtext="Gross Income"
                    type="default"
                />
                <KPICard
                    label="Net Profit"
                    value={formatCurrency(data.summary.netProfit)}
                    subtext={`Margin: ${data.summary.profitMargin}%`}
                    type={data.summary.netProfit > 0 ? "success" : "warning"}
                />
                <KPICard
                    label="Participants"
                    value={`${data.summary.totalParticipants}명`}
                    subtext="Unique Athletes"
                    type="default"
                />

                <KPICard
                    label="Expenses"
                    value={formatCurrency(data.summary.totalExpenses)}
                    subtext="Total Costs"
                    type="warning"
                />
                <KPICard
                    label="Top Package"
                    value={data.topSellingPackage?.name || "-"}
                    subtext={formatCurrency(data.topSellingPackage?.revenue || 0)}
                    type="default"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[420px]">
                {/* Revenue by Package Chart */}
                <div className="bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-2xl flex flex-col backdrop-blur-sm shadow-xl">
                    <h3 className="text-sm font-bold text-zinc-300 mb-6 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]"></span>
                        Revenue by Package
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.revenueByPackage} layout="vertical" margin={{ left: 20, right: 30 }}>
                                <AnalysisGradients />
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
                                <XAxis type="number" stroke="#52525b" tickFormatter={(val) => `${val / 10000}만`} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="packageName" width={100} stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: "#ffffff05" }}
                                    content={<CustomTooltip />}
                                />
                                <Bar dataKey="revenue" fill="url(#barGradient)" radius={[0, 6, 6, 0]} barSize={24}>
                                    {data.revenueByPackage.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Participant Share Chart */}
                <div className="bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-2xl flex flex-col backdrop-blur-sm shadow-xl">
                    <h3 className="text-sm font-bold text-zinc-300 mb-6 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></span>
                        Participant Distribution
                    </h3>
                    <div className="flex-1 w-full min-h-0 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    // @ts-expect-error - Recharts type definition missing activeIndex
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}
                                    data={data.revenueByPackage}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={4}
                                    dataKey="count"
                                    nameKey="packageName"
                                    onMouseEnter={onPieEnter}
                                >
                                    {data.revenueByPackage.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.3)" />
                                    ))}
                                </Pie>
                                <Legend wrapperStyle={{ fontSize: "11px", color: "#a1a1aa" }} layout="vertical" align="right" verticalAlign="middle" />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            {/* Optional center content if needed */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
                <div className="p-6 border-b border-zinc-800/50 flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Detailed Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-900/80 text-zinc-500 font-mono uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 font-normal">Package</th>
                                <th className="px-6 py-4 text-right font-normal">Participants</th>
                                <th className="px-6 py-4 text-right font-normal">Revenue</th>
                                <th className="px-6 py-4 text-right font-normal">Share</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {data.revenueByPackage.map((pkg) => (
                                <tr key={pkg.packageId} className="hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-white group-hover:text-blue-400 transition-colors">{pkg.packageName}</td>
                                    <td className="px-6 py-4 text-right text-zinc-400">{pkg.count}</td>
                                    <td className="px-6 py-4 text-right text-white font-mono font-bold">{formatCurrency(pkg.revenue)}</td>
                                    <td className="px-6 py-4 text-right text-zinc-500 font-mono">
                                        <span className="bg-zinc-800 px-2 py-1 rounded text-xs">
                                            {((pkg.revenue / data.summary.totalRevenue) * 100).toFixed(1)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}

"use client";

/**
 * 📊 Analytics Dashboard Container (Refactored)
 * Minimal & Dense Design with Event Deep Dive
 * @author Agent 3 (Analytics Master)
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Users, ShoppingBag, TrendingUp, Wallet, BarChart3, PieChart, Activity, ChevronDown, Package as PackageIcon, ArrowRight, Calendar } from "lucide-react";
import {
    PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

// Components
import { EventComparisonChart, EventAnalyticsData } from "./EventComparisonChart";
import { BottleneckFunnelChart } from "./BottleneckFunnelChart";
import { DisciplineAnalyticsChart, DisciplineStats, PackageStats } from "./DisciplineAnalyticsChart";
import { KPIGoalsProgress, generateDefaultGoals } from "./KPIGoalsProgress";
import { ExpenseDetailSection } from "@/features/finance/components/ExpenseDetailSection";
import { CostBreakdownChart } from "@/features/finance/components/FinanceCharts";
import { MotionCard } from "@/components/ui/motion-card";
import { AnimatedNumber } from "@/components/ui/animated-number";

// ==========================================
// Types
// ==========================================

type DailyRevenue = { order_date: string; daily_revenue: number; daily_orders: number; };
type MonthlyGrowth = { month: string; revenue: number; orders: number; revenue_growth_pct: number | null; };
type CustomerLTV = { customer_id: string; total_spent: number; };

type Props = {
    dailyRevenue: DailyRevenue[];
    monthlyGrowth: MonthlyGrowth[];
    customerSegments: any;
    customerLTV: CustomerLTV[];
    pipelineBottleneck: any;
    eventAnalytics: EventAnalyticsData[];
    disciplineAnalytics: DisciplineStats[];
    packageAnalytics: PackageStats[];
    financeEvents: any[];
    eventList: any[];
    allExpenses: any[];
    totalStats: any;
    financeChartData: any;
};

// ==========================================
// Utils & Shared Components
// ==========================================

const formatCurrency = (val: number) => {
    const safeVal = Number.isFinite(val) ? val : 0;
    return new Intl.NumberFormat("ko-KR", { notation: "compact" }).format(safeVal);
};

interface KPICardProps {
    label: string;
    rawValue?: number;
    value?: string | number; // Fallback
    trend?: number;
    subLabel?: string;
    icon: any;
    color?: "default" | "emerald" | "blue" | "red";
    index?: number;
    prefix?: string;
    suffix?: string;
}

function KPICard({ label, rawValue, value, trend, subLabel, icon: Icon, color = "default", index = 0, prefix = "", suffix = "" }: KPICardProps) {
    const colorStyles = {
        default: "border-zinc-800 bg-zinc-900/50",
        emerald: "border-emerald-900/30 bg-emerald-950/10",
        blue: "border-blue-900/30 bg-blue-950/10",
        red: "border-red-900/30 bg-red-950/10",
    };

    return (
        <MotionCard
            delay={index * 0.1}
            className={`p-5 rounded-xl border ${colorStyles[color]} relative overflow-hidden group`}
            hoverEffect={true}
        >
            <div className="flex justify-between items-start mb-2">
                <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold">{label}</p>
                <Icon className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </div>
            <h3 className="text-2xl font-black text-white font-[family-name:var(--font-oswald)]">
                {typeof rawValue === 'number' ? (
                    <AnimatedNumber
                        value={rawValue}
                        format={formatCurrency}
                        prefix={prefix}
                        suffix={suffix}
                    />
                ) : value}
            </h3>
            {trend !== undefined && (
                <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-bold ${trend >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-zinc-600 uppercase">{subLabel}</span>
                </div>
            )}
        </MotionCard>
    );
}

// ==========================================
// Internal Components
// ==========================================

// Package Distribution Chart (Enhanced with Toggle)
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

const PackageDistributionChart = ({ data, type }: { data: { name: string; value: number }[], type: "pie" | "bar" }) => {
    if (type === "pie") {
        return (
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <RechartsPieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                        ))}
                    </Pie>
                    <RechartsTooltip
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                        itemStyle={{ color: '#e4e4e7', fontSize: '12px' }}
                    />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                        <tspan x="50%" dy="-1em" fontSize="12" fill="#71717a">TOTAL</tspan>
                        <tspan x="50%" dy="1.5em" fontSize="24" fontWeight="bold" fill="#fff">
                            {data.reduce((acc, curr) => acc + curr.value, 0)}
                        </tspan>
                    </text>
                </RechartsPieChart>
            </ResponsiveContainer>
        );
    }

    // Bar Chart View
    return (
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
            <RechartsBarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#3f3f46" opacity={0.3} />
                <XAxis type="number" hide />
                <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fill: '#a1a1aa', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                />
                <RechartsTooltip
                    cursor={{ fill: '#ffffff10' }}
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                    itemStyle={{ color: '#e4e4e7', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </RechartsBarChart>
        </ResponsiveContainer>
    );
};

// ==========================================
// Main Dashboard
// ==========================================

export function AnalyticsDashboard({
    monthlyGrowth,
    customerLTV,
    pipelineBottleneck,
    eventAnalytics,
    disciplineAnalytics,
    packageAnalytics,
    allExpenses,
    eventList,
    totalStats,
    financeChartData,
}: Props) {
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [showExpenseTable, setShowExpenseTable] = useState(false);
    const [packageChartType, setPackageChartType] = useState<"pie" | "bar">("pie");

    // KPI Calc (DB uses revenue, revenue_growth_pct columns)
    const currentMonth = monthlyGrowth[0] || { revenue: 0, orders: 0, revenue_growth_pct: 0 };
    const monthlyRevenue = Number(currentMonth.revenue) || 0;
    const revenueGrowth = Number(currentMonth.revenue_growth_pct) || 0;
    const profitMargin = totalStats.totalRevenue > 0 ? Math.round((totalStats.netProfit / totalStats.totalRevenue) * 100) : 0;

    // Default Select Top Event
    useEffect(() => {
        if (eventAnalytics.length > 0 && !selectedEventId) {
            setSelectedEventId(eventAnalytics[0].event_id);
        }
    }, [eventAnalytics, selectedEventId]);

    const selectedEvent = eventAnalytics.find(e => e.event_id === selectedEventId);

    // Package Chart Data
    const packageChartData = selectedEvent?.package_counts
        ? Object.entries(selectedEvent.package_counts).map(([name, value]) => ({ name, value }))
        : [];

    // KPI Goals calculation
    const totalOrdersCount = eventAnalytics.reduce((sum, e) => sum + (e.total_orders || 0), 0);
    const kpiGoals = generateDefaultGoals({
        monthlyRevenue,
        totalOrders: totalOrdersCount,
        totalCustomers: customerLTV.length,
        profitMargin,
        revenueGrowth,
    });

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* 1. KPI Goals Progress */}
            <MotionCard delay={0.1} className="p-0 border-none bg-transparent" hoverEffect={false}>
                <KPIGoalsProgress goals={kpiGoals} />
            </MotionCard>

            {/* 2. Global KPI Section (Dense) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPICard
                    index={0}
                    label="Monthly Revenue"
                    rawValue={monthlyRevenue}
                    prefix="₩"
                    trend={revenueGrowth}
                    subLabel="MoM"
                    icon={DollarSign}
                    color="emerald"
                />
                <KPICard
                    index={1}
                    label="Active Customers"
                    rawValue={customerLTV.length}
                    subLabel="Total Analyzed"
                    icon={Users}
                />
                <KPICard
                    index={2}
                    label="Total Net Profit"
                    rawValue={totalStats.netProfit}
                    prefix="₩"
                    subLabel="All Time"
                    icon={Wallet}
                    color="default"
                />
                <KPICard
                    index={3}
                    label="Profit Margin"
                    value={`${profitMargin}%`}
                    subLabel="Average"
                    icon={PieChart}
                    color="blue"
                />
            </div>

            {/* 2. Event Performance Comparison (Main) */}
            <MotionCard delay={0.4} className="p-0 overflow-visible border-none bg-transparent" hoverEffect={false}>
                <EventComparisonChart
                    data={eventAnalytics}
                    onEventClick={(event) => {
                        setSelectedEventId(event.event_id);
                        document.getElementById('deep-dive-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                />
            </MotionCard>

            {/* 3. Event Deep Dive Section */}
            <MotionCard
                delay={0.5}
                className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl glass-panel p-0"
                hoverEffect={false}
            >
                <div id="deep-dive-section">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-zinc-950/50 backdrop-blur-sm gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <Activity className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white font-[family-name:var(--font-oswald)] uppercase tracking-wide">
                                    Deep Dive Analysis
                                </h2>
                                <p className="text-xs text-zinc-500">개별 이벤트 상세 분석 및 종목별 현황</p>
                            </div>
                        </div>

                        {/* Event Selector (Styled for visibility) */}
                        <div className="relative w-full sm:w-auto">
                            <select
                                value={selectedEventId || ""}
                                onChange={(e) => setSelectedEventId(Number(e.target.value))}
                                className="w-full sm:w-[300px] bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg pl-4 pr-10 py-2.5 
                                        focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none cursor-pointer 
                                        hover:border-zinc-500 transition-all font-medium shadow-lg"
                                style={{ colorScheme: 'dark' }} // Force dark scrollbar/options
                            >
                                {eventAnalytics.map(e => (
                                    <option key={e.event_id} value={e.event_id} className="bg-zinc-900 text-white py-2">
                                        {e.event_title} ({e.event_date.split('T')[0]})
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Content */}
                    {selectedEvent ? (
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left: Summary Stats */}
                            <div className="space-y-6 lg:border-r border-zinc-800 lg:pr-8">
                                <div>
                                    <h3 className="text-2xl font-black text-white mb-1 leading-tight">{selectedEvent.event_title}</h3>
                                    <div className="flex items-center gap-2 text-zinc-500 text-sm font-mono mt-2">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(selectedEvent.event_date).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="grid gap-3">
                                    <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 flex justify-between items-center group hover:border-zinc-700 transition-colors">
                                        <div>
                                            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Total Revenue</p>
                                            <p className="text-white font-mono font-bold text-lg group-hover:text-emerald-400 transition-colors">
                                                <AnimatedNumber value={selectedEvent.gross_revenue} format={formatCurrency} prefix="₩" />
                                            </p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                                            <DollarSign className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 flex justify-between items-center group hover:border-zinc-700 transition-colors">
                                        <div>
                                            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Net Profit</p>
                                            <p className="text-emerald-500 font-mono font-bold text-lg">
                                                <AnimatedNumber value={selectedEvent.net_profit} format={formatCurrency} prefix="₩" />
                                            </p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-emerald-900/20 flex items-center justify-center text-emerald-500">
                                            <TrendingUp className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 flex justify-between items-center group hover:border-zinc-700 transition-colors">
                                        <div>
                                            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Total Orders</p>
                                            <p className="text-blue-400 font-mono font-bold text-lg">
                                                <AnimatedNumber value={selectedEvent.total_orders} />
                                            </p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-blue-900/20 flex items-center justify-center text-blue-500">
                                            <Users className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Middle: Package Distribution ("종목별 신청") */}
                            <div className="bg-zinc-900/20 rounded-xl p-5 border border-zinc-800/50 relative flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                        <PackageIcon className="w-3 h-3" />
                                        Package Distribution
                                    </h4>
                                    {/* Chart Type Toggle */}
                                    <div className="flex bg-zinc-800/50 rounded-lg p-0.5 border border-zinc-700">
                                        <button
                                            onClick={() => setPackageChartType("pie")}
                                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${packageChartType === "pie" ? "bg-zinc-600 text-white shadow" : "text-zinc-500 hover:text-zinc-300"}`}
                                        >
                                            Pie
                                        </button>
                                        <button
                                            onClick={() => setPackageChartType("bar")}
                                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${packageChartType === "bar" ? "bg-zinc-600 text-white shadow" : "text-zinc-500 hover:text-zinc-300"}`}
                                        >
                                            Bar
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 min-h-[250px] relative">
                                    {packageChartData.length > 0 ? (
                                        <PackageDistributionChart data={packageChartData} type={packageChartType} />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-xs border border-dashed border-zinc-800 rounded-lg">
                                            No Package Data
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Cost Structure */}
                            <div className="bg-zinc-900/20 rounded-xl p-5 border border-zinc-800/50 flex flex-col">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <Wallet className="w-3 h-3" />
                                    Cost Analysis
                                </h4>
                                <div className="flex-1 min-h-[280px]">
                                    <CostBreakdownChart data={financeChartData.costBreakdownData} />
                                </div>
                                <div className="mt-4 flex justify-between items-center text-xs border-t border-zinc-800 pt-3">
                                    <span className="text-zinc-500">Expenses Ratio</span>
                                    <span className="text-red-400 font-mono font-bold">
                                        {selectedEvent.gross_revenue > 0 ? ((selectedEvent.total_expenses / selectedEvent.gross_revenue) * 100).toFixed(1) : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center min-h-[300px]">
                            <Activity className="w-12 h-12 mb-4 opacity-20" />
                            <p>Select an event to view deep dive analytics</p>
                        </div>
                    )}
                </div>
            </MotionCard>

            {/* 4. Pipeline Bottleneck & Discipline Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bottleneck Funnel */}
                <MotionCard delay={0.6} className="p-0 border-none bg-transparent" hoverEffect={false}>
                    <BottleneckFunnelChart data={pipelineBottleneck} />
                </MotionCard>

                {/* Discipline Analytics */}
                <MotionCard delay={0.7} className="p-0 border-none bg-transparent" hoverEffect={false}>
                    <DisciplineAnalyticsChart
                        disciplineData={disciplineAnalytics}
                        packageData={packageAnalytics}
                    />
                </MotionCard>
            </div>

            {/* 5. Footer Expense Management (Collapsed) */}
            <div className="pt-8 border-t border-zinc-800">
                <button
                    onClick={() => setShowExpenseTable(!showExpenseTable)}
                    className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors group w-full justify-center py-4 hover:bg-zinc-900/30 rounded-lg border border-transparent hover:border-zinc-800"
                >
                    <ArrowRight className={`w-4 h-4 transition-transform ${showExpenseTable ? "rotate-90" : ""}`} />
                    <span className="uppercase tracking-wider font-bold">Manage Expenses & Transactions</span>
                </button>

                <AnimatePresence>
                    {showExpenseTable && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-6">
                                <ExpenseDetailSection expenses={allExpenses} eventList={eventList} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}


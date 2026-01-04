"use client";

/**
 * 📊 Analytics Dashboard Container
 * 모든 분석 차트를 통합하는 클라이언트 컴포넌트
 * KPI 카드를 포함하여 전체적인 대시보드 레이아웃을 관리합니다.
 * @author Agent 3 (Analytics Master)
 */

import { RevenueChart } from "./RevenueChart";
import { CustomerSegmentChart } from "./CustomerSegmentChart";
import { CustomerLTVTable } from "./CustomerLTVTable";
import { PipelineBottleneckChart } from "./PipelineBottleneckChart";
import { EventComparisonChart, EventAnalyticsData } from "./EventComparisonChart";
import { motion } from "framer-motion";
import { TrendingUp, RefreshCcw, DollarSign, Users, ShoppingBag } from "lucide-react";

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

type CustomerSegments = {
    vip: { count: number; total_revenue: number };
    repeat: { count: number };
    new: { count: number };
};

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

type PipelineBottleneck = {
    status: string;
    task_count: number;
    avg_days_in_status: number;
    bottleneck_score: number;
    bottleneck_level: string;
};

type Props = {
    dailyRevenue: DailyRevenue[];
    monthlyGrowth: MonthlyGrowth[];
    customerSegments: CustomerSegments | null;
    customerLTV: CustomerLTV[];
    pipelineBottleneck: PipelineBottleneck[];
    eventAnalytics: EventAnalyticsData[];
};

// ==========================================
// Animation Variants
// ==========================================

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

// ==========================================
// KPI Card Component
// ==========================================

function KPICard({ label, value, subValue, subLabel, icon: Icon, trend }: any) {
    return (
        <motion.div
            variants={itemVariants}
            className="bg-zinc-900/50 border border-zinc-800 p-5 relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 p-16 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-white/10 transition-colors" />

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider font-medium">{label}</p>
                </div>
                <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                </div>
            </div>

            <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white font-mono mb-1">{value}</h3>
                <div className="flex items-center gap-2">
                    {trend !== undefined && (
                        <span className={`text-xs font-bold flex items-center gap-0.5 ${trend >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}%
                        </span>
                    )}
                    {subValue && (
                        <span className="text-xs text-zinc-500">
                            {subValue} <span className="text-[10px] uppercase">{subLabel}</span>
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ==========================================
// Main Component
// ==========================================

export function AnalyticsDashboard({
    dailyRevenue,
    monthlyGrowth,
    customerSegments,
    customerLTV,
    pipelineBottleneck,
    eventAnalytics,
}: Props) {
    // KPI Data Calculation
    const currentMonth = monthlyGrowth[0] || { monthly_revenue: 0, monthly_orders: 0, revenue_growth: 0 };
    const totalCustomers = customerLTV.length;
    const avgOrderValue = currentMonth.monthly_orders > 0 ? currentMonth.monthly_revenue / currentMonth.monthly_orders : 0;

    // Formatting
    const formatCurrency = (val: number) => new Intl.NumberFormat("ko-KR", { notation: "compact" }).format(val);

    return (
        <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    label="Monthly Revenue"
                    value={`₩${formatCurrency(currentMonth.monthly_revenue)}`}
                    trend={currentMonth.revenue_growth || 0}
                    subLabel="vs last month"
                    icon={DollarSign}
                />
                <KPICard
                    label="Monthly Orders"
                    value={`${currentMonth.monthly_orders}`}
                    subValue="건"
                    subLabel="Total Orders"
                    icon={ShoppingBag}
                />
                <KPICard
                    label="Avg. Order Value"
                    value={`₩${formatCurrency(avgOrderValue)}`}
                    subValue="AOV"
                    subLabel="per order"
                    icon={TrendingUp}
                />
                <KPICard
                    label="Active Customers"
                    value={`${totalCustomers}`}
                    subValue="LTV Analysis"
                    subLabel="Targets"
                    icon={Users}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart - Full Width on mobile, 2/3 on desktop */}
                <motion.div className="lg:col-span-2" variants={itemVariants}>
                    <RevenueChart
                        dailyData={dailyRevenue}
                        monthlyData={monthlyGrowth}
                    />
                </motion.div>

                {/* Customer Segments - 1/3 width */}
                <motion.div className="lg:col-span-1" variants={itemVariants}>
                    <CustomerSegmentChart data={customerSegments} />
                </motion.div>

                {/* Event Comparison - New Chart! */}
                <motion.div className="lg:col-span-3" variants={itemVariants}>
                    <EventComparisonChart data={eventAnalytics} />
                </motion.div>

                {/* Customer LTV Table - 2/3 width */}
                <motion.div className="lg:col-span-2" variants={itemVariants}>
                    <CustomerLTVTable data={customerLTV} />
                </motion.div>

                {/* Pipeline Bottleneck - 1/3 width */}
                <motion.div className="lg:col-span-1" variants={itemVariants}>
                    <PipelineBottleneckChart data={pipelineBottleneck} />
                </motion.div>
            </div>
        </motion.div>
    );
}

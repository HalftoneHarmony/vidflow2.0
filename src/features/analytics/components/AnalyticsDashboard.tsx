"use client";

/**
 * 📊 Analytics Dashboard Container
 * 모든 분석 차트를 통합하는 클라이언트 컴포넌트
 * @author Agent 3 (Analytics Master)
 */

import { RevenueChart } from "./RevenueChart";
import { CustomerSegmentChart } from "./CustomerSegmentChart";
import { CustomerLTVTable } from "./CustomerLTVTable";
import { PipelineBottleneckChart } from "./PipelineBottleneckChart";
import { motion } from "framer-motion";

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
// Main Component
// ==========================================

export function AnalyticsDashboard({
    dailyRevenue,
    monthlyGrowth,
    customerSegments,
    customerLTV,
    pipelineBottleneck,
}: Props) {
    return (
        <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
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

            {/* Customer LTV Table - 2/3 width */}
            <motion.div className="lg:col-span-2" variants={itemVariants}>
                <CustomerLTVTable data={customerLTV} />
            </motion.div>

            {/* Pipeline Bottleneck - 1/3 width */}
            <motion.div className="lg:col-span-1" variants={itemVariants}>
                <PipelineBottleneckChart data={pipelineBottleneck} />
            </motion.div>
        </motion.div>
    );
}

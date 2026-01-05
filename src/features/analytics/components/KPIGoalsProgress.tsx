"use client";

/**
 * 🎯 KPI Goals Progress Component
 * 목표 대비 현재 달성률을 시각화
 * @author Agent 3 (Analytics Master)
 */

import { motion } from "framer-motion";
import {
    Target,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    AlertCircle,
    Sparkles
} from "lucide-react";

// ==========================================
// Types
// ==========================================

type KPIGoal = {
    id: string;
    label: string;
    current: number;
    target: number;
    unit: string;
    trend?: number; // 전월 대비 증감률
};

type Props = {
    goals: KPIGoal[];
};

// ==========================================
// Helper Functions
// ==========================================

const formatValue = (value: number, unit: string): string => {
    if (unit === "₩") {
        return `₩${new Intl.NumberFormat("ko-KR", { notation: "compact" }).format(value)}`;
    }
    if (unit === "%") {
        return `${value.toFixed(1)}%`;
    }
    return `${value}${unit}`;
};

const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return "#22c55e"; // green
    if (percentage >= 70) return "#3b82f6"; // blue
    if (percentage >= 40) return "#f59e0b"; // amber
    return "#ef4444"; // red
};

const getProgressBgColor = (percentage: number): string => {
    if (percentage >= 100) return "from-emerald-500/20 to-green-500/10";
    if (percentage >= 70) return "from-blue-500/20 to-cyan-500/10";
    if (percentage >= 40) return "from-amber-500/20 to-yellow-500/10";
    return "from-red-500/20 to-orange-500/10";
};

// ==========================================
// Main Component
// ==========================================

export function KPIGoalsProgress({ goals }: Props) {
    if (!goals || goals.length === 0) {
        return null;
    }

    const overallProgress = goals.reduce((sum, g) => sum + Math.min((g.current / g.target) * 100, 150), 0) / goals.length;
    const achievedCount = goals.filter(g => g.current >= g.target).length;

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-violet-600 to-purple-500 rounded-xl">
                        <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white font-[family-name:var(--font-oswald)] uppercase tracking-wide">
                            KPI Goals
                        </h3>
                        <p className="text-xs text-zinc-500">목표 달성 현황</p>
                    </div>
                </div>

                {/* Overall Badge */}
                <div className="flex items-center gap-2">
                    <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${overallProgress >= 100
                            ? 'bg-emerald-500/20 border border-emerald-500/30'
                            : 'bg-zinc-800/50 border border-zinc-700'
                        }`}>
                        {overallProgress >= 100 ? (
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                        ) : (
                            <Target className="w-4 h-4 text-zinc-400" />
                        )}
                        <span className={`text-sm font-bold font-mono ${overallProgress >= 100 ? 'text-emerald-400' : 'text-zinc-300'
                            }`}>
                            {achievedCount}/{goals.length} 달성
                        </span>
                    </div>
                </div>
            </div>

            {/* Goals Grid */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {goals.map((goal, index) => {
                    const percentage = Math.min((goal.current / goal.target) * 100, 150);
                    const isAchieved = goal.current >= goal.target;
                    const progressColor = getProgressColor(percentage);
                    const bgGradient = getProgressBgColor(percentage);

                    return (
                        <motion.div
                            key={goal.id}
                            className={`relative rounded-xl p-4 border overflow-hidden bg-gradient-to-br ${bgGradient} ${isAchieved ? 'border-emerald-500/30' : 'border-zinc-700/50'
                                }`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            {/* Achievement Badge */}
                            {isAchieved && (
                                <div className="absolute top-2 right-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                </div>
                            )}

                            {/* Label */}
                            <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2 font-medium">
                                {goal.label}
                            </p>

                            {/* Current Value */}
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-xl font-bold text-white font-mono">
                                    {formatValue(goal.current, goal.unit)}
                                </span>
                                {goal.trend !== undefined && (
                                    <span className={`text-xs font-medium flex items-center gap-0.5 ${goal.trend >= 0 ? 'text-emerald-400' : 'text-red-400'
                                        }`}>
                                        {goal.trend >= 0 ? (
                                            <TrendingUp className="w-3 h-3" />
                                        ) : (
                                            <TrendingDown className="w-3 h-3" />
                                        )}
                                        {Math.abs(goal.trend).toFixed(1)}%
                                    </span>
                                )}
                            </div>

                            {/* Target */}
                            <p className="text-[10px] text-zinc-500 mb-3">
                                목표: {formatValue(goal.target, goal.unit)}
                            </p>

                            {/* Progress Bar */}
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: progressColor }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                                    transition={{ duration: 0.8, delay: index * 0.05 }}
                                />
                            </div>

                            {/* Percentage */}
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-[10px] text-zinc-600">달성률</span>
                                <span
                                    className="text-xs font-bold font-mono"
                                    style={{ color: progressColor }}
                                >
                                    {percentage.toFixed(0)}%
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Overall Progress Bar */}
            <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/30">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">전체 달성률</span>
                    <span
                        className="text-sm font-bold font-mono"
                        style={{ color: getProgressColor(overallProgress) }}
                    >
                        {overallProgress.toFixed(1)}%
                    </span>
                </div>
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{
                            backgroundColor: getProgressColor(overallProgress),
                            boxShadow: `0 0 10px ${getProgressColor(overallProgress)}40`
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(overallProgress, 100)}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                    />
                </div>
            </div>
        </div>
    );
}

// ==========================================
// Default Goals Factory (for demo/initial load)
// ==========================================

export function generateDefaultGoals(stats: {
    monthlyRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    profitMargin: number;
    revenueGrowth?: number;
}): KPIGoal[] {
    return [
        {
            id: "monthly_revenue",
            label: "월간 매출",
            current: stats.monthlyRevenue,
            target: 5000000, // 500만원 목표
            unit: "₩",
            trend: stats.revenueGrowth,
        },
        {
            id: "total_orders",
            label: "총 주문",
            current: stats.totalOrders,
            target: 100, // 100건 목표
            unit: "건",
        },
        {
            id: "customers",
            label: "고객 수",
            current: stats.totalCustomers,
            target: 50, // 50명 목표
            unit: "명",
        },
        {
            id: "profit_margin",
            label: "수익률",
            current: stats.profitMargin,
            target: 30, // 30% 목표
            unit: "%",
        },
    ];
}

"use client";

/**
 * 🎯 KPI Goals Progress Component
 * 목표 대비 현재 달성률을 시각화
 * @author Agent 3 (Analytics Master)
 */

import { useEffect, useRef } from "react";
import { motion, animate } from "framer-motion";
import {
    Target,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    Sparkles,
    Trophy
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
// Helper Components & Functions
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

function CountUp({ value, unit, className }: { value: number, unit: string, className?: string }) {
    const nodeRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const node = nodeRef.current;
        if (!node) return;

        const controls = animate(0, value, {
            duration: 1.5,
            ease: "easeOut",
            onUpdate(v) {
                node.textContent = formatValue(v, unit);
            },
        });

        return () => controls.stop();
    }, [value, unit]);

    return <span ref={nodeRef} className={className}>{formatValue(0, unit)}</span>;
}

function CircularProgress({
    value,
    max,
    size = 80,
    strokeWidth = 6,
    color
}: {
    value: number,
    max: number,
    size?: number,
    strokeWidth?: number,
    color: string
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const ratio = Math.min((value / max), 1.5);
    const progress = ratio * circumference;
    const displayPercentage = Math.round((value / max) * 100);

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="rotate-[-90deg]">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-zinc-800"
                />
                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - progress }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-xs font-bold font-mono" style={{ color }}>
                    {displayPercentage}%
                </span>
            </div>
        </div>
    );
}

const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return "#10b981"; // emerald-500
    if (percentage >= 70) return "#3b82f6"; // blue-500
    if (percentage >= 40) return "#f59e0b"; // amber-500
    return "#ef4444"; // red-500
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
    const allAchieved = achievedCount === goals.length;

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden relative group">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent pointer-events-none group-hover:from-violet-600/10 transition-colors duration-500" />

            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-violet-600 to-purple-500 rounded-xl shadow-lg shadow-violet-900/20 ring-1 ring-white/10">
                        {allAchieved ? <Trophy className="w-5 h-5 text-yellow-300" /> : <Target className="w-5 h-5 text-white" />}
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
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-2 border backdrop-blur-sm ${overallProgress >= 100
                            ? 'bg-emerald-500/20 border-emerald-500/30'
                            : 'bg-zinc-800/50 border-zinc-700'
                            }`}
                    >
                        {overallProgress >= 100 ? (
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                        ) : (
                            <Target className="w-4 h-4 text-zinc-400" />
                        )}
                        <span className={`text-sm font-bold font-mono ${overallProgress >= 100 ? 'text-emerald-400' : 'text-zinc-300'}`}>
                            {achievedCount}/{goals.length} 달성
                        </span>
                    </motion.div>
                </div>
            </div>

            {/* Goals Grid */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                {goals.map((goal, index) => {
                    const percentage = Math.min((goal.current / goal.target) * 100, 150);
                    const isAchieved = goal.current >= goal.target;
                    const progressColor = getProgressColor(percentage);

                    return (
                        <motion.div
                            key={goal.id}
                            className={`
                                relative rounded-2xl p-5 border overflow-hidden flex items-center justify-between gap-4
                                bg-zinc-900/80 hover:bg-zinc-800/80 transition-all duration-300
                                ${isAchieved ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-zinc-800'}
                            `}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            {/* Left Content */}
                            <div className="flex-1 min-w-0">
                                {/* Label */}
                                <div className="flex items-center gap-2 mb-2">
                                    <p className="text-xs text-zinc-400 uppercase tracking-wider font-bold">
                                        {goal.label}
                                    </p>
                                    {isAchieved && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                                </div>

                                {/* Current Value */}
                                <div className="flex flex-wrap items-baseline gap-2 mb-1">
                                    <span className="text-lg font-bold text-white font-mono tracking-tight">
                                        <CountUp value={goal.current} unit={goal.unit} />
                                    </span>
                                </div>

                                {/* Trend */}
                                {goal.trend !== undefined && (
                                    <div className={`text-[10px] font-medium flex items-center gap-0.5 mb-2 ${goal.trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {goal.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {Math.abs(goal.trend).toFixed(1)}%
                                    </div>
                                )}

                                {/* Target */}
                                <p className="text-[10px] text-zinc-500 font-mono">
                                    / {formatValue(goal.target, goal.unit)}
                                </p>
                            </div>

                            {/* Right Content: Circular Progress */}
                            <div className="flex-shrink-0">
                                <CircularProgress
                                    value={goal.current}
                                    max={goal.target}
                                    size={64}
                                    strokeWidth={6}
                                    color={progressColor}
                                />
                            </div>
                        </motion.div>
                    );
                })}
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

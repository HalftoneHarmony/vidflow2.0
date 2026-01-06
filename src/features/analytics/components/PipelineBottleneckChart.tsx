"use client";

/**
 * ⚙️ Pipeline Bottleneck Chart
 * 파이프라인 병목 분석 시각화
 * @author Agent 3 (Analytics Master)
 */

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Clock, Zap, ArrowRight } from "lucide-react";

// ==========================================
// Types
// ==========================================

type PipelineBottleneck = {
    status: string;
    task_count: number;
    avg_days_in_status: number;
    bottleneck_score: number;
    bottleneck_level: string;
};

type Props = {
    data: PipelineBottleneck[];
};

// ==========================================
// Config
// ==========================================

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    waiting: { label: "대기", color: "#f59e0b", icon: Clock },
    WAITING: { label: "대기", color: "#f59e0b", icon: Clock },
    shooting: { label: "촬영", color: "#3b82f6", icon: Zap },
    SHOOTING: { label: "촬영", color: "#3b82f6", icon: Zap },
    editing: { label: "편집", color: "#8b5cf6", icon: Zap },
    EDITING: { label: "편집", color: "#8b5cf6", icon: Zap },
    ready: { label: "완료", color: "#22c55e", icon: CheckCircle },
    READY: { label: "완료", color: "#22c55e", icon: CheckCircle },
    delivered: { label: "전송", color: "#10b981", icon: CheckCircle },
    DELIVERED: { label: "전송", color: "#10b981", icon: CheckCircle },
};

const BOTTLENECK_COLORS: Record<string, string> = {
    HIGH: "text-red-500 bg-red-500/10 border-red-500/30",
    MEDIUM: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30",
    LOW: "text-green-500 bg-green-500/10 border-green-500/30",
};

// ==========================================
// Main Component
// ==========================================

export function PipelineBottleneckChart({ data }: Props) {
    // 유효한 데이터만 필터링하고 중복된 status 처리
    const validData = data.filter(d => d && d.status);

    // Status 별로 데이터 병합
    const mergedDataMap = validData.reduce((acc, curr) => {
        const existing = acc.get(curr.status);
        if (existing) {
            acc.set(curr.status, {
                ...existing,
                task_count: (existing.task_count || 0) + (curr.task_count || 0),
                avg_days_in_status: ((existing.avg_days_in_status || 0) + (curr.avg_days_in_status || 0)) / 2,
                bottleneck_score: Math.max(existing.bottleneck_score || 0, curr.bottleneck_score || 0)
            });
        } else {
            acc.set(curr.status, curr);
        }
        return acc;
    }, new Map<string, PipelineBottleneck>());

    const processedData = Array.from(mergedDataMap.values());

    if (processedData.length === 0) {
        return (
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 h-full flex items-center justify-center">
                <div className="text-center text-zinc-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm uppercase tracking-wider">파이프라인 데이터 없음</p>
                </div>
            </div>
        );
    }

    // Calculate max for progress bars
    const maxScore = Math.max(...processedData.map(d => d.bottleneck_score || 0), 100);
    const maxTasks = Math.max(...processedData.map(d => d.task_count || 0), 1);
    const totalTasks = processedData.reduce((sum, d) => sum + (d.task_count || 0), 0);

    // Find the biggest bottleneck
    const worstBottleneck = processedData.reduce((prev, curr) =>
        (curr.bottleneck_score || 0) > (prev.bottleneck_score || 0) ? curr : prev
        , processedData[0]);

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 h-full relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white font-[family-name:var(--font-oswald)] uppercase">
                            Bottleneck Analysis
                        </h3>
                        <p className="text-xs text-zinc-500">파이프라인 병목 분석</p>
                    </div>
                </div>

                {/* Alert Badge */}
                {worstBottleneck && worstBottleneck.bottleneck_level === "HIGH" && (
                    <motion.div
                        className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 flex items-center gap-2"
                        animate={{ opacity: [1, 0.7, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-bold text-red-500 uppercase">
                            {STATUS_CONFIG[worstBottleneck.status]?.label || worstBottleneck.status} 병목
                        </span>
                    </motion.div>
                )}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-zinc-800/30 border border-zinc-700/50 p-3">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">총 작업</p>
                    <p className="text-xl font-bold text-white font-mono">{totalTasks}</p>
                </div>
                <div className="bg-zinc-800/30 border border-zinc-700/50 p-3">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">최대 병목</p>
                    <p className="text-xl font-bold text-red-500 font-mono">
                        {worstBottleneck?.bottleneck_score?.toFixed(0) || 0}점
                    </p>
                </div>
            </div>

            {/* Pipeline Flow */}
            <div className="space-y-3">
                {processedData.map((stage, index) => {
                    const config = STATUS_CONFIG[stage.status] || {
                        label: stage.status,
                        color: "#71717a",
                        icon: Clock
                    };
                    const Icon = config.icon;
                    const scorePercent = (stage.bottleneck_score || 0) / maxScore * 100;
                    const taskPercent = (stage.task_count || 0) / maxTasks * 100;
                    const bottleneckClass = BOTTLENECK_COLORS[stage.bottleneck_level] || "text-zinc-500 bg-zinc-800/30 border-zinc-700/50";

                    return (
                        <motion.div
                            key={stage.status}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                        >
                            <div className="flex items-center gap-3 p-3 bg-zinc-800/20 border border-zinc-700/30 hover:border-zinc-600/50 transition-all">
                                {/* Icon */}
                                <div
                                    className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: `${config.color}20` }}
                                >
                                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-white">{config.label}</span>
                                            <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase border ${bottleneckClass}`}>
                                                {stage.bottleneck_level}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs">
                                            <span className="text-zinc-500">
                                                <span className="text-white font-mono font-bold">{stage.task_count}</span> 작업
                                            </span>
                                            <span className="text-zinc-500">
                                                <span className="text-white font-mono font-bold">{stage.avg_days_in_status?.toFixed(1) || 0}</span>일 평균
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="h-2 bg-zinc-700/50 overflow-hidden">
                                        <motion.div
                                            className="h-full"
                                            style={{ backgroundColor: config.color }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${scorePercent}%` }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-[10px] text-zinc-600">병목 점수</span>
                                        <span className="text-[10px] text-zinc-500 font-mono">
                                            {stage.bottleneck_score?.toFixed(0) || 0} / {maxScore.toFixed(0)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Arrow to next stage */}
                            {index < data.length - 1 && (
                                <div className="flex justify-center py-1">
                                    <ArrowRight className="w-4 h-4 text-zinc-700 rotate-90" />
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

"use client";

/**
 * 🔥 Bottleneck Funnel Visualization
 * 파이프라인 병목 구간을 직관적인 퍼널 형태로 시각화
 * @author Agent 3 (Analytics Master)
 */

import { motion } from "framer-motion";
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Zap,
    ArrowDown,
    TrendingDown,
    Lightbulb,
    Timer,
    Users
} from "lucide-react";

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

const STATUS_CONFIG: Record<string, { label: string; color: string; gradient: string; icon: any }> = {
    waiting: {
        label: "대기중",
        color: "#f59e0b",
        gradient: "from-amber-500/20 to-amber-600/10",
        icon: Clock
    },
    WAITING: {
        label: "대기중",
        color: "#f59e0b",
        gradient: "from-amber-500/20 to-amber-600/10",
        icon: Clock
    },
    editing: {
        label: "편집",
        color: "#8b5cf6",
        gradient: "from-violet-500/20 to-violet-600/10",
        icon: Zap
    },
    EDITING: {
        label: "편집",
        color: "#8b5cf6",
        gradient: "from-violet-500/20 to-violet-600/10",
        icon: Zap
    },
    ready: {
        label: "완료",
        color: "#22c55e",
        gradient: "from-emerald-500/20 to-emerald-600/10",
        icon: CheckCircle
    },
    READY: {
        label: "완료",
        color: "#22c55e",
        gradient: "from-emerald-500/20 to-emerald-600/10",
        icon: CheckCircle
    },
    delivered: {
        label: "전달",
        color: "#10b981",
        gradient: "from-green-500/20 to-green-600/10",
        icon: CheckCircle
    },
    DELIVERED: {
        label: "전달",
        color: "#10b981",
        gradient: "from-green-500/20 to-green-600/10",
        icon: CheckCircle
    },
};

// ==========================================
// Helper Components
// ==========================================

function InsightCard({ title, value, icon: Icon, color, description }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    description?: string;
}) {
    return (
        <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4 hover:border-zinc-600/50 transition-all">
            <div className="flex items-start gap-3">
                <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${color}15` }}
                >
                    <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{title}</p>
                    <p className="text-lg font-bold text-white font-mono">{value}</p>
                    {description && (
                        <p className="text-xs text-zinc-500 mt-1">{description}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ==========================================
// Main Component
// ==========================================

export function BottleneckFunnelChart({ data }: Props) {
    // 유효한 데이터만 필터링하고 중복된 status 처리
    const validData = data.filter(d => d && d.status);

    // Status 별로 데이터 병합 (중복 키 방지)
    const mergedDataMap = validData.reduce((acc, curr) => {
        const existing = acc.get(curr.status);
        if (existing) {
            // 이미 존재하는 status면 데이터 합산/평균
            acc.set(curr.status, {
                ...existing,
                task_count: (existing.task_count || 0) + (curr.task_count || 0),
                // 평균값은 가중 평균 등을 해야 정확하지만, 여기서는 단순화하여 처리
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
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 h-full flex items-center justify-center">
                <div className="text-center text-zinc-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm uppercase tracking-wider">파이프라인 데이터 없음</p>
                </div>
            </div>
        );
    }

    // Calculations
    const totalTasks = processedData.reduce((sum, d) => sum + (d.task_count || 0), 0);
    const worstBottleneck = processedData.reduce((prev, curr) =>
        (curr.bottleneck_score || 0) > (prev.bottleneck_score || 0) ? curr : prev
        , processedData[0]);
    const avgDays = processedData.reduce((sum, d) => sum + (d.avg_days_in_status || 0), 0) / processedData.length;

    // Sort by pipeline order for funnel visualization
    const orderedData = [...processedData].sort((a, b) => {
        const order = ['waiting', 'editing', 'ready', 'delivered'];
        return order.indexOf(a.status.toLowerCase()) - order.indexOf(b.status.toLowerCase());
    });

    // Calculate widths for funnel effect (first is widest)
    const maxTasks = Math.max(...orderedData.map(d => d.task_count || 0), 1);

    // Find bottleneck insights
    const highBottlenecks = processedData.filter(d => d.bottleneck_level === 'HIGH');
    const longestStage = processedData.reduce((max, curr) =>
        (curr.avg_days_in_status || 0) > (max.avg_days_in_status || 0) ? curr : max, processedData[0]);

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-red-600 to-orange-500 rounded-xl">
                        <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white font-[family-name:var(--font-oswald)] uppercase tracking-wide">
                            Bottleneck Visualization
                        </h3>
                        <p className="text-xs text-zinc-500">파이프라인 병목 구간 분석</p>
                    </div>
                </div>

                {/* Alert Badge */}
                {highBottlenecks.length > 0 && (
                    <motion.div
                        className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2"
                        animate={{ opacity: [1, 0.7, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-bold text-red-500">
                            {highBottlenecks.length}개 병목 발견
                        </span>
                    </motion.div>
                )}
            </div>

            <div className="p-6">
                {/* Top Insights Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <InsightCard
                        title="총 작업"
                        value={totalTasks}
                        icon={Users}
                        color="#3b82f6"
                    />
                    <InsightCard
                        title="최대 병목"
                        value={`${worstBottleneck?.bottleneck_score?.toFixed(0) || 0}점`}
                        icon={TrendingDown}
                        color="#ef4444"
                        description={STATUS_CONFIG[worstBottleneck?.status]?.label || worstBottleneck?.status}
                    />
                    <InsightCard
                        title="평균 체류"
                        value={`${avgDays.toFixed(1)}일`}
                        icon={Timer}
                        color="#f59e0b"
                    />
                    <InsightCard
                        title="병목 단계"
                        value={highBottlenecks.length}
                        icon={AlertTriangle}
                        color={highBottlenecks.length > 0 ? "#ef4444" : "#22c55e"}
                        description={highBottlenecks.length > 0 ? "주의 필요" : "양호"}
                    />
                </div>

                {/* Funnel Visualization */}
                <div className="relative py-4">
                    <div className="space-y-2">
                        {orderedData.map((stage, index) => {
                            const config = STATUS_CONFIG[stage.status] || {
                                label: stage.status,
                                color: "#71717a",
                                gradient: "from-zinc-500/20 to-zinc-600/10",
                                icon: Clock
                            };
                            const Icon = config.icon;

                            // Funnel width calculation - starts at 100%, decreases
                            const widthPercent = 100 - (index * 8);
                            const isBottleneck = stage.bottleneck_level === 'HIGH';
                            const isMedium = stage.bottleneck_level === 'MEDIUM';

                            return (
                                <motion.div
                                    key={stage.status}
                                    className="mx-auto relative"
                                    style={{ width: `${Math.max(widthPercent, 60)}%` }}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div
                                        className={`
                                            relative overflow-hidden rounded-xl p-4 border transition-all
                                            ${isBottleneck
                                                ? 'border-red-500/50 shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]'
                                                : isMedium
                                                    ? 'border-yellow-500/30'
                                                    : 'border-zinc-700/50'}
                                            bg-gradient-to-r ${config.gradient}
                                        `}
                                    >
                                        {/* Bottleneck Indicator */}
                                        {isBottleneck && (
                                            <motion.div
                                                className="absolute top-2 right-2"
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                            >
                                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                            </motion.div>
                                        )}

                                        <div className="flex items-center gap-4">
                                            {/* Stage Icon */}
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                                style={{ backgroundColor: `${config.color}25` }}
                                            >
                                                <Icon className="w-6 h-6" style={{ color: config.color }} />
                                            </div>

                                            {/* Stage Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-base font-bold text-white">{config.label}</span>
                                                    <span className={`
                                                        px-2 py-0.5 text-[10px] font-bold uppercase rounded-full
                                                        ${isBottleneck
                                                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                            : isMedium
                                                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                                : 'bg-green-500/20 text-green-400 border border-green-500/30'}
                                                    `}>
                                                        {stage.bottleneck_level || 'LOW'}
                                                    </span>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
                                                    <motion.div
                                                        className="h-full rounded-full"
                                                        style={{ backgroundColor: config.color }}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(stage.task_count / maxTasks) * 100}%` }}
                                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                                    />
                                                </div>

                                                <div className="flex items-center gap-4 text-xs text-zinc-400">
                                                    <span>
                                                        <span className="text-white font-mono font-bold">{stage.task_count}</span> 건
                                                    </span>
                                                    <span>
                                                        평균 <span className="text-white font-mono font-bold">{stage.avg_days_in_status?.toFixed(1) || 0}</span>일
                                                    </span>
                                                    <span>
                                                        점수 <span className="text-white font-mono font-bold">{stage.bottleneck_score?.toFixed(0) || 0}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Arrow to next */}
                                    {index < orderedData.length - 1 && (
                                        <div className="flex justify-center py-1">
                                            <ArrowDown className="w-5 h-5 text-zinc-700" />
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Insight Section */}
                {highBottlenecks.length > 0 && (
                    <motion.div
                        className="mt-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-xl"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex items-start gap-3">
                            <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-amber-400 mb-1">인사이트</p>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    <span className="text-amber-300 font-semibold">
                                        {STATUS_CONFIG[worstBottleneck.status]?.label || worstBottleneck.status}
                                    </span> 단계에서 가장 큰 병목이 발생하고 있습니다.
                                    평균 <span className="text-white font-mono">{worstBottleneck.avg_days_in_status?.toFixed(1)}</span>일 체류하며,
                                    <span className="text-white font-mono"> {worstBottleneck.task_count}</span>건의 작업이 대기 중입니다.
                                    {longestStage.status !== worstBottleneck.status && (
                                        <> 또한 <span className="text-amber-300 font-semibold">{STATUS_CONFIG[longestStage.status]?.label || longestStage.status}</span> 단계의 체류 시간(<span className="text-white font-mono">{longestStage.avg_days_in_status?.toFixed(1)}</span>일)도 주의가 필요합니다.</>
                                    )}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

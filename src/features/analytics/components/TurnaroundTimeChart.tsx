"use client";

import { motion } from "framer-motion";
import { Clock, Calendar, AlertCircle } from "lucide-react";
import { TurnaroundStat } from "../actions";

export function TurnaroundTimeChart({ data }: { data: TurnaroundStat[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 h-full flex items-center justify-center">
                <div className="text-center text-zinc-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-sm uppercase tracking-wider">데이터 없음</p>
                </div>
            </div>
        );
    }

    // Calculate global average weighted by count? Or simple average of averages?
    // Weighted is better.
    const totalDays = data.reduce((sum, d) => sum + (d.avg_days * d.completed_count), 0);
    const totalCount = data.reduce((sum, d) => sum + d.completed_count, 0);
    const globalAvg = totalCount > 0 ? totalDays / totalCount : 0;

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-violet-500/10 rounded-xl text-violet-500 border border-violet-500/20">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white font-[family-name:var(--font-oswald)] uppercase tracking-wide">
                            Turnaround Time
                        </h3>
                        <p className="text-xs text-zinc-500">대회별 평균 작업 소요 시간 (대회일 기준)</p>
                    </div>
                </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                {/* Global Stat */}
                <div className="mb-6 p-5 bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20 rounded-xl flex items-center justify-between relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-sm text-violet-300 font-bold mb-1 flex items-center gap-2">
                            전체 평균 소요 시간
                            <AlertCircle className="w-3 h-3 text-violet-400 opacity-50" />
                        </p>
                        <p className="text-xs text-zinc-400">대회일로부터 편집 완료까지</p>
                    </div>
                    <div className="text-right relative z-10">
                        <p className="text-3xl font-black text-white font-mono tracking-tight">
                            {globalAvg.toFixed(1)}
                            <span className="text-sm text-zinc-500 ml-1 font-sans font-normal">days</span>
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">총 {totalCount}건 분석됨</p>
                    </div>

                    {/* Background glow */}
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 w-32 h-32 bg-violet-500/10 blur-3xl rounded-full group-hover:bg-violet-500/20 transition-all" />
                </div>

                {/* List Header */}
                <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-2">
                    <span>Competition / Event</span>
                    <span>Avg Turnaround</span>
                </div>

                {/* List */}
                <div className="space-y-2">
                    {data.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center justify-between p-3 bg-zinc-800/20 hover:bg-zinc-800/40 rounded-lg group transition-colors border border-zinc-800/50 hover:border-zinc-700"
                        >
                            <div className="min-w-0 flex-1 pr-4">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="font-bold text-zinc-300 truncate text-sm">{item.event_title}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-zinc-500 overflow-hidden">
                                    <span className="flex items-center gap-1 bg-zinc-900/50 px-1.5 py-0.5 rounded text-zinc-400">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(item.event_date).toLocaleDateString()}
                                    </span>
                                    <span>완료 {item.completed_count}건</span>
                                </div>
                            </div>

                            <div className="text-right shrink-0">
                                <div className="flex items-baseline justify-end gap-1">
                                    <span className={`text-lg font-bold font-mono ${item.avg_days > 30 ? 'text-red-400' : item.avg_days > 14 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                        {item.avg_days.toFixed(1)}
                                    </span>
                                    <span className="text-xs text-zinc-600 font-medium">일</span>
                                </div>
                                <div className="text-[10px] text-zinc-600 mt-0.5">
                                    Min {item.min_days.toFixed(0)} / Max {item.max_days.toFixed(0)}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

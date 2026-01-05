"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    TrendingUp,
    Users,
    Mail,
    Target,
    Zap,
    Clock,
    DollarSign,
    ArrowUpRight,
    Flame,
    ThermometerSun,
    Snowflake,
} from "lucide-react";
import type { UpsellSummary } from "../actions";

interface UpsellSummaryCardsProps {
    summary: UpsellSummary | null;
}

export function UpsellSummaryCards({ summary }: UpsellSummaryCardsProps) {
    if (!summary) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="h-32 bg-zinc-900/50 border border-zinc-800 animate-pulse"
                    />
                ))}
            </div>
        );
    }

    const cards = [
        {
            label: "Total Upsell Candidates",
            value: summary.total_candidates,
            icon: Users,
            color: "violet",
            description: "업셀 대상 고객 수",
        },
        {
            label: "Potential Revenue",
            value: `₩${(summary.potential_revenue / 10000).toFixed(0)}만`,
            icon: DollarSign,
            color: "emerald",
            description: "예상 추가 수익",
        },
        {
            label: "Recent Deliveries",
            value: summary.recent_deliveries,
            icon: Clock,
            color: "amber",
            description: "7일 내 납품 완료",
        },
        {
            label: "Total Conversions",
            value: summary.total_conversions,
            icon: Target,
            color: "blue",
            description: "전환 완료 건수",
        },
    ];

    const priorityCards = [
        {
            label: "High Priority",
            value: summary.high_priority,
            icon: Flame,
            color: "red",
            description: "즉시 접촉 권장",
        },
        {
            label: "Medium Priority",
            value: summary.medium_priority,
            icon: ThermometerSun,
            color: "orange",
            description: "1주 내 접촉",
        },
        {
            label: "Low Priority",
            value: summary.low_priority,
            icon: Snowflake,
            color: "cyan",
            description: "추후 접촉",
        },
        {
            label: "Active Campaigns",
            value: summary.active_campaigns,
            icon: Zap,
            color: "yellow",
            description: "진행 중인 캠페인",
        },
    ];

    const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
        violet: {
            bg: "bg-violet-500/10",
            border: "border-violet-500/30",
            text: "text-violet-400",
            glow: "shadow-[0_0_20px_rgba(139,92,246,0.3)]",
        },
        emerald: {
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/30",
            text: "text-emerald-400",
            glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
        },
        amber: {
            bg: "bg-amber-500/10",
            border: "border-amber-500/30",
            text: "text-amber-400",
            glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
        },
        blue: {
            bg: "bg-blue-500/10",
            border: "border-blue-500/30",
            text: "text-blue-400",
            glow: "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
        },
        red: {
            bg: "bg-red-500/10",
            border: "border-red-500/30",
            text: "text-red-400",
            glow: "shadow-[0_0_20px_rgba(239,68,68,0.3)]",
        },
        orange: {
            bg: "bg-orange-500/10",
            border: "border-orange-500/30",
            text: "text-orange-400",
            glow: "shadow-[0_0_20px_rgba(249,115,22,0.3)]",
        },
        cyan: {
            bg: "bg-cyan-500/10",
            border: "border-cyan-500/30",
            text: "text-cyan-400",
            glow: "shadow-[0_0_20px_rgba(6,182,212,0.3)]",
        },
        yellow: {
            bg: "bg-yellow-500/10",
            border: "border-yellow-500/30",
            text: "text-yellow-400",
            glow: "shadow-[0_0_20px_rgba(234,179,8,0.3)]",
        },
    };

    return (
        <div className="space-y-6">
            {/* Main Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, index) => {
                    const colors = colorMap[card.color];
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`
                                relative p-5 border ${colors.border} ${colors.bg}
                                hover:${colors.glow} transition-all duration-300
                                group cursor-pointer
                            `}
                        >
                            <div className="flex items-start justify-between">
                                <div className={`p-2 ${colors.bg} border ${colors.border}`}>
                                    <Icon className={`w-5 h-5 ${colors.text}`} />
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                            </div>
                            <div className="mt-4">
                                <p className={`text-3xl font-bold ${colors.text} font-[family-name:var(--font-oswald)]`}>
                                    {card.value}
                                </p>
                                <p className="text-sm text-zinc-400 mt-1 uppercase tracking-wider font-medium">
                                    {card.label}
                                </p>
                                <p className="text-xs text-zinc-600 mt-0.5">
                                    {card.description}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Priority Breakdown */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {priorityCards.map((card, index) => {
                    const colors = colorMap[card.color];
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className={`
                                p-4 border ${colors.border} ${colors.bg}
                                flex items-center gap-3
                            `}
                        >
                            <Icon className={`w-5 h-5 ${colors.text}`} />
                            <div>
                                <p className={`text-xl font-bold ${colors.text}`}>
                                    {card.value}
                                </p>
                                <p className="text-xs text-zinc-500">
                                    {card.label}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

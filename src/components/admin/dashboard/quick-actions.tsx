"use client";

/**
 * ⚡ Dashboard Quick Actions (Moved from Analytics)
 * 관리자를 위한 빠른 액션 및 알림 패널
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Zap,
    AlertTriangle,
    Users,
    TrendingUp,
    FileDown,
    RefreshCw,
    ChevronRight,
    Bell,
    CheckCircle2,
    X,
    Truck
} from "lucide-react";

// ==========================================
// Types
// ==========================================

export type Alert = {
    id: string;
    type: "warning" | "info" | "success";
    message: string;
    action?: {
        label: string;
        href: string;
    };
};

type QuickAction = {
    id: string;
    label: string;
    icon: any;
    href?: string;
    onClick?: () => void;
    color: string;
};

type Props = {
    alerts?: Alert[];
    pipelineBottleneck?: any[];
    onRefresh?: () => void;
    onExport?: () => void;
};

// ==========================================
// Main Component
// ==========================================

export function QuickActions({ alerts = [], pipelineBottleneck, onRefresh, onExport }: Props) {
    const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

    // Generate dynamic alerts based on data
    const dynamicAlerts: Alert[] = [];

    // Check for high bottlenecks
    if (pipelineBottleneck && pipelineBottleneck.length > 0) {
        const highBottlenecks = pipelineBottleneck.filter((b: any) => b.bottleneck_level === 'HIGH');
        if (highBottlenecks.length > 0) {
            dynamicAlerts.push({
                id: "bottleneck_alert",
                type: "warning",
                message: `${highBottlenecks.length}개 단계에서 심각한 병목이 발생 중입니다.`,
                action: {
                    label: "파이프라인 보기",
                    href: "/admin/pipeline"
                }
            });
        }
    }

    const allAlerts = [...dynamicAlerts, ...alerts].filter(a => !dismissedAlerts.has(a.id));

    const quickActions: QuickAction[] = [
        {
            id: "pipeline",
            label: "Pipeline",
            icon: Zap,
            href: "/admin/pipeline",
            color: "#3b82f6"
        },
        {
            id: "delivery",
            label: "Delivery",
            icon: Truck,
            href: "/admin/delivery",
            color: "#22c55e"
        },
        {
            id: "users",
            label: "Users",
            icon: Users,
            href: "/admin/users",
            color: "#8b5cf6"
        },
        {
            id: "analytics",
            label: "Analytics",
            icon: TrendingUp,
            href: "/admin/analytics",
            color: "#f59e0b"
        },
    ];

    const dismissAlert = (alertId: string) => {
        setDismissedAlerts(prev => new Set([...prev, alertId]));
    };

    return (
        <div className="space-y-4 mb-6">
            {/* Alerts Section */}
            <AnimatePresence mode="popLayout">
                {allAlerts.map((alert, index) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`
                            rounded-xl border overflow-hidden
                            ${alert.type === "warning"
                                ? "bg-amber-500/10 border-amber-500/30"
                                : alert.type === "success"
                                    ? "bg-emerald-500/10 border-emerald-500/30"
                                    : "bg-blue-500/10 border-blue-500/30"}
                        `}
                    >
                        <div className="px-4 py-3 flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${alert.type === "warning"
                                ? "bg-amber-500/20"
                                : alert.type === "success"
                                    ? "bg-emerald-500/20"
                                    : "bg-blue-500/20"
                                }`}>
                                {alert.type === "warning" ? (
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                ) : alert.type === "success" ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : (
                                    <Bell className="w-4 h-4 text-blue-500" />
                                )}
                            </div>

                            <span className="flex-1 text-sm text-zinc-300">{alert.message}</span>

                            {alert.action && (
                                <Link
                                    href={alert.action.href}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${alert.type === "warning"
                                        ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                                        : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                        }`}
                                >
                                    {alert.action.label}
                                </Link>
                            )}

                            <button
                                onClick={() => dismissAlert(alert.id)}
                                className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Quick Actions Grid */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Quick Actions</span>
                    </div>

                    {/* Utility Actions */}
                    <div className="flex items-center gap-2">
                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                                title="새로고침"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        )}
                        {onExport && (
                            <button
                                onClick={onExport}
                                className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                                title="내보내기"
                            >
                                <FileDown className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {quickActions.map((action, index) => {
                        const Icon = action.icon;
                        const content = (
                            <motion.div
                                className="relative overflow-hidden flex items-center gap-3 p-3 rounded-xl bg-zinc-800/30 border border-zinc-700/50 hover:border-zinc-500/50 hover:bg-zinc-800/80 transition-all group cursor-pointer"
                                whileHover="hover"
                                whileTap="tap"
                                variants={{
                                    hover: { scale: 1.02 },
                                    tap: { scale: 0.95 }
                                }}
                            >
                                <motion.div
                                    className="p-2 rounded-lg transition-colors z-10"
                                    style={{ backgroundColor: `${action.color}20` }}
                                    variants={{
                                        hover: {
                                            y: -2,
                                            backgroundColor: `${action.color}30`
                                        }
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                >
                                    <Icon className="w-4 h-4" style={{ color: action.color }} />
                                </motion.div>
                                <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors z-10">
                                    {action.label}
                                </span>
                                <motion.div
                                    className="ml-auto z-10"
                                    variants={{
                                        hover: { x: 2 }
                                    }}
                                >
                                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                                </motion.div>

                                {/* Subtle Gradient Background Effect on Hover */}
                                <motion.div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{
                                        background: `linear-gradient(120deg, transparent 0%, ${action.color}10 50%, transparent 100%)`
                                    }}
                                />
                            </motion.div>
                        );

                        if (action.href) {
                            return (
                                <Link key={action.id} href={action.href}>
                                    {content}
                                </Link>
                            );
                        }

                        return (
                            <div key={action.id} onClick={action.onClick}>
                                {content}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

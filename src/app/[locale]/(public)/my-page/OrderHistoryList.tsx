"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Package, ExternalLink, Download } from "lucide-react";
import { OrderStatusTracker } from "@/features/user/components/OrderStatusTracker";
import { useTranslations, useLocale } from "next-intl";

// 타입 정의
type Order = {
    id: number;
    created_at: string;
    amount: number;
    status: "PENDING" | "PAID" | "REFUNDED";
    events: { title: string; event_date: string } | null;
    packages: { name: string } | null;
    pipeline_cards: { stage: string } | { stage: string }[] | null;
};

type OrderHistoryListProps = {
    orders: any[]; // 실제로는 Order[]
};

export function OrderHistoryList({ orders }: OrderHistoryListProps) {
    const t = useTranslations("MyPage");
    const locale = useLocale();
    const dateLocale = locale === 'ko' ? ko : enUS;
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

    const toggleOrder = (orderId: number) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    if (!orders || orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-800 rounded-lg bg-zinc-900/30">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t("empty_orders_title")}</h3>
                <p className="text-zinc-500 mb-6">{t("empty_orders_desc")}</p>
                <Link
                    href="/events"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition hover:shadow-lg hover:shadow-red-900/20"
                >
                    {t("btn_browse_events")}
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => {
                const card = Array.isArray(order.pipeline_cards)
                    ? order.pipeline_cards[0]
                    : order.pipeline_cards;
                const stage = card?.stage || "WAITING";
                const isExpanded = expandedOrderId === order.id;

                return (
                    <motion.div
                        key={order.id}
                        initial={false}
                        className={`bg-zinc-900 border transition-all duration-300 overflow-hidden ${isExpanded ? "border-red-500/30 shadow-lg shadow-black/50 rounded-xl" : "border-zinc-800 rounded-lg hover:border-zinc-700"
                            }`}
                    >
                        {/* Header (Always Visible) */}
                        <div
                            onClick={() => toggleOrder(order.id)}
                            className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${isExpanded ? "bg-red-600" : "bg-zinc-800"} transition-colors`}>
                                    <Package className={`w-6 h-6 ${isExpanded ? "text-white" : "text-zinc-400"}`} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">
                                        {order.events?.title || t("unknown_event")}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                                        <span className="font-mono">#{order.id.toString().padStart(6, '0')}</span>
                                        <span>•</span>
                                        <span>{format(new Date(order.created_at), "PPP", { locale: dateLocale })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 justify-between md:justify-end">
                                <div className="text-right">
                                    <div className="text-sm text-zinc-500 mb-1">{t("status_label")}</div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${stage === "DELIVERED" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                                        stage === "WAITING" ? "bg-zinc-800 text-zinc-400 border border-zinc-700" :
                                            "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                        }`}>
                                        {stage}
                                    </span>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                            </div>
                        </div>

                        {/* Expanded Content */}
                        <AnimatePresence initial={false}>
                            {isExpanded && (
                                <motion.div
                                    initial="collapsed"
                                    animate="open"
                                    exit="collapsed"
                                    variants={{
                                        open: { opacity: 1, height: "auto" },
                                        collapsed: { opacity: 0, height: 0 }
                                    }}
                                    transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                                >
                                    <div className="px-6 pb-8 pt-2 border-t border-zinc-800/50">
                                        {/* Progress Tracker */}
                                        <div className="mb-8 mt-4">
                                            <OrderStatusTracker status={stage} />
                                        </div>

                                        {/* Order Details Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-950/50 rounded-xl p-6 border border-zinc-800/50">
                                            <div>
                                                <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">{t("detail_title")}</h4>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between py-2 border-b border-zinc-800/50">
                                                        <span className="text-zinc-500 text-sm">{t("detail_product")}</span>
                                                        <span className="text-white font-medium">{order.packages?.name}</span>
                                                    </div>
                                                    <div className="flex justify-between py-2 border-b border-zinc-800/50">
                                                        <span className="text-zinc-500 text-sm">{t("detail_amount")}</span>
                                                        <span className="text-white font-medium">{order.amount.toLocaleString()}원</span>
                                                    </div>
                                                    <div className="flex justify-between py-2 border-b border-zinc-800/50">
                                                        <span className="text-zinc-500 text-sm">{t("detail_method")}</span>
                                                        <span className="text-white font-medium">{t("detail_card")}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col justify-between">
                                                <div>
                                                    <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">{t("detail_help")}</h4>
                                                    <p className="text-sm text-zinc-500 mb-4">
                                                        {t("detail_help_desc")}
                                                    </p>
                                                </div>

                                                <div className="flex gap-3">
                                                    <Link href="/support" className="flex-1">
                                                        <button className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                                                            <ExternalLink className="w-4 h-4" />
                                                            {t("btn_contact_1on1")}
                                                        </button>
                                                    </Link>
                                                    {stage === 'DELIVERED' && (
                                                        <button className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                                                            <Download className="w-4 h-4" />
                                                            {t("btn_download")}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}
        </div>
    );
}

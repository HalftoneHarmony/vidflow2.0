"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Mail,
    Phone,
    Calendar,
    Package,
    TrendingUp,
    Clock,
    ChevronDown,
    ChevronUp,
    ArrowUpRight,
    Flame,
    ThermometerSun,
    Snowflake,
    DollarSign,
    Send,
    Eye,
    ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UpsellCandidate } from "../actions";

interface UpsellCandidateTableProps {
    candidates: UpsellCandidate[];
    onSendOffer?: (candidate: UpsellCandidate, packageId: number) => void;
}

export function UpsellCandidateTable({
    candidates,
    onSendOffer,
}: UpsellCandidateTableProps) {
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());

    const toggleExpand = (orderId: number) => {
        setExpandedRows((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) {
                newSet.delete(orderId);
            } else {
                newSet.add(orderId);
            }
            return newSet;
        });
    };

    const toggleSelect = (uniqueKey: string) => {
        setSelectedCandidates((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(uniqueKey)) {
                newSet.delete(uniqueKey);
            } else {
                newSet.add(uniqueKey);
            }
            return newSet;
        });
    };

    const selectAll = () => {
        if (selectedCandidates.size === candidates.length) {
            setSelectedCandidates(new Set());
        } else {
            setSelectedCandidates(
                new Set(candidates.map((c) => `${c.user_id}-${c.order_id}`))
            );
        }
    };

    const getPriorityBadge = (score: number) => {
        if (score >= 100) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold">
                    <Flame className="w-3 h-3" />
                    HOT
                </span>
            );
        }
        if (score >= 50) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold">
                    <ThermometerSun className="w-3 h-3" />
                    WARM
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
                <Snowflake className="w-3 h-3" />
                COOL
            </span>
        );
    };

    const formatPrice = (price: number) => {
        return `₩${price.toLocaleString()}`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("ko-KR", {
            month: "short",
            day: "numeric",
        });
    };

    if (candidates.length === 0) {
        return (
            <div className="text-center py-16 border border-zinc-800 bg-zinc-900/30">
                <User className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-zinc-400 mb-2">
                    No Upsell Candidates Found
                </h3>
                <p className="text-sm text-zinc-600">
                    납품 완료된 고객 중 업그레이드 가능한 패키지가 있는 경우 표시됩니다.
                </p>
            </div>
        );
    }

    return (
        <div className="border border-zinc-800 bg-zinc-900/30">
            {/* Bulk Actions Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/50 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={selectedCandidates.size === candidates.length}
                        onChange={selectAll}
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-violet-500 focus:ring-violet-500/20"
                    />
                    <span className="text-sm text-zinc-400">
                        {selectedCandidates.size > 0
                            ? `${selectedCandidates.size} selected`
                            : `${candidates.length} candidates`}
                    </span>
                </div>
                {selectedCandidates.size > 0 && (
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            Bulk Email
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Send Offers
                        </Button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-800 text-left">
                            <th className="px-4 py-3 text-xs text-zinc-500 uppercase tracking-wider font-bold w-10">
                                {/* Checkbox */}
                            </th>
                            <th className="px-4 py-3 text-xs text-zinc-500 uppercase tracking-wider font-bold">
                                Customer
                            </th>
                            <th className="px-4 py-3 text-xs text-zinc-500 uppercase tracking-wider font-bold">
                                Current Package
                            </th>
                            <th className="px-4 py-3 text-xs text-zinc-500 uppercase tracking-wider font-bold">
                                Event
                            </th>
                            <th className="px-4 py-3 text-xs text-zinc-500 uppercase tracking-wider font-bold">
                                Priority
                            </th>
                            <th className="px-4 py-3 text-xs text-zinc-500 uppercase tracking-wider font-bold">
                                Delivered
                            </th>
                            <th className="px-4 py-3 text-xs text-zinc-500 uppercase tracking-wider font-bold">
                                LTV
                            </th>
                            <th className="px-4 py-3 text-xs text-zinc-500 uppercase tracking-wider font-bold w-10">
                                {/* Expand */}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {candidates.map((candidate, idx) => {
                            const uniqueKey = `${candidate.user_id}-${candidate.order_id}`;
                            const isExpanded = expandedRows.has(candidate.order_id);
                            const isSelected = selectedCandidates.has(uniqueKey);

                            return (
                                <>
                                    <motion.tr
                                        key={uniqueKey}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className={`
                                            border-b border-zinc-800/50 transition-colors
                                            ${isSelected ? "bg-violet-500/5" : "hover:bg-zinc-800/30"}
                                            ${isExpanded ? "bg-zinc-800/20" : ""}
                                        `}
                                    >
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleSelect(uniqueKey)}
                                                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-violet-500 focus:ring-violet-500/20"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-bold text-sm">
                                                    {candidate.customer_name?.charAt(0).toUpperCase() || "?"}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium text-sm">
                                                        {candidate.customer_name}
                                                    </p>
                                                    <p className="text-xs text-zinc-500">
                                                        {candidate.customer_email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-zinc-300 text-sm font-medium">
                                                    {candidate.package_name}
                                                </p>
                                                <p className="text-xs text-zinc-600">
                                                    {formatPrice(candidate.package_price)}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-zinc-300 text-sm">
                                                    {candidate.event_title}
                                                </p>
                                                <p className="text-xs text-zinc-600 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(candidate.event_date)}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {getPriorityBadge(candidate.upsell_priority_score)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 text-sm">
                                                <Clock className="w-3 h-3 text-zinc-600" />
                                                <span className={
                                                    candidate.days_since_delivery <= 7
                                                        ? "text-emerald-400"
                                                        : candidate.days_since_delivery <= 14
                                                            ? "text-amber-400"
                                                            : "text-zinc-500"
                                                }>
                                                    {candidate.days_since_delivery}일 전
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-emerald-400 font-bold text-sm">
                                                {formatPrice(candidate.customer_ltv)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => toggleExpand(candidate.order_id)}
                                                className="p-1 text-zinc-500 hover:text-white transition-colors"
                                            >
                                                {isExpanded ? (
                                                    <ChevronUp className="w-5 h-5" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5" />
                                                )}
                                            </button>
                                        </td>
                                    </motion.tr>

                                    {/* Expanded Row - Upgrade Options */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.tr
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="bg-zinc-900/50"
                                            >
                                                <td colSpan={8} className="px-4 py-4">
                                                    <div className="pl-12">
                                                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3 font-bold">
                                                            Available Upgrade Options
                                                        </p>
                                                        {candidate.upgrade_options && candidate.upgrade_options.length > 0 ? (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                {candidate.upgrade_options.map((option) => (
                                                                    <div
                                                                        key={option.id}
                                                                        className="p-4 border border-zinc-700 bg-zinc-800/50 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group"
                                                                    >
                                                                        <div className="flex items-start justify-between mb-2">
                                                                            <div>
                                                                                <p className="text-white font-bold text-sm">
                                                                                    {option.name}
                                                                                </p>
                                                                                <p className="text-emerald-400 font-bold">
                                                                                    {formatPrice(option.price)}
                                                                                </p>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 border border-amber-500/20">
                                                                                    <TrendingUp className="w-3 h-3" />
                                                                                    +{option.upgrade_value_pct}%
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-700">
                                                                            <span className="text-sm text-zinc-400">
                                                                                차액: <span className="text-emerald-400 font-bold">+{formatPrice(option.price_diff)}</span>
                                                                            </span>
                                                                            <Button
                                                                                size="sm"
                                                                                className="bg-emerald-600 hover:bg-emerald-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                onClick={() => onSendOffer?.(candidate, option.id)}
                                                                            >
                                                                                <Send className="w-3 h-3 mr-1" />
                                                                                Offer
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-zinc-600 text-sm">
                                                                No upgrade options available.
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        )}
                                    </AnimatePresence>
                                </>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

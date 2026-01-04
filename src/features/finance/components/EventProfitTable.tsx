/**
 * 📊 Event Profit Table
 * 이벤트별 수익 분석 테이블 (Accordion 지원)
 * Agent 7: Gold (The Treasurer)
 */

"use client";

import { useState } from "react";
import { ProfitSummary } from "../queries";

type EventProfit = {
    eventId: number;
    title: string;
    profit: ProfitSummary;
};

type EventProfitTableProps = {
    events: EventProfit[];
};

export function EventProfitTable({ events }: EventProfitTableProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("ko-KR", {
            style: "currency",
            currency: "KRW",
            maximumFractionDigits: 0,
        }).format(value);

    // 수익률에 따른 색상 반환
    const getMarginColor = (margin: number) => {
        if (margin >= 30) return "text-emerald-400 bg-emerald-900/30";
        if (margin >= 10) return "text-yellow-400 bg-yellow-900/30";
        return "text-red-400 bg-red-900/30";
    };

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (events.length === 0) {
        return (
            <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800">
                분석할 이벤트 데이터가 없습니다.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-black text-zinc-500 font-mono text-xs uppercase">
                    <tr>
                        <th className="px-4 py-3 font-medium w-8"></th>
                        <th className="px-4 py-3 font-medium">이벤트명</th>
                        <th className="px-4 py-3 font-medium text-right">매출</th>
                        <th className="px-4 py-3 font-medium text-right">PG 수수료</th>
                        <th className="px-4 py-3 font-medium text-right">고정비</th>
                        <th className="px-4 py-3 font-medium text-right">인건비</th>
                        <th className="px-4 py-3 font-medium text-right">순수익</th>
                        <th className="px-4 py-3 font-medium text-center">순이익률</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                    {events.map((event) => (
                        <>
                            {/* Main Row */}
                            <tr
                                key={event.eventId}
                                onClick={() => toggleExpand(event.eventId)}
                                className="hover:bg-zinc-800/50 cursor-pointer transition-colors"
                            >
                                <td className="px-4 py-4 text-zinc-500">
                                    <span className={`transition-transform inline-block ${expandedId === event.eventId ? "rotate-90" : ""}`}>
                                        ▶
                                    </span>
                                </td>
                                <td className="px-4 py-4 font-bold text-white">
                                    {event.title}
                                </td>
                                <td className="px-4 py-4 text-right font-mono text-emerald-400">
                                    {formatCurrency(event.profit.totalRevenue)}
                                </td>
                                <td className="px-4 py-4 text-right font-mono text-red-400">
                                    -{formatCurrency(event.profit.pgFees)}
                                </td>
                                <td className="px-4 py-4 text-right font-mono text-red-400">
                                    -{formatCurrency(event.profit.fixedExpenses)}
                                </td>
                                <td className="px-4 py-4 text-right font-mono text-red-400">
                                    -{formatCurrency(event.profit.laborCosts)}
                                </td>
                                <td className="px-4 py-4 text-right font-mono font-bold text-yellow-400">
                                    {formatCurrency(event.profit.netProfit)}
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <span className={`inline-flex items-center px-2 py-1 text-xs font-bold ${getMarginColor(event.profit.profitMargin)}`}>
                                        {event.profit.profitMargin}%
                                    </span>
                                </td>
                            </tr>

                            {/* Expanded Detail Row */}
                            {expandedId === event.eventId && (
                                <tr key={`${event.eventId}-detail`} className="bg-zinc-950">
                                    <td colSpan={8} className="px-8 py-6">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-zinc-900 p-4 border border-zinc-800">
                                                <p className="text-xs text-zinc-500 mb-1">총 매출</p>
                                                <p className="text-lg font-bold text-emerald-400 font-mono">
                                                    {formatCurrency(event.profit.totalRevenue)}
                                                </p>
                                            </div>
                                            <div className="bg-zinc-900 p-4 border border-zinc-800">
                                                <p className="text-xs text-zinc-500 mb-1">PG 수수료 (3.5%)</p>
                                                <p className="text-lg font-bold text-red-400 font-mono">
                                                    {formatCurrency(event.profit.pgFees)}
                                                </p>
                                            </div>
                                            <div className="bg-zinc-900 p-4 border border-zinc-800">
                                                <p className="text-xs text-zinc-500 mb-1">고정 지출</p>
                                                <p className="text-lg font-bold text-red-400 font-mono">
                                                    {formatCurrency(event.profit.fixedExpenses)}
                                                </p>
                                            </div>
                                            <div className="bg-zinc-900 p-4 border border-zinc-800">
                                                <p className="text-xs text-zinc-500 mb-1">자동 인건비</p>
                                                <p className="text-lg font-bold text-red-400 font-mono">
                                                    {formatCurrency(event.profit.laborCosts)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 p-4 bg-black border border-zinc-800">
                                            <p className="text-xs text-zinc-500 font-mono">
                                                순수익 공식: {formatCurrency(event.profit.totalRevenue)} - {formatCurrency(event.profit.pgFees)} - {formatCurrency(event.profit.fixedExpenses)} - {formatCurrency(event.profit.laborCosts)} = <span className="text-yellow-400 font-bold">{formatCurrency(event.profit.netProfit)}</span>
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

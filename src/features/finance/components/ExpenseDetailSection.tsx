/**
 * 🧾 Expense Detail Section
 * 지출 내역 필터, 테이블, 추가 모달, CSV 내보내기
 * Agent 7: Gold (The Treasurer)
 */

"use client";

import { useState, useMemo } from "react";
import { AddExpenseModal } from "./AddExpenseModal";
import { EXPENSE_CATEGORY_OPTIONS } from "../config";

type Expense = {
    id: number;
    event_id: number | null;
    category: string;
    description: string | null;
    amount: number;
    is_auto_generated: boolean;
    expensed_at: string;
    events?: any; // Supabase returns array or object
};

type EventItem = {
    id: number;
    title: string;
};

type ExpenseDetailSectionProps = {
    expenses: Expense[];
    eventList: EventItem[];
};

const ITEMS_PER_PAGE = 20;

export function ExpenseDetailSection({ expenses, eventList }: ExpenseDetailSectionProps) {
    // 필터 상태
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 필터링된 데이터
    const filteredExpenses = useMemo(() => {
        return expenses.filter((exp) => {
            const eventMatch = selectedEventId === null || exp.event_id === selectedEventId;
            const categoryMatch = selectedCategory === "ALL" || exp.category === selectedCategory;
            return eventMatch && categoryMatch;
        });
    }, [expenses, selectedEventId, selectedCategory]);

    // 페이지네이션
    const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);
    const paginatedExpenses = filteredExpenses.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // 유틸리티 함수
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("ko-KR", {
            style: "currency",
            currency: "KRW",
            maximumFractionDigits: 0,
        }).format(value);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });

    const getCategoryBadge = (category: string) => {
        const colors: Record<string, string> = {
            LABOR: "bg-blue-900/50 text-blue-400 border-blue-800",
            FOOD: "bg-orange-900/50 text-orange-400 border-orange-800",
            TRAVEL: "bg-green-900/50 text-green-400 border-green-800",
            EQUIPMENT: "bg-purple-900/50 text-purple-400 border-purple-800",
            ETC: "bg-zinc-800 text-zinc-400 border-zinc-700",
        };
        return colors[category] || colors.ETC;
    };

    // 이벤트 제목 추출 헬퍼 (배열 또는 객체 처리)
    const getEventTitle = (events: any) => {
        if (!events) return "-";
        if (Array.isArray(events)) return events[0]?.title || "-";
        return events.title || "-";
    };

    // CSV 내보내기
    const handleExportCSV = () => {
        const headers = ["날짜", "이벤트", "유형", "설명", "금액", "자동생성"];
        const rows = filteredExpenses.map((exp) => [
            formatDate(exp.expensed_at),
            getEventTitle(exp.events),
            exp.category,
            exp.description || "-",
            exp.amount.toString(),
            exp.is_auto_generated ? "Y" : "N",
        ]);

        const csvContent = [headers, ...rows]
            .map((row) => row.map((cell) => `"${cell}"`).join(","))
            .join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        const yyyymmdd = new Date().toISOString().split("T")[0].replace(/-/g, "");
        link.download = `vidflow_expenses_${yyyymmdd}.csv`;
        link.click();
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h2 className="text-lg font-bold text-white border-l-4 border-red-600 pl-3">
                        Expense Ledger
                    </h2>

                    <div className="flex flex-wrap gap-3">
                        {/* 이벤트 필터 */}
                        <select
                            value={selectedEventId ?? ""}
                            onChange={(e) => {
                                setSelectedEventId(e.target.value ? Number(e.target.value) : null);
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 bg-black border border-zinc-700 text-white text-sm focus:border-red-600 focus:outline-none"
                        >
                            <option value="">All Events</option>
                            {eventList.map((event) => (
                                <option key={event.id} value={event.id}>
                                    {event.title}
                                </option>
                            ))}
                        </select>

                        {/* 카테고리 필터 */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 bg-black border border-zinc-700 text-white text-sm focus:border-red-600 focus:outline-none"
                        >
                            {EXPENSE_CATEGORY_OPTIONS.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat === "ALL" ? "All Categories" : cat}
                                </option>
                            ))}
                        </select>

                        {/* CSV 내보내기 */}
                        <button
                            onClick={handleExportCSV}
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold border border-zinc-700 transition-colors flex items-center gap-2"
                        >
                            📥 CSV Export
                        </button>

                        {/* 지출 추가 */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors flex items-center gap-2"
                        >
                            ➕ Add Expense
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-black text-zinc-500 font-mono text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3 font-medium">Date</th>
                            <th className="px-4 py-3 font-medium">Event</th>
                            <th className="px-4 py-3 font-medium">Category</th>
                            <th className="px-4 py-3 font-medium">Description</th>
                            <th className="px-4 py-3 font-medium text-right">Amount</th>
                            <th className="px-4 py-3 font-medium text-center">Type</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {paginatedExpenses.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                                    지출 내역이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            paginatedExpenses.map((expense) => (
                                <tr
                                    key={expense.id}
                                    className={`hover:bg-zinc-800/50 transition-colors ${expense.is_auto_generated ? "bg-zinc-900/30" : ""
                                        }`}
                                >
                                    <td className="px-4 py-3 text-zinc-400 font-mono">
                                        {formatDate(expense.expensed_at)}
                                    </td>
                                    <td className="px-4 py-3 text-zinc-300">
                                        {getEventTitle(expense.events)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-bold border ${getCategoryBadge(
                                                expense.category
                                            )}`}
                                        >
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-300 max-w-[200px] truncate">
                                        {expense.description || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono font-bold text-white">
                                        {formatCurrency(expense.amount)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {expense.is_auto_generated ? (
                                            <span
                                                title="자동 생성 (DELIVERED 시)"
                                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-900/30 text-blue-400 text-[10px] font-bold border border-blue-800"
                                            >
                                                🤖 AUTO
                                            </span>
                                        ) : (
                                            <span
                                                title="수동 입력"
                                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] font-bold border border-zinc-700"
                                            >
                                                ✍️ MANUAL
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
                    <p className="text-xs text-zinc-500 font-mono">
                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                        {Math.min(currentPage * ITEMS_PER_PAGE, filteredExpenses.length)} of{" "}
                        {filteredExpenses.length} records
                    </p>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            ◀
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = currentPage <= 3
                                ? i + 1
                                : currentPage + i - 2;
                            if (page < 1 || page > totalPages) return null;
                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 text-sm border transition-colors ${currentPage === page
                                        ? "bg-red-600 border-red-600 text-white"
                                        : "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            ▶
                        </button>
                    </div>
                </div>
            )}

            {/* Add Expense Modal */}
            <AddExpenseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                eventList={eventList}
            />
        </div>
    );
}

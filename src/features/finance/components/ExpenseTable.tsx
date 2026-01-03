/**
 * 🧾 Expense Table
 * 지출 내역 목록 표시 (자동/수동 구분)
 * Agent 7: Gold (The Treasurer)
 */

"use client";

import { Expense } from "../queries";

type ExpenseTableProps = {
    expenses: Expense[];
    title?: string;
};

export function ExpenseTable({ expenses, title = "Recent Expenses" }: ExpenseTableProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("ko-KR", {
            style: "currency",
            currency: "KRW",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    // 카테고리별 뱃지 컬러
    const getCategoryBadge = (category: string) => {
        switch (category) {
            case "LABOR":
                return "bg-blue-900/50 text-blue-400 border-blue-800";
            case "FOOD":
                return "bg-orange-900/50 text-orange-400 border-orange-800";
            case "TRAVEL":
                return "bg-green-900/50 text-green-400 border-green-800";
            case "EQUIPMENT":
                return "bg-purple-900/50 text-purple-400 border-purple-800";
            default:
                return "bg-zinc-800 text-zinc-400 border-zinc-700";
        }
    };

    return (
        <div className="w-full bg-zinc-900 border border-zinc-800 flex flex-col">
            {/* Header with Tools */}
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
                    {title}
                </h3>
                <button
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold border border-zinc-700 transition-colors flex items-center gap-2"
                    onClick={() => alert("CSV Export functionality coming soon!")}
                >
                    <span>📥</span> CSV EXPORT
                </button>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-black text-zinc-500 font-mono text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3 font-medium">Date</th>
                            <th className="px-4 py-3 font-medium">Category</th>
                            <th className="px-4 py-3 font-medium">Description</th>
                            <th className="px-4 py-3 font-medium text-right">Amount</th>
                            <th className="px-4 py-3 font-medium text-center">Type</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {expenses.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                                    지출 내역이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            expenses.map((expense) => (
                                <tr
                                    key={expense.id}
                                    className={`
                                        group hover:bg-zinc-800/50 transition-colors
                                        ${expense.is_auto_generated ? "bg-zinc-900/30" : "bg-transparent"}
                                    `}
                                >
                                    <td className="px-4 py-3 text-zinc-400 font-mono">
                                        {formatDate(expense.expensed_at)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getCategoryBadge(expense.category)}`}>
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-300">
                                        {expense.description}
                                        {expense.is_auto_generated && (
                                            <span className="ml-2 text-[10px] text-zinc-600 bg-zinc-900 px-1 border border-zinc-800">AUTO</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono font-bold text-zinc-200">
                                        {formatCurrency(expense.amount)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {expense.is_auto_generated ? (
                                            <span title="시스템 자동 생성" className="cursor-help text-lg leading-none">🤖</span>
                                        ) : (
                                            <span title="수동 입력" className="cursor-help text-lg leading-none">✍️</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer Summary (Simple) */}
            {expenses.length > 0 && (
                <div className="p-3 bg-zinc-950/50 border-t border-zinc-800 text-right text-xs text-zinc-500 font-mono">
                    Total Found: {expenses.length} records
                </div>
            )}
        </div>
    );
}

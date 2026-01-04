/**
 * ➕ Add Expense Modal
 * 수동 지출 등록 모달
 * Agent 7: Gold (The Treasurer)
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addManualExpense } from "../actions";

type EventItem = {
    id: number;
    title: string;
};

type AddExpenseModalProps = {
    isOpen: boolean;
    onClose: () => void;
    eventList: EventItem[];
};

const CATEGORY_OPTIONS = [
    { value: "LABOR", label: "인건비 (LABOR)" },
    { value: "EQUIPMENT", label: "장비 (EQUIPMENT)" },
    { value: "FOOD", label: "식대 (FOOD)" },
    { value: "TRAVEL", label: "교통비 (TRAVEL)" },
    { value: "ETC", label: "기타 (ETC)" },
];

export function AddExpenseModal({ isOpen, onClose, eventList }: AddExpenseModalProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Form 상태
    const [eventId, setEventId] = useState<number | null>(null);
    const [category, setCategory] = useState<string>("FOOD");
    const [amount, setAmount] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const resetForm = () => {
        setEventId(null);
        setCategory("FOOD");
        setAmount("");
        setDescription("");
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // 유효성 검사
        if (!eventId) {
            setError("이벤트를 선택해주세요.");
            return;
        }
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            setError("올바른 금액을 입력해주세요.");
            return;
        }
        if (!description.trim()) {
            setError("설명을 입력해주세요.");
            return;
        }

        startTransition(async () => {
            const result = await addManualExpense({
                eventId,
                category: category as any,
                amount: Number(amount),
                description: description.trim(),
            });

            if (result.success) {
                resetForm();
                onClose();
                router.refresh();
            } else {
                setError(result.error || "지출 등록에 실패했습니다.");
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-700 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <h3 className="text-lg font-bold text-white">
                        ➕ 수동 지출 등록
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white transition-colors text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-900/30 border border-red-800 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Event Select */}
                    <div>
                        <label className="block text-sm font-bold text-zinc-400 mb-2">
                            이벤트 선택 <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={eventId ?? ""}
                            onChange={(e) => setEventId(Number(e.target.value) || null)}
                            className="w-full px-4 py-3 bg-black border border-zinc-700 text-white focus:border-red-600 focus:outline-none"
                            required
                        >
                            <option value="">-- 이벤트 선택 --</option>
                            {eventList.map((event) => (
                                <option key={event.id} value={event.id}>
                                    {event.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Category Select */}
                    <div>
                        <label className="block text-sm font-bold text-zinc-400 mb-2">
                            지출 유형 <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-3 bg-black border border-zinc-700 text-white focus:border-red-600 focus:outline-none"
                        >
                            {CATEGORY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-bold text-zinc-400 mb-2">
                            금액 (원) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="50000"
                            className="w-full px-4 py-3 bg-black border border-zinc-700 text-white font-mono focus:border-red-600 focus:outline-none"
                            min="1"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-zinc-400 mb-2">
                            설명 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="스태프 점심 식대"
                            className="w-full px-4 py-3 bg-black border border-zinc-700 text-white focus:border-red-600 focus:outline-none"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? "등록 중..." : "지출 등록"}
                        </button>
                    </div>
                </form>

                {/* Footer Note */}
                <div className="px-6 pb-4">
                    <p className="text-xs text-zinc-600 text-center">
                        ※ 자동 생성된 인건비는 이 모달에서 등록되지 않습니다.
                        <br />
                        인건비는 카드가 DELIVERED될 때 자동으로 등록됩니다.
                    </p>
                </div>
            </div>
        </div>
    );
}

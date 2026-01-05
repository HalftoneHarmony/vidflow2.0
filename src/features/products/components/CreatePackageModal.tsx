"use client";

import { useState } from "react";
import { createPackage } from "../actions";
import { COMPOSITION_OPTIONS } from "../config";
import { X } from "lucide-react";

type CreatePackageModalProps = {
    eventsList: { id: number; title: string; event_date: string }[];
    onClose: () => void;
};

export function CreatePackageModal({ eventsList, onClose }: CreatePackageModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        price: 0,
        description: "",
        composition: [] as string[],
        event_ids: [] as number[],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await createPackage({
                ...formData,
                is_sold_out: false,
            });

            if (result.success) {
                onClose();
            } else {
                alert(`생성 실패: ${result.error}`);
            }
        } catch (error) {
            alert("알 수 없는 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleComposition = (option: string) => {
        setFormData(prev => ({
            ...prev,
            composition: prev.composition.includes(option)
                ? prev.composition.filter(c => c !== option)
                : [...prev.composition, option]
        }));
    };

    const toggleEvent = (eventId: number) => {
        setFormData(prev => ({
            ...prev,
            event_ids: prev.event_ids.includes(eventId)
                ? prev.event_ids.filter(id => id !== eventId)
                : [...prev.event_ids, eventId]
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-white">New Package</h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Package Name</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white focus:border-red-500 focus:outline-none"
                                placeholder="e.g. Basic Cut"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Price (KRW)</label>
                            <input
                                required
                                type="number"
                                min="0"
                                step="1000"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white focus:border-red-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Composition */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Composition</label>
                        <div className="flex flex-wrap gap-2">
                            {COMPOSITION_OPTIONS.map(opt => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => toggleComposition(opt)}
                                    className={`
                                        px-3 py-2 rounded text-sm font-medium border transition-all
                                        ${formData.composition.includes(opt)
                                            ? "bg-red-500/20 border-red-500 text-red-400"
                                            : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-600"}
                                    `}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Description</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white focus:border-red-500 focus:outline-none resize-none"
                            placeholder="패키지에 대한 상세 설명을 입력하세요."
                        />
                    </div>

                    {/* Events Selection (Multi) */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase mb-2 flex justify-between">
                            Target Events
                            <span className="text-red-500">{formData.event_ids.length} selected</span>
                        </label>
                        <div className="h-40 overflow-y-auto bg-zinc-950 border border-zinc-800 rounded p-2 grid grid-cols-2 gap-2">
                            {eventsList.map(event => (
                                <div
                                    key={event.id}
                                    onClick={() => toggleEvent(event.id)}
                                    className={`
                                        flex items-center gap-3 p-2 rounded cursor-pointer border transition-all
                                        ${formData.event_ids.includes(event.id)
                                            ? "bg-zinc-900 border-zinc-600"
                                            : "border-transparent hover:bg-zinc-900"}
                                    `}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.event_ids.includes(event.id) ? "bg-red-500 border-red-500" : "border-zinc-600"}`}>
                                        {formData.event_ids.includes(event.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-zinc-300 font-bold line-clamp-1">{event.title}</span>
                                        <span className="text-xs text-zinc-600">{event.event_date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">* 선택한 모든 이벤트에 대해 동일한 패키지가 생성됩니다.</p>
                    </div>

                    {/* Submit */}
                    <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 font-bold text-zinc-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded flex items-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? "Creating..." : "Create Package"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

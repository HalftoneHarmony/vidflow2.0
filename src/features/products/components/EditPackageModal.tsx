"use client";

import { useState } from "react";
import { updatePackage } from "../actions";
import { Product } from "../queries";
import { X } from "lucide-react";

type EditPackageModalProps = {
    pkg: Product;
    eventsList: { id: number; title: string; event_date: string }[];
    onClose: () => void;
};

const COMPOSITION_OPTIONS = ["VIDEO", "PHOTO", "HIGHLIGHT", "RAW", "REELS", "DRONE", "INTERVIEW"];

export function EditPackageModal({ pkg, eventsList, onClose }: EditPackageModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: pkg.name,
        price: pkg.price,
        description: pkg.description || "",
        composition: pkg.composition || [],
        event_id: pkg.event_id, // 단일 수정 시 이벤트 변경 가능성 열어둘지 고민 (여기선 표시만 함)
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await updatePackage(pkg.id, {
                ...formData,
            });

            if (result.success) {
                onClose();
            } else {
                alert(`수정 실패: ${result.error}`);
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

    const currentEvent = eventsList.find(e => e.id === formData.event_id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-white">Edit Package</h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Related Event (Read Only) */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded p-4 flex items-center gap-3 opacity-60">
                        <div className="w-2 h-8 bg-zinc-700 rounded-full" />
                        <div>
                            <div className="text-xs text-zinc-500 uppercase font-bold">Target Event</div>
                            <div className="text-zinc-300 font-bold">
                                {currentEvent ? currentEvent.title : `Event #${formData.event_id}`}
                            </div>
                        </div>
                    </div>

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
                        />
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
                            {isLoading ? "Updating..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

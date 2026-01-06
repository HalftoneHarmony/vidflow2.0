"use client";

import { useState } from "react";
import { Product } from "../queries";
import { togglePackageStatus, deletePackage, duplicatePackage } from "../actions";
import { EditPackageModal } from "./EditPackageModal";
import { Copy, Trash2, Play, Pause, Edit2, MoreVertical } from "lucide-react";

type PackageCardProps = {
    pkg: Product;
    eventsList: { id: number; title: string; event_date: string; composition_options?: string[] }[];
};

export function PackageCard({ pkg, eventsList }: PackageCardProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const isActive = !pkg.is_sold_out;

    const handleToggle = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            await togglePackageStatus(pkg.id);
        } catch (e) {
            alert("상태 변경 실패");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("정말 삭제하시겠습니까? 주문 내역이 있는 패키지는 삭제되지 않습니다.")) return;
        setIsProcessing(true);
        try {
            const result = await deletePackage(pkg.id);
            if (!result.success) alert(result.error);
        } catch (e) {
            alert("삭제 실패");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDuplicate = async () => {
        setIsProcessing(true);
        try {
            await duplicatePackage(pkg.id);
        } catch (e) {
            alert("복제 실패");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <div className={`
                group relative bg-zinc-900 border rounded-xl overflow-hidden transition-all duration-300
                ${isActive ? "border-zinc-800 hover:border-zinc-500 hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-1" : "border-zinc-800/50"}
            `}>
                {/* Sold Out Overlay */}
                {!isActive && (
                    <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-[2px] z-[5] flex items-center justify-center pointer-events-none border-2 border-zinc-800 m-[-1px]">
                        <div className="transform -rotate-12 border-2 border-red-500/50 px-4 py-2 rounded">
                            <span className="text-red-500 font-black text-2xl uppercase tracking-widest opacity-80">Sold Out</span>
                        </div>
                    </div>
                )}

                {/* Status Indicator */}
                <div className={`absolute top-4 right-4 z-10 flex items-center gap-2`}>

                    <span className={`
                        px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded backdrop-blur-md
                        ${isActive ? "bg-green-500/10 text-green-500 border border-green-500/20 shadow-lg shadow-green-900/20" : "bg-zinc-700/50 text-zinc-500 border border-zinc-700"}
                    `}>
                        {isActive ? "ACTIVE" : "INACTIVE"}
                    </span>

                    {/* Menu Button */}
                    <div className="relative group/menu">
                        <button className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                        <div className="absolute right-0 mt-2 w-36 bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20">
                            <button onClick={handleDuplicate} className="w-full text-left px-4 py-3 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-white flex items-center gap-2">
                                <Copy className="w-3 h-3" /> 복제하기
                            </button>
                            <button onClick={handleDelete} className="w-full text-left px-4 py-3 text-xs text-red-400 hover:bg-red-950 hover:text-red-300 flex items-center gap-2 border-t border-zinc-900">
                                <Trash2 className="w-3 h-3" /> 삭제하기
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 relative">
                    {/* Hover Glow Effect */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Event Info */}
                    <div className="text-xs text-zinc-500 mb-2 font-mono flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-red-500 animate-pulse" : "bg-zinc-600"}`} />
                        {pkg.events?.title || "Unknown Event"}
                    </div>

                    {/* Title & Price */}
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-500 transition-colors duration-300">{pkg.name}</h3>
                    <div className="text-2xl font-black text-zinc-200 mb-6 font-mono group-hover:scale-105 origin-left transition-transform duration-300">
                        {new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(pkg.price)}
                    </div>

                    {/* Composition Badges */}
                    <div className="flex flex-wrap gap-2 mb-6 min-h-[40px]">
                        {(pkg.composition || []).map((comp: string, i) => (
                            <span key={comp}
                                className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300 group-hover:border-zinc-600 transition-colors"
                                style={{ transitionDelay: `${i * 50}ms` }}
                            >
                                {comp}
                            </span>
                        ))}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center gap-2 pt-4 border-t border-zinc-800/50">
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm font-bold text-white rounded transition-colors group-hover:bg-zinc-700"
                        >
                            <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button
                            onClick={handleToggle}
                            className={`
                                w-10 h-10 flex items-center justify-center rounded transition-colors
                                ${isActive ? "bg-zinc-800 hover:bg-red-900/30 text-zinc-400 hover:text-red-500" : "bg-green-900/20 text-green-500 hover:bg-green-900/30"}
                            `}
                            title={isActive ? "비활성화 (판매 중지)" : "활성화 (판매 시작)"}
                        >
                            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {showEditModal && (
                <EditPackageModal
                    pkg={pkg}
                    eventsList={eventsList}
                    onClose={() => setShowEditModal(false)}
                />
            )}
        </>
    );
}

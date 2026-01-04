"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertTriangle, User, Package } from "lucide-react";
import { PipelineCardWithDetails } from "../queries";

interface TaskCardProps {
    card: PipelineCardWithDetails;
    onClick?: (card: PipelineCardWithDetails) => void;
    isOverlay?: boolean;
}

export function TaskCard({ card, onClick, isOverlay }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: card.id.toString(),
        data: { card },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    // 병목 감지: 3일(72시간) 이상 체류 시
    const isBottleneck = (() => {
        if (!card.stage_entered_at) return false;
        const entered = new Date(card.stage_entered_at).getTime();
        const now = new Date().getTime();
        const diffHours = (now - entered) / (1000 * 60 * 60);
        return diffHours > 72;
    })();

    // 드래그 중이거나 오버레이 모드일 때 클릭 이벤트 전파 방지
    const handleClick = () => {
        if (!isDragging && !isOverlay && onClick) {
            onClick(card);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={handleClick}
            className={`
                relative p-4 mb-3 border bg-gradient-to-br from-zinc-900 to-zinc-950 shadow-md touch-none select-none transition-all duration-200 group rounded-lg overflow-hidden
                ${isOverlay
                    ? "shadow-[0_0_30px_rgba(220,38,38,0.3)] scale-105 rotate-1 cursor-grabbing border-red-500 z-50 ring-1 ring-red-500/50"
                    : isDragging
                        ? "opacity-30 z-0 border-zinc-800 grayscale"
                        : "opacity-100 hover:border-red-500/30 cursor-grab active:cursor-grabbing hover:shadow-[0_4px_20px_-4px_rgba(220,38,38,0.15)] hover:-translate-y-0.5 border-zinc-800/60"
                }
                ${isBottleneck ? "border-red-600/80 shadow-[0_0_15px_rgba(220,38,38,0.15)]" : ""}
            `}
        >
            {/* Glossy Overlay Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none opacity-50" />

            {/* Header: Order ID & Warning */}
            <div className="relative flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-500 group-hover:text-red-400 transition-colors bg-zinc-950/50 px-1.5 py-0.5 rounded border border-zinc-800/50">
                        #{card.order_id}
                    </span>
                    {card.updated_at && (
                        <div className={`w-1.5 h-1.5 rounded-full ${isBottleneck ? 'bg-red-500 animate-pulse' : 'bg-zinc-700'}`} />
                    )}
                </div>
                {isBottleneck && (
                    <span className="text-[9px] font-black text-red-500 bg-red-950/40 px-2 py-0.5 border border-red-500/30 uppercase tracking-widest flex items-center gap-1 rounded-sm shadow-[0_0_10px_rgba(220,38,38,0.2)]">
                        <AlertTriangle className="h-3 w-3" />
                        STUCK
                    </span>
                )}
            </div>

            {/* Body: Package & Customer */}
            <div className="relative mb-4">
                <h4 className="font-bold text-sm text-zinc-100 mb-1 truncate font-[family-name:var(--font-oswald)] uppercase tracking-wide group-hover:text-red-500 transition-colors duration-300">
                    {card.order_node?.package_node?.name || "Unknown Package"}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <div className="w-1 h-3 bg-red-600/50 rounded-full" />
                    <span className="font-medium text-zinc-300">{card.order_node?.user_node?.name || "Unknown User"}</span>
                </div>
            </div>

            {/* Footer: Worker & Status */}
            <div className="relative flex justify-between items-end pt-3 border-t border-zinc-800/50">
                <div className="flex items-center gap-2">
                    <div
                        className={`
                            h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors
                            ${card.worker_node
                                ? 'bg-zinc-900 text-zinc-200 border-zinc-700 group-hover:border-red-900/50'
                                : 'bg-zinc-950 text-zinc-600 border-zinc-800 border-dashed'}
                        `}
                    >
                        {card.worker_node?.name ? card.worker_node.name.charAt(0).toUpperCase() : <User className="h-3 w-3" />}
                    </div>

                    {!card.worker_node && (
                        <span className="text-[10px] text-zinc-600 uppercase tracking-tight font-bold">Unassigned</span>
                    )}
                </div>

                {/* Status Badges */}
                <div className="flex flex-col items-end gap-1.5">
                    {card.deliverables && card.deliverables.length > 0 && (
                        <div className="flex items-center gap-1 text-[9px] font-medium text-zinc-400">
                            <Package className="h-3 w-3 text-zinc-600" />
                            <span>{card.deliverables.length} FILES</span>
                        </div>
                    )}

                    {card.stage === "DELIVERED" && (
                        <div className={`
                            flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 border rounded-sm tracking-wider
                            ${card.deliverables?.some(d => d.is_downloaded)
                                ? "bg-green-950/20 text-green-500 border-green-900/50 shadow-[0_0_8px_rgba(34,197,94,0.1)]"
                                : "bg-zinc-900 text-zinc-500 border-zinc-800"
                            }
                        `}>
                            {card.deliverables?.some(d => d.is_downloaded) ? "RECEIVED" : "SENT"}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

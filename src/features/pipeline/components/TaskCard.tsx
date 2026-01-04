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
                relative p-4 mb-3 border bg-card shadow-sm touch-none select-none transition-all duration-200 group
                ${isOverlay
                    ? "shadow-[0_0_30px_rgba(255,0,0,0.2)] scale-105 rotate-1 cursor-grabbing border-red-500 z-50 ring-1 ring-red-500/50 bg-[#0A0A0A]"
                    : isDragging
                        ? "opacity-30 z-0 border-zinc-800 grayscale" // 드래그 원본
                        : "opacity-100 hover:border-red-500/50 cursor-grab active:cursor-grabbing hover:shadow-lg hover:-translate-y-1 bg-[#0A0A0A]"
                }
                ${isBottleneck
                    ? "border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.25)]"
                    : !isOverlay && !isDragging ? "border-zinc-800" : ""
                }
            `}
        >
            {/* Header: Order ID & Warning */}
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-zinc-500 group-hover:text-red-500 transition-colors">
                    #{card.order_id}
                </span>
                {isBottleneck && (
                    <span className="text-[10px] font-bold text-red-500 bg-red-950/50 px-2 py-0.5 animate-pulse border border-red-500/40 uppercase tracking-widest flex items-center gap-1">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        STUCK
                    </span>
                )}
            </div>

            {/* Body: Package & Customer */}
            <h4 className="font-bold text-sm text-zinc-100 mb-1 truncate font-[family-name:var(--font-oswald)] uppercase tracking-wide">
                {card.order_node?.package_node?.name || "Unknown Package"}
            </h4>
            <p className="text-xs text-zinc-400 mb-3 flex items-center gap-1">
                <span>{card.order_node?.user_node?.name || "Unknown User"}</span>
            </p>

            {/* Footer: Worker & Status */}
            <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                    <div
                        className={`
                            w-6 h-6 flex items-center justify-center text-[10px] font-bold overflow-hidden border
                            ${card.worker_node ? 'bg-red-900/30 text-red-500 border-red-500/30' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}
                        `}
                    >
                        {card.worker_node?.name ? card.worker_node.name.charAt(0) : "?"}
                    </div>
                    <span className="text-xs text-zinc-500 truncate max-w-[80px]">
                        {card.worker_node?.name || "Unassigned"}
                    </span>
                </div>

                {/* Deliverables Count & Receipt Status */}
                <div className="flex items-center gap-2">
                    {card.stage === "DELIVERED" && (
                        <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 border ${card.deliverables?.some(d => d.is_downloaded)
                            ? "bg-green-950/50 text-green-500 border-green-500/30"
                            : "bg-zinc-900 text-zinc-500 border-zinc-800"
                            }`}>
                            <span>{card.deliverables?.some(d => d.is_downloaded) ? "RECEIVED" : "SENT"}</span>
                        </div>
                    )}
                    {card.deliverables && card.deliverables.length > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 border border-zinc-700">
                            <span>📦 {card.deliverables.length}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useDraggable } from "@dnd-kit/core";
import { PipelineCardWithDetails } from "../queries";

interface TaskCardProps {
    card: PipelineCardWithDetails;
}

export function TaskCard({ card }: TaskCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: card.id.toString(),
        data: { card },
    });

    const style = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
        : undefined;

    // 병목 감지: 3일(72시간) 이상 체류 시
    // stage_entered_at이 null이면 체크하지 않음
    const isBottleneck = (() => {
        if (!card.stage_entered_at) return false;
        const entered = new Date(card.stage_entered_at).getTime();
        const now = new Date().getTime();
        const diffHours = (now - entered) / (1000 * 60 * 60);
        return diffHours > 72;
    })();

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`
                relative p-4 mb-3 rounded-lg border-2 shadow-md cursor-pointer transition-all bg-card
                ${isDragging ? "opacity-50 scale-105 z-50 border-primary" : "opacity-100"}
                ${isBottleneck
                    ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                    : "border-border hover:border-primary/50"
                }
            `}
        >
            {/* Header: Order ID & Warning */}
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-muted-foreground">#{card.order_id}</span>
                {isBottleneck && (
                    <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full animate-pulse">
                        ⚠️ STUCK
                    </span>
                )}
            </div>

            {/* Body: Package & Customer */}
            <h4 className="font-bold text-sm text-foreground mb-1 truncate">{card.order?.package?.name || "Unknown Package"}</h4>
            <p className="text-xs text-muted-foreground mb-3">{card.order?.user?.name || "Unknown User"}</p>

            {/* Footer: Worker & Status */}
            <div className="flex justify-between items-center pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                        {card.assignee?.name ? card.assignee.name.charAt(0) : "?"}
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {card.assignee?.name || "Unassigned"}
                    </span>
                </div>
            </div>
        </div>
    );
}

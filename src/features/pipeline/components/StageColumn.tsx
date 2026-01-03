"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { PipelineCardWithDetails, PipelineStage } from "../queries";
import { TaskCard } from "./TaskCard";

interface StageColumnProps {
    stage: PipelineStage;
    title: string;
    cards: PipelineCardWithDetails[];
}

export function StageColumn({ stage, title, cards }: StageColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: stage,
    });

    const cardIds = cards.map((c) => c.id.toString());

    return (
        <div className="flex flex-col w-80 h-full shrink-0">
            {/* Column Header */}
            <div className={`
                flex items-center justify-between p-3 mb-2 rounded-t-xl border-b-2 transition-colors
                ${isOver ? "bg-primary/20 border-primary" : "bg-card border-border"}
            `}>
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(stage)}`} />
                    <h3 className="font-bold text-sm uppercase tracking-wider">{title}</h3>
                </div>
                <span className="bg-secondary text-secondary-foreground text-xs font-mono py-0.5 px-2 rounded-full min-w-[24px] text-center">
                    {cards.length}
                </span>
            </div>

            {/* Droppable Area */}
            <div
                ref={setNodeRef}
                className={`
                    flex-1 p-2 rounded-b-xl transition-colors overflow-y-auto min-h-[150px]
                    ${isOver ? "bg-primary/5" : "bg-muted/30"}
                `}
            >
                <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                    {cards.map((card) => (
                        <TaskCard key={card.id} card={card} />
                    ))}
                    {cards.length === 0 && (
                        <div className="h-full flex items-center justify-center text-muted-foreground/30 text-xs italic p-4 border-2 border-dashed border-muted rounded-lg">
                            No Item
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
}

function getStatusColor(stage: PipelineStage): string {
    switch (stage) {
        case "WAITING": return "bg-zinc-500";
        case "SHOOTING": return "bg-blue-500";
        case "EDITING": return "bg-purple-500";
        case "READY": return "bg-orange-500";
        case "DELIVERED": return "bg-green-500";
        default: return "bg-gray-500";
    }
}

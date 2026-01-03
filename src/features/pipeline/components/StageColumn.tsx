"use client";

import { useDroppable } from "@dnd-kit/core";
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

    return (
        <div className="flex flex-col w-80 h-full shrink-0">
            {/* Column Header */}
            <div className={`
                flex items-center justify-between p-3 mb-2 rounded-t-lg border-b-2
                ${isOver ? "bg-primary/10 border-primary" : "bg-card border-border"}
            `}>
                <h3 className="font-bold text-sm uppercase tracking-wider">{title}</h3>
                <span className="bg-secondary text-secondary-foreground text-xs font-mono py-0.5 px-2 rounded-full">
                    {cards.length}
                </span>
            </div>

            {/* Droppable Area */}
            <div
                ref={setNodeRef}
                className={`
                    flex-1 p-2 rounded-b-lg transition-colors overflow-y-auto min-h-[200px]
                    ${isOver ? "bg-primary/5" : "bg-muted/30"}
                `}
            >
                {cards.map((card) => (
                    <TaskCard key={card.id} card={card} />
                ))}
            </div>
        </div>
    );
}

"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { PipelineCardWithDetails, PipelineStage } from "../queries";
import { TaskCard } from "./TaskCard";

interface StageColumnProps {
    stage: PipelineStage;
    title: string;
    cards: PipelineCardWithDetails[];
    color: string;
    onCardClick?: (card: PipelineCardWithDetails) => void;
}

export function StageColumn({ stage, title, cards, color, onCardClick }: StageColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: stage,
    });

    const cardIds = cards.map((c) => c.id.toString());
    const styles = getStageStyles(color);

    return (
        <div className="flex flex-col flex-1 min-w-[300px] h-full transition-all duration-300">
            {/* Column Header */}
            <div className={`
                flex items-center justify-between p-3 mb-3 rounded-xl border transition-all duration-300
                ${isOver
                    ? "bg-red-950/30 border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                    : `${styles.headerBg} ${styles.borderColor} backdrop-blur-sm`
                }
            `}>
                <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] ${styles.dotColor} ${isOver ? 'animate-pulse' : ''}`} />
                    <h3 className="font-black text-sm text-zinc-300 uppercase tracking-widest font-[family-name:var(--font-oswald)]">
                        {title}
                    </h3>
                </div>
                <span className={`
                    text-[10px] font-bold py-0.5 px-2.5 rounded-md min-w-[24px] text-center transition-colors border
                    ${isOver
                        ? 'bg-red-600 text-white border-red-500'
                        : `${styles.badgeBg} ${styles.badgeText} ${styles.borderColor}`
                    }
                `}>
                    {cards.length}
                </span>
            </div>

            {/* Droppable Area */}
            <div
                ref={setNodeRef}
                className={`
                    flex-1 p-2 rounded-xl transition-all duration-300 overflow-y-auto min-h-[150px] custom-scrollbar border
                    ${isOver
                        ? "bg-red-900/5 border-red-500/20"
                        : `bg-transparent ${styles.bodyBorder}`
                    }
                `}
            >
                <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                    {cards.map((card) => (
                        <TaskCard
                            key={card.id}
                            card={card}
                            onClick={onCardClick}
                        />
                    ))}
                    {cards.length === 0 && (
                        <div className={`
                            h-[120px] flex flex-col gap-2 items-center justify-center text-xs p-4 
                            border-2 border-dashed rounded-xl transition-all duration-300 opacity-60
                            ${isOver
                                ? "border-red-500/50 text-red-400 bg-red-950/10"
                                : "border-zinc-800/50 text-zinc-700 hover:border-zinc-700 hover:text-zinc-500 hover:bg-zinc-900/20"
                            }
                        `}>
                            <span className="text-xl opacity-50">{isOver ? "⬇️" : "∅"}</span>
                            <span className="font-medium uppercase tracking-wider text-[10px]">
                                {isOver ? "Drop Here" : "No Tasks"}
                            </span>
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
}

function getStageStyles(color: string) {
    switch (color) {
        case "purple":
            return {
                borderColor: "border-purple-500/30",
                headerBg: "bg-purple-950/20",
                dotColor: "bg-purple-500 text-purple-500",
                badgeBg: "bg-purple-950/40",
                badgeText: "text-purple-400",
                bodyBorder: "border-purple-500/10",
            };
        case "orange":
            return {
                borderColor: "border-orange-500/30",
                headerBg: "bg-orange-950/20",
                dotColor: "bg-orange-500 text-orange-500",
                badgeBg: "bg-orange-950/40",
                badgeText: "text-orange-400",
                bodyBorder: "border-orange-500/10",
            };
        case "green":
            return {
                borderColor: "border-green-500/30",
                headerBg: "bg-green-950/20",
                dotColor: "bg-green-500 text-green-500",
                badgeBg: "bg-green-950/40",
                badgeText: "text-green-400",
                bodyBorder: "border-green-500/10",
            };
        case "zinc":
        default:
            return {
                borderColor: "border-zinc-800/50",
                headerBg: "bg-zinc-900/40",
                dotColor: "bg-zinc-500 text-zinc-500",
                badgeBg: "bg-zinc-950/50",
                badgeText: "text-zinc-500",
                bodyBorder: "border-transparent",
            };
    }
}

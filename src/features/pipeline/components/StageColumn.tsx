"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { PipelineCardWithDetails, PipelineStage } from "../queries";
import { TaskCard } from "./TaskCard";
import { motion, AnimatePresence } from "framer-motion";

interface StageColumnProps {
    stage: PipelineStage;
    title: string;
    cards: PipelineCardWithDetails[];
    color: string;
    onCardClick?: (card: PipelineCardWithDetails) => void;
    selectionMode?: boolean;
    selectedIds?: number[];
    onToggleSelect?: (id: number, isShift: boolean) => void;
    columnIndex?: number;
}

export function StageColumn({ stage, title, cards, color, onCardClick, selectionMode, selectedIds, onToggleSelect, columnIndex = 0 }: StageColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: stage,
    });

    const cardIds = cards.map((c) => c.id.toString());
    const styles = getStageStyles(color);

    // Animation variants for staggered children
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 10, scale: 0.98 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring" as const,
                stiffness: 300,
                damping: 24,
            },
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.15 },
        },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: columnIndex * 0.08 }}
            className="flex flex-col flex-1 min-w-[300px] h-full transition-all duration-300"
        >
            {/* Column Header */}
            <motion.div
                whileHover={{ scale: 1.01, y: -1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`
                    glass-panel flex items-center justify-between p-3 mb-3 rounded-xl border transition-all duration-300 cursor-default
                    ${isOver
                        ? "bg-red-950/30 border-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                        : `${styles.headerBg} ${styles.borderColor} hover:shadow-lg`
                    }
                `}
            >
                <div className="flex items-center gap-3">
                    {/* Animated Pulsing Dot */}
                    <div className="relative">
                        <div className={`w-2.5 h-2.5 rounded-full ${styles.dotColor}`} />
                        <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${styles.dotColor} animate-ping opacity-50`} />
                    </div>
                    <h3 className="font-black text-sm text-zinc-300 uppercase tracking-widest font-[family-name:var(--font-oswald)]">
                        {title}
                    </h3>
                </div>
                <motion.span
                    key={cards.length}
                    initial={{ scale: 1.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className={`
                        text-[10px] font-bold py-0.5 px-2.5 rounded-md min-w-[24px] text-center transition-colors border
                        ${isOver
                            ? 'bg-red-600 text-white border-red-500'
                            : `${styles.badgeBg} ${styles.badgeText} ${styles.borderColor}`
                        }
                    `}
                >
                    {cards.length}
                </motion.span>
            </motion.div>

            {/* Droppable Area */}
            <div
                ref={setNodeRef}
                className={`
                    flex-1 p-2 rounded-xl transition-all duration-300 overflow-y-auto min-h-[150px] custom-scrollbar border
                    ${isOver
                        ? "bg-red-900/10 border-red-500/20"
                        : `bg-zinc-900/20 ${styles.bodyBorder}`
                    }
                `}
            >
                <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-0"
                        >
                            {cards.map((card, index) => (
                                <motion.div
                                    key={card.id}
                                    variants={cardVariants}
                                    layout
                                    layoutId={`card-${card.id}`}
                                >
                                    <TaskCard
                                        card={card}
                                        onClick={onCardClick}
                                        selectionMode={selectionMode}
                                        isSelected={selectedIds?.includes(card.id)}
                                        onToggleSelect={onToggleSelect}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                    {cards.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 0.6, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className={`
                                h-[120px] flex flex-col gap-2 items-center justify-center text-xs p-4 
                                border-2 border-dashed rounded-xl transition-all duration-300
                                ${isOver
                                    ? "border-red-500/50 text-red-400 bg-red-950/10"
                                    : "border-zinc-800/50 text-zinc-700 hover:border-zinc-700 hover:text-zinc-500 hover:bg-zinc-900/20"
                                }
                            `}
                        >
                            <motion.span
                                animate={isOver ? { y: [0, 5, 0] } : {}}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                                className="text-xl opacity-50"
                            >
                                {isOver ? "⬇️" : "∅"}
                            </motion.span>
                            <span className="font-medium uppercase tracking-wider text-[10px]">
                                {isOver ? "Drop Here" : "No Tasks"}
                            </span>
                        </motion.div>
                    )}
                </SortableContext>
            </div>
        </motion.div>
    );
}

function getStageStyles(color: string) {
    switch (color) {
        case "blue": // Editing - Dynamic/Active
            return {
                borderColor: "border-blue-500/60 shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)]",
                headerBg: "bg-gradient-to-r from-blue-950/80 via-blue-900/30 to-transparent",
                dotColor: "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]",
                badgeBg: "bg-blue-500/20",
                badgeText: "text-blue-300",
                bodyBorder: "border-blue-500/30 shadow-[inset_0_0_20px_-10px_rgba(59,130,246,0.15)]",
            };
        case "purple": // Ready - Premium/Polished
            return {
                borderColor: "border-purple-500/60 shadow-[0_0_15px_-3px_rgba(168,85,247,0.2)]",
                headerBg: "bg-gradient-to-r from-purple-950/80 via-purple-900/30 to-transparent",
                dotColor: "bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]",
                badgeBg: "bg-purple-500/20",
                badgeText: "text-purple-300",
                bodyBorder: "border-purple-500/30 shadow-[inset_0_0_20px_-10px_rgba(168,85,247,0.15)]",
            };
        case "green": // Delivered - Success/Completed
        case "emerald":
            return {
                borderColor: "border-emerald-500/60 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]",
                headerBg: "bg-gradient-to-r from-emerald-950/80 via-emerald-900/30 to-transparent",
                dotColor: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
                badgeBg: "bg-emerald-500/20",
                badgeText: "text-emerald-300",
                bodyBorder: "border-emerald-500/30 shadow-[inset_0_0_20px_-10px_rgba(16,185,129,0.15)]",
            };
        case "orange": // Urgent/Review
            return {
                borderColor: "border-orange-500/60 shadow-[0_0_15px_-3px_rgba(249,115,22,0.2)]",
                headerBg: "bg-gradient-to-r from-orange-950/80 via-orange-900/30 to-transparent",
                dotColor: "bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]",
                badgeBg: "bg-orange-500/20",
                badgeText: "text-orange-300",
                bodyBorder: "border-orange-500/30 shadow-[inset_0_0_20px_-10px_rgba(249,115,22,0.15)]",
            };
        case "amber": // Warning/Attention
            return {
                borderColor: "border-amber-500/60 shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]",
                headerBg: "bg-gradient-to-r from-amber-950/80 via-amber-900/30 to-transparent",
                dotColor: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
                badgeBg: "bg-amber-500/20",
                badgeText: "text-amber-300",
                bodyBorder: "border-amber-500/30 shadow-[inset_0_0_20px_-10px_rgba(245,158,11,0.15)]",
            };
        case "cyan": // Info/Processing
            return {
                borderColor: "border-cyan-500/60 shadow-[0_0_15px_-3px_rgba(6,182,212,0.2)]",
                headerBg: "bg-gradient-to-r from-cyan-950/80 via-cyan-900/30 to-transparent",
                dotColor: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]",
                badgeBg: "bg-cyan-500/20",
                badgeText: "text-cyan-300",
                bodyBorder: "border-cyan-500/30 shadow-[inset_0_0_20px_-10px_rgba(6,182,212,0.15)]",
            };
        case "rose": // Critical/High Priority
            return {
                borderColor: "border-rose-500/60 shadow-[0_0_15px_-3px_rgba(244,63,94,0.2)]",
                headerBg: "bg-gradient-to-r from-rose-950/80 via-rose-900/30 to-transparent",
                dotColor: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]",
                badgeBg: "bg-rose-500/20",
                badgeText: "text-rose-300",
                bodyBorder: "border-rose-500/30 shadow-[inset_0_0_20px_-10px_rgba(244,63,94,0.15)]",
            };
        case "zinc": // Waiting - Neutral/Pending
        default:
            return {
                borderColor: "border-zinc-700 shadow-[0_0_15px_-3px_rgba(82,82,91,0.1)]",
                headerBg: "bg-gradient-to-r from-zinc-800/80 via-zinc-900/30 to-transparent",
                dotColor: "bg-zinc-500 shadow-[0_0_8px_rgba(113,113,122,0.4)]",
                badgeBg: "bg-zinc-700/50",
                badgeText: "text-zinc-400",
                bodyBorder: "border-zinc-800/60",
            };
    }
}

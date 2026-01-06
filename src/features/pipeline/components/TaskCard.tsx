"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertTriangle, User, Package, CheckCircle2, Circle, Phone, Mail, Copy } from "lucide-react";
import { toast } from "sonner";
import { PipelineCardWithDetails } from "../queries";

interface TaskCardProps {
    card: PipelineCardWithDetails;
    onClick?: (card: PipelineCardWithDetails) => void;
    isOverlay?: boolean;
    isSelected?: boolean;
    onToggleSelect?: (id: number, isShift: boolean) => void;
    selectionMode?: boolean;
}

export function TaskCard({ card, onClick, isOverlay, isSelected, onToggleSelect, selectionMode }: TaskCardProps) {
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
        disabled: selectionMode, // Disable drag in selection mode
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    // Calculate days since event OR stage_entered_at (whichever is applicable)
    const { deltaDays, delayType } = (() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        // Method 1: Days since event date
        let eventDelta = 0;
        if (card.order_node?.event_node?.event_date) {
            const eventDate = new Date(card.order_node.event_node.event_date);
            eventDate.setHours(0, 0, 0, 0);
            eventDelta = Math.floor((now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
        }

        // Method 2: Days since stage_entered_at (fallback when event is in future)
        let stageDelta = 0;
        if (card.stage_entered_at) {
            const stageDate = new Date(card.stage_entered_at);
            stageDate.setHours(0, 0, 0, 0);
            stageDelta = Math.floor((now.getTime() - stageDate.getTime()) / (1000 * 60 * 60 * 24));
        }

        // Prioritize event delay if event is in the past
        if (eventDelta > 0) {
            return { deltaDays: eventDelta, delayType: "event" as const };
        }
        // Fallback to stage delay
        if (stageDelta > 0) {
            return { deltaDays: stageDelta, delayType: "stage" as const };
        }
        return { deltaDays: 0, delayType: null };
    })();

    // Status visual logic
    const isStuck7 = deltaDays >= 7 && card.stage !== "DELIVERED";
    const isStuck3 = deltaDays >= 3 && deltaDays < 7 && card.stage !== "DELIVERED";

    // Package Color Logic (Simple Hash)
    const getPackageColor = (name: string) => {
        const colors = [
            "text-blue-400 border-blue-500/20 bg-blue-500/10",
            "text-purple-400 border-purple-500/20 bg-purple-500/10",
            "text-pink-400 border-pink-500/20 bg-pink-500/10",
            "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
            "text-yellow-400 border-yellow-500/20 bg-yellow-500/10",
            "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const packageStyle = getPackageColor(card.order_node?.package_node?.name || "");

    const getContainerStyles = () => {
        let styles = "relative p-2.5 mb-2 border shadow-sm touch-none select-none transition-all duration-300 group rounded-md overflow-hidden ";

        if (isOverlay) {
            styles += "bg-zinc-900 shadow-[0_0_30px_rgba(220,38,38,0.3)] scale-105 rotate-1 cursor-grabbing border-red-500 z-50 ring-1 ring-red-500/50 ";
        } else if (isDragging) {
            styles += "bg-zinc-900 opacity-30 z-0 border-zinc-800 grayscale ";
        } else if (isSelected) {
            styles += "bg-zinc-900 border-red-500 ring-1 ring-red-500/50 translate-x-1.5 ";
        } else {
            // Normal State Backgrounds
            if (isStuck7) {
                styles += "bg-gradient-to-br from-red-950/30 to-zinc-950 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.2)] animate-pulse-border ";
            } else if (isStuck3) {
                styles += "bg-gradient-to-br from-orange-950/20 to-zinc-950 border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.15)] ";
            } else {
                styles += "bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800/60 opacity-100 hover:border-red-500/30 hover:shadow-[0_4px_15px_-4px_rgba(220,38,38,0.15)] hover:-translate-y-0.5 ";
            }

            if (!selectionMode) styles += "cursor-grab active:cursor-grabbing ";
        }

        return styles;
    };



    // Handle clicks
    const handleClick = (e: React.MouseEvent) => {
        if (selectionMode && onToggleSelect) {
            e.stopPropagation();
            onToggleSelect(card.id, e.shiftKey);
            return;
        }
        if (!isDragging && !isOverlay && onClick) {
            onClick(card);
        }
    };

    const handleSelectClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleSelect?.(card.id, e.shiftKey);
    };

    const handleCopy = (text: string, type: "phone" | "email") => {
        navigator.clipboard.writeText(text);
        toast.success(`${type === "phone" ? "전화번호가" : "이메일이"} 복사되었습니다.`);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={handleClick}
            className={getContainerStyles()}
        >
            {/* Stuck Gradient Overlay for severe delay */}
            {isStuck7 && <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />}

            {/* Selection Checkbox */}
            <div
                onClick={handleSelectClick}
                className={`
                    absolute top-3 right-3 z-30 transition-all duration-200 cursor-pointer
                    ${selectionMode ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'} 
                `}
            >
                {/* Adjusted top position dynamically or via class logic to avoid overlapping badge if needed, 
                    but here simple z-30 might cover badge or be covered. 
                    I'll add margin-top if stuck to push it down below the badge. */}
                {isSelected ? (
                    <CheckCircle2 className="w-5 h-5 text-red-500 bg-zinc-950 rounded-full shadow-lg" />
                ) : (
                    <Circle className="w-5 h-5 text-zinc-600 hover:text-zinc-400 bg-zinc-950/80 rounded-full shadow-lg" />
                )}
            </div>



            {/* Main Content Areas: Split Left/Right */}
            <div className="flex justify-between items-start gap-2 mb-2 relative z-10 min-h-[50px]">
                {/* Left Column: Identify & Package */}
                <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                    {/* Name - Number - Discipline */}
                    <div className="flex items-center gap-2 w-full overflow-hidden">
                        {/* Name */}
                        <h4 className="shrink truncate font-bold text-xs text-zinc-200 group-hover:text-red-400 transition-colors">
                            {card.order_node?.user_node?.name || "Unknown"}
                        </h4>

                        {/* Number */}
                        <span className="shrink-0 text-[10px] font-mono font-bold text-zinc-500">
                            NO.{card.order_node?.athlete_number || "---"}
                        </span>

                        {/* Discipline */}
                        {(card.order_node as any).discipline && (
                            <span className="shrink-0 text-[9px] font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded uppercase leading-none">
                                {(card.order_node as any).discipline.slice(0, 3)}
                            </span>
                        )}
                    </div>

                    {/* Package */}
                    <div className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded border text-[10px] font-medium w-fit max-w-full ${packageStyle}`}>
                        <Package className="w-3 h-3 opacity-70 shrink-0" />
                        <span className="truncate">
                            {card.order_node?.package_node?.name || "Unknown Package"}
                        </span>
                    </div>
                </div>

                {/* Right Column: Event & Contact Info */}
                <div className="flex flex-col items-end gap-0.5 min-w-0 shrink-0 text-right pt-0.5 pr-1">
                    {/* Event Name */}
                    <span className="text-[10px] text-zinc-400 font-medium truncate max-w-[120px] mb-1" title={card.order_node?.event_node?.title}>
                        {card.order_node?.event_node?.title}
                    </span>

                    {/* Phone */}
                    {card.order_node?.user_node?.phone && (
                        <div
                            className="flex items-center justify-end gap-1.5 text-[9px] text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors group/info w-fit"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (card.order_node.user_node.phone) handleCopy(card.order_node.user_node.phone, "phone");
                            }}
                        >
                            <span className="truncate max-w-[100px]">{card.order_node.user_node.phone}</span>
                            <Phone className="w-3 h-3 shrink-0" />
                        </div>
                    )}

                    {/* Email */}
                    {card.order_node?.user_node?.email && (
                        <div
                            className="flex items-center justify-end gap-1.5 text-[9px] text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors group/info w-fit"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(card.order_node.user_node.email, "email");
                            }}
                        >
                            <span className="truncate max-w-[120px]">{card.order_node.user_node.email}</span>
                            <Mail className="w-3 h-3 shrink-0" />
                        </div>
                    )}
                </div>
            </div>

            {/* Row 3: Worker & Status Info */}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-900/50 relative z-10">
                {/* Worker */}
                <div className="flex items-center gap-1.5">
                    <div className={`
                        h-4 w-4 rounded-full flex items-center justify-center text-[7px] font-bold border
                        ${card.worker_node
                            ? 'bg-zinc-800 text-zinc-200 border-zinc-700'
                            : 'bg-transparent text-zinc-700 border-zinc-800 border-dashed'}
                    `}>
                        {card.worker_node?.name ? card.worker_node.name.charAt(0).toUpperCase() : <User className="h-2 w-2" />}
                    </div>
                    <span className="text-[9px] text-zinc-500 font-medium truncate max-w-[60px]">
                        {card.worker_node?.name || "Unassigned"}
                    </span>
                </div>

                {/* Right Side: Warning & Status */}
                <div className="flex items-center gap-1.5">
                    {/* Warning Badge (Moved to bottom) */}
                    {(isStuck7 || isStuck3) && (
                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-bold ${isStuck7
                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                            : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                            }`}>
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>+{deltaDays}Day</span>
                        </div>
                    )}

                    {card.deliverables && card.deliverables.length > 0 && !(card.stage === "DELIVERED") && (
                        <span className="text-[9px] font-mono text-zinc-600 bg-zinc-900/50 px-1 py-0.5 rounded border border-zinc-900">
                            {card.deliverables.length} FILES
                        </span>
                    )}

                    {card.stage === "DELIVERED" && (
                        <span className={`text-[8px] font-bold px-1 py-0.5 rounded border shadow-sm ${card.deliverables?.some(d => d.is_downloaded)
                            ? "text-green-500 bg-green-950/20 border-green-900/30"
                            : "text-zinc-500 bg-zinc-900 border-zinc-800"
                            }`}>
                            {card.deliverables?.some(d => d.is_downloaded) ? "RECEIVED" : "SENT"}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

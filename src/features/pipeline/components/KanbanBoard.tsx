"use client";

import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    TouchSensor,
    closestCorners,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AlertTriangle, Maximize2, Minimize2, CheckSquare, X } from "lucide-react";

import { StageColumn } from "./StageColumn";
import { TaskCard } from "./TaskCard";
import { TaskDetailModal } from "./TaskDetailModal";
import { PipelineStage, PipelineCardWithDetails } from "../queries";
import { updateCardStage } from "../actions";
import { updateCardsStage, updateCardsAssignee } from "../bulk-actions";
import { verifyLink } from "@/features/delivery/actions";
import { KanbanFilters, PipelineFiltersState } from "./KanbanFilters";
import { PipelineStageConfig } from "../config";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface KanbanBoardProps {
    initialCards: PipelineCardWithDetails[];
    users: { id: string; name: string; email: string }[];
    packages: { id: number; name: string }[];
    events: { id: number; title: string }[];
    editors: { id: string; name: string; email: string; commission_rate: number | null }[];
    stages: PipelineStageConfig[];
}



export function KanbanBoard({ initialCards, users, packages, events, editors, stages }: KanbanBoardProps) {
    const router = useRouter();
    const [cards, setCards] = useState<PipelineCardWithDetails[]>(initialCards);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeDragStage, setActiveDragStage] = useState<PipelineStage | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Selection Mode
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [anchorId, setAnchorId] = useState<number | null>(null);

    // 상세 모달 상태
    const [selectedCard, setSelectedCard] = useState<PipelineCardWithDetails | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 필터 상태
    const [searchQuery, setSearchQuery] = useState("");
    const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");
    const [eventFilter, setEventFilter] = useState<string>("ALL");
    const [packageFilter, setPackageFilter] = useState<string>("ALL");

    // useEffect for background check or polling could go here
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 30000); // 30초마다 갱신
        return () => clearInterval(interval);
    }, [router]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(TouchSensor)
    );

    // 필터링된 카드 목록
    const filteredCards = useMemo(() => {
        return cards.filter((card) => {
            const matchesSearch =
                card.order_node?.user_node?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                card.order_node?.package_node?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                card.order_id?.toString().includes(searchQuery) ||
                false;

            const matchesAssignee =
                assigneeFilter === "ALL" ||
                (assigneeFilter === "unassigned" ? !card.assignee_id : card.assignee_id === assigneeFilter);

            const matchesEvent =
                eventFilter === "ALL" || String(card.order_node?.event_id) === eventFilter;

            const matchesPackage =
                packageFilter === "ALL" || String(card.order_node?.package_id) === packageFilter;

            return matchesSearch && matchesAssignee && matchesEvent && matchesPackage;
        });
    }, [cards, searchQuery, assigneeFilter, eventFilter, packageFilter]);

    // 스테이지별 카드 분류 (필터링 적용됨)
    const columns = useMemo(() => {
        const cols = stages.reduce((acc: Record<string, PipelineCardWithDetails[]>, stage) => {
            acc[stage.code] = [];
            return acc;
        }, {} as Record<string, PipelineCardWithDetails[]>);

        filteredCards.forEach((card) => {
            if (cols[card.stage]) {
                cols[card.stage].push(card);
            } else if (card.stage === ('SHOOTING' as any)) {
                // Legacy support: Move SHOOTING to WAITING visually
                if (cols['WAITING']) cols['WAITING'].push(card);
            }
        });
        return cols;
    }, [filteredCards, stages]);

    // 활성 카드 객체 (DragOverlay용)
    const activeCard = useMemo(() => {
        return cards.find((c) => c.id.toString() === activeId);
    }, [cards, activeId]);

    // --- Selection Handlers ---
    const toggleSelection = (id: number, isShift?: boolean) => {
        const clickedCard = cards.find(c => c.id === id);
        const anchorCard = anchorId ? cards.find(c => c.id === anchorId) : null;

        if (isShift && anchorId !== null && clickedCard && anchorCard && clickedCard.stage === anchorCard.stage) {
            // Range Selection: Replace only the items in the current stage
            const stageCards = filteredCards.filter(c => c.stage === clickedCard.stage);
            const allVisibleIds = stageCards.map(c => c.id);

            const currentIndex = allVisibleIds.indexOf(id);
            const anchorIndex = allVisibleIds.indexOf(anchorId);

            if (currentIndex !== -1 && anchorIndex !== -1) {
                const start = Math.min(currentIndex, anchorIndex);
                const end = Math.max(currentIndex, anchorIndex);
                const idsInRange = allVisibleIds.slice(start, end + 1);

                setSelectedIds(prev => {
                    // Keep IDs from other stages, replace IDs in this stage
                    const otherStageIds = prev.filter(pid => {
                        const card = cards.find(c => c.id === pid);
                        return !card || card.stage !== clickedCard.stage;
                    });
                    return [...otherStageIds, ...idsInRange];
                });
            }
        } else {
            // Normal Toggle: Set as new anchor
            setSelectedIds(prev =>
                prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
            );
            setAnchorId(id);
        }
    };

    const handleBulkMove = async (stage: PipelineStage) => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Move ${selectedIds.length} cards to ${stage}?`)) return;

        try {
            const result = await updateCardsStage(selectedIds, stage);
            if (result.success > 0) {
                toast.success(`Moved ${result.success} cards to ${stage}`);
            }
            if (result.failed > 0) {
                toast.error(`Failed to move ${result.failed} cards`);
                console.error("Errors:", result.errors);
            }
            setSelectedIds([]);
            setSelectionMode(false);
            router.refresh();
        } catch (e) {
            toast.error("Bulk move failed");
        }
    };

    const handleBulkAssign = async (workerId: string) => {
        if (selectedIds.length === 0) return;
        const worker = workerId === "unassigned" ? null : workerId;
        const workerName = worker ? editors.find(e => e.id === worker)?.name : "Unassigned";

        if (!confirm(`Assign ${selectedIds.length} cards to ${workerName}?`)) return;

        try {
            await updateCardsAssignee(selectedIds, worker);
            toast.success(`Assigned ${selectedIds.length} cards to ${workerName}`);
            setSelectedIds([]);
            setSelectionMode(false);
            router.refresh();
        } catch (e) {
            toast.error("Bulk assign failed");
        }
    };

    // --- Event Handlers ---

    const handleCardClick = (card: PipelineCardWithDetails) => {
        if (selectionMode) {
            toggleSelection(card.id, false); // Click on card without shift if not specified? 
            // Wait, card click might also want shift but usually users click the checkbox for range.
            // If they click the card body in selection mode, let's treat it as a normal toggle.
        } else {
            setSelectedCard(card);
            setIsModalOpen(true);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedCard(null);
    };

    // --- DND Handlers ---

    const handleDragStart = (event: DragStartEvent) => {
        // Disable drag in selection mode
        if (selectionMode) return;

        const id = event.active.id.toString();
        setActiveId(id);
        const card = cards.find((c) => c.id.toString() === id);
        if (card) {
            setActiveDragStage(card.stage);
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        // ... (Keep existing implementation)
        const { active, over } = event;
        if (!over) return;

        const activeIdStr = active.id.toString();
        const overIdStr = over.id.toString();

        if (activeIdStr === overIdStr) return;

        const isActiveTask = active.data.current?.sortable;
        const isOverTask = over.data.current?.sortable;

        if (!isActiveTask) return;

        // 1. Task 위로 드래그 시 (리스트 재정렬/이동)
        if (isActiveTask && isOverTask) {
            setCards((prev) => {
                const activeIndex = prev.findIndex((c) => c.id.toString() === activeIdStr);
                const overIndex = prev.findIndex((c) => c.id.toString() === overIdStr);

                if (prev[activeIndex].stage !== prev[overIndex].stage) {
                    // 다른 스테이지로 이동 시
                    const newCards = [...prev];
                    newCards[activeIndex].stage = prev[overIndex].stage;
                    return arrayMove(newCards, activeIndex, overIndex);
                }

                // 같은 스테이지 내 순서 변경
                return arrayMove(prev, activeIndex, overIndex);
            });
        }

        // 2. 컬럼 위로 드래그 시 (빈 공간 등)
        const isOverColumn = stages.some((s: PipelineStageConfig) => s.code === overIdStr);
        if (isActiveTask && isOverColumn) {
            setCards((prev) => {
                const activeIndex = prev.findIndex((c) => c.id.toString() === activeIdStr);
                if (prev[activeIndex].stage !== overIdStr) {
                    const newCards = [...prev];
                    newCards[activeIndex].stage = overIdStr as PipelineStage;
                    return arrayMove(newCards, activeIndex, activeIndex); // 위치 유지하며 stage만 변경
                }
                return prev;
            });
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        // Reset drag stage later or now? cleanup needed.
        const originalStage = activeDragStage;
        setActiveDragStage(null);

        if (!over) return;

        const activeIdStr = active.id.toString();
        const overIdStr = over.id.toString();

        const card = cards.find((c) => c.id.toString() === activeIdStr);
        if (!card) return;

        // 최종 목적지가 어떤 스테이지인지 판단
        let newStage: PipelineStage | null = null;

        if (stages.some((s: PipelineStageConfig) => s.code === overIdStr)) {
            newStage = overIdStr as PipelineStage;
        } else {
            // Task 위에 드롭된 경우, 해당 Task의 스테이지를 따름
            const overCard = cards.find((c) => c.id.toString() === overIdStr);
            if (overCard) newStage = overCard.stage;
        }

        // DEBUG: 로그 확인


        if (newStage) {
            // 같은 스테이지면 무시
            if (originalStage === newStage) {
                return;
            }

            try {
                // Server Action 호출
                await updateCardStage(card.id, newStage as any);
                toast.success(`Moved to ${newStage}`);
                router.refresh();
            } catch (error) {
                console.error("Move failed:", error);
                toast.error(`이동 실패: ${(error as Error).message}`);

                // Rollback
                setCards((prev) =>
                    prev.map((c) =>
                        c.id.toString() === activeIdStr && originalStage
                            ? { ...c, stage: originalStage }
                            : c
                    )
                );
            }
        }
    };

    // 병목 카드(72시간 이상 체류) 카운트
    const bottleneckCount = useMemo(() => {
        const now = new Date().getTime();
        return cards.filter(c => {
            if (!c.stage_entered_at) return false;
            const entered = new Date(c.stage_entered_at).getTime();
            return (now - entered) / (1000 * 60 * 60) > 72;
        }).length;
    }, [cards]);

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Bottleneck Warning Banner */}
            {bottleneckCount > 0 && (
                <div className="bg-red-950/40 border-l-4 border-red-600 p-3 mx-4 mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-red-600/20 rounded-full animate-pulse">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </div>
                        <span className="text-sm font-bold text-red-200 uppercase tracking-wide">
                            Warning: {bottleneckCount} cards are stuck for over 3 days.
                        </span>
                    </div>
                </div>
            )}
            {/* Toolbar: Heavy Metal Style */}
            {/* Toolbar: Heavy Metal Style */}
            <div className={`
                flex flex-col xl:flex-row items-stretch xl:items-center justify-start gap-4 px-6 py-4 
                backdrop-blur-md border-b border-zinc-900 sticky top-0 z-40 transition-all duration-300
                ${isFullscreen ? 'bg-zinc-950/95 pt-6' : 'bg-zinc-950/80'}
            `}>
                <KanbanFilters
                    filters={{ query: searchQuery, assigneeId: assigneeFilter, eventId: eventFilter, packageId: packageFilter }}
                    onFilterChange={(updates) => {
                        if (updates.query !== undefined) setSearchQuery(updates.query);
                        if (updates.assigneeId !== undefined) setAssigneeFilter(updates.assigneeId);
                        if (updates.eventId !== undefined) setEventFilter(updates.eventId);
                        if (updates.packageId !== undefined) setPackageFilter(updates.packageId);
                    }}
                    events={events}
                    assignees={editors}
                    packages={packages}
                />

                <div className="flex items-center gap-2 shrink-0 self-end xl:self-auto">
                    <button
                        onClick={() => setSelectionMode(!selectionMode)}
                        className={`
                            flex items-center gap-2 h-10 px-3 rounded-lg border transition-all shrink-0
                            ${selectionMode
                                ? 'bg-red-900/20 border-red-900/50 text-red-200'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'}
                        `}
                    >
                        <CheckSquare className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{selectionMode ? 'CANCEL selection' : 'SELECT cards'}</span>
                    </button>

                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="h-10 w-10 flex items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors shrink-0"
                        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Bulk Action Bar (Floating) */}
            {selectionMode && selectedIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-wrap items-center justify-center gap-2 p-3 bg-zinc-900/90 backdrop-blur-md border border-zinc-700 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 max-w-[95vw]">
                    <div className="px-3 border-r border-zinc-700 text-sm font-bold text-zinc-200">
                        {selectedIds.length} SELECTED
                    </div>

                    {/* Bulk Assign */}
                    <Select onValueChange={(val) => handleBulkAssign(val)}>
                        <SelectTrigger className="h-9 w-[140px] bg-zinc-800 border-zinc-700 text-xs">
                            <SelectValue placeholder="ASSIGN WORKER" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="unassigned">UNASSIGN</SelectItem>
                            {editors.map(e => (
                                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Bulk Move */}
                    <Select onValueChange={(val) => handleBulkMove(val as PipelineStage)}>
                        <SelectTrigger className="h-9 w-[140px] bg-zinc-800 border-zinc-700 text-xs">
                            <SelectValue placeholder="MOVE TO STAGE" />
                        </SelectTrigger>
                        <SelectContent>
                            {stages.map((s: PipelineStageConfig) => (
                                <SelectItem key={s.code} value={s.code}>{s.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <button
                        onClick={() => setSelectedIds([])}
                        className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Board Area */}
            <div className={`
                flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar transition-all duration-300
                ${isFullscreen ? 'fixed inset-0 z-50 bg-[#09090b] pt-[80px]' : ''}
            `}>
                {isFullscreen && (
                    <div className="absolute top-4 right-6 z-50">
                        <button
                            onClick={() => setIsFullscreen(false)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-900/20 border border-red-900/50 text-red-400 hover:bg-red-900/30 transition-colors"
                        >
                            <Minimize2 className="w-4 h-4" />
                            <span className="text-sm font-bold">EXIT MODE</span>
                        </button>
                    </div>
                )}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex h-full gap-4 px-4 pb-6 w-full">
                        {stages.map((stage: PipelineStageConfig) => (
                            <StageColumn
                                key={stage.code}
                                stage={stage.code as PipelineStage}
                                title={stage.title}
                                color={stage.color}
                                cards={columns[stage.code] || []}
                                onCardClick={handleCardClick}
                                selectionMode={selectionMode}
                                selectedIds={selectedIds}
                                onToggleSelect={toggleSelection}
                            />
                        ))}
                    </div>

                    <DragOverlay>
                        {activeCard ? <TaskCard card={activeCard} isOverlay /> : null}
                    </DragOverlay>
                </DndContext>
            </div>

            {/* Detail Modal */}
            <TaskDetailModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                card={selectedCard}
                availableWorkers={editors}
            />
        </div>
    );
}

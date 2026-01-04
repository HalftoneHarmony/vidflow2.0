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
import { AlertTriangle } from "lucide-react";

import { StageColumn } from "./StageColumn";
import { TaskCard } from "./TaskCard";
import { TaskDetailModal } from "./TaskDetailModal";
import { PipelineStage, PipelineCardWithDetails } from "../queries";
import { updateCardStage } from "../actions";
import { verifyLink } from "@/features/delivery/actions";
import { KanbanFilters, PipelineFiltersState } from "./KanbanFilters";

interface KanbanBoardProps {
    initialCards: PipelineCardWithDetails[];
    users: { id: string; name: string; email: string }[];
    packages: { id: number; name: string }[];
    events: { id: number; title: string }[];
}

const STAGES: { id: PipelineStage; title: string }[] = [
    { id: "WAITING", title: "Waiting" },
    { id: "SHOOTING", title: "Shooting" },
    { id: "EDITING", title: "Editing" },
    { id: "READY", title: "Ready" },
    { id: "DELIVERED", title: "Delivered" },
];
export function KanbanBoard({ initialCards, users, packages, events }: KanbanBoardProps) {
    const router = useRouter();
    const [cards, setCards] = useState<PipelineCardWithDetails[]>(initialCards);
    const [activeId, setActiveId] = useState<string | null>(null);

    // 상세 모달 상태
    const [selectedCard, setSelectedCard] = useState<PipelineCardWithDetails | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 필터 상태
    const [searchQuery, setSearchQuery] = useState("");
    const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");
    const [eventFilter, setEventFilter] = useState<string>("ALL");

    // ... (useEffect for background check remains same)

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
                card.order_id.toString().includes(searchQuery) ||
                false;

            const matchesAssignee =
                assigneeFilter === "ALL" ||
                (assigneeFilter === "unassigned" ? !card.assignee_id : card.assignee_id === assigneeFilter);

            const matchesEvent =
                eventFilter === "ALL" || String(card.order_node?.event_id) === eventFilter;

            return matchesSearch && matchesAssignee && matchesEvent;
        });
    }, [cards, searchQuery, assigneeFilter, eventFilter]);

    // 스테이지별 카드 분류 (필터링 적용됨)
    const columns = useMemo(() => {
        const cols = STAGES.reduce((acc, stage) => {
            acc[stage.id] = [];
            return acc;
        }, {} as Record<PipelineStage, PipelineCardWithDetails[]>);

        filteredCards.forEach((card) => {
            if (cols[card.stage]) {
                cols[card.stage].push(card);
            }
        });
        return cols;
    }, [filteredCards]);

    // 활성 카드 객체 (DragOverlay용)
    const activeCard = useMemo(() => {
        return cards.find((c) => c.id.toString() === activeId);
    }, [cards, activeId]);

    // 담당자 목록 추출 (Unique) - 모달에도 전달하기 위해 활용
    const assignees = useMemo(() => {
        const unique = new Map();
        initialCards.forEach((c) => {
            if (c.worker_node) {
                unique.set(c.assignee_id, c.worker_node.name);
            }
        });
        return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
    }, [initialCards]);

    // --- Event Handlers ---

    const handleCardClick = (card: PipelineCardWithDetails) => {
        setSelectedCard(card);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedCard(null);
    };

    // --- DND Handlers ---

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id.toString());
    };

    const handleDragOver = (event: DragOverEvent) => {
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

                // 같은 스테이지 내 순서 변경 (Priority 시스템이 있다면 여기서 처리)
                return arrayMove(prev, activeIndex, overIndex);
            });
        }

        // 2. 컬럼 위로 드래그 시 (빈 공간 등)
        const isOverColumn = STAGES.some((s) => s.id === overIdStr);
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

        if (!over) return;

        const activeIdStr = active.id.toString();
        const overIdStr = over.id.toString();

        const card = cards.find((c) => c.id.toString() === activeIdStr);
        if (!card) return;

        // 최종 목적지가 어떤 스테이지인지 판단
        let newStage: PipelineStage | null = null;

        if (STAGES.some((s) => s.id === overIdStr)) {
            newStage = overIdStr as PipelineStage;
        } else {
            // Task 위에 드롭된 경우, 해당 Task의 스테이지를 따름
            const overCard = cards.find((c) => c.id.toString() === overIdStr);
            if (overCard) newStage = overCard.stage;
        }

        if (newStage && card.stage !== newStage) {
            // Optimistic Update는 DragOver에서 이미 수행됨 (시각적으로)
            // 실제 데이터 업데이트 요청
            const previousStage = card.stage; // 백업용 (TODO: DragStart 시점의 스테이지를 저장해두는 것이 더 정확함)

            try {
                // 바로 반영된 상태라고 가정하고 Server Action 호출
                await updateCardStage(card.id, newStage);
                toast.success(`Moved to ${newStage}`);
                router.refresh(); // 데이터 최신화
            } catch (error) {
                console.error("Move failed:", error);

                // Rollback
                toast.error(`이동 실패: ${(error as Error).message}`);
                setCards((prev) =>
                    prev.map((c) =>
                        c.id.toString() === activeIdStr ? { ...c, stage: previousStage as PipelineStage } : c
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
                <div className="bg-red-950/40 border-l-4 border-red-600 p-3 mx-4 mt-2 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
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
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-[#0A0A0A] border-b border-zinc-800 shadow-md">
                <KanbanFilters
                    filters={{ query: searchQuery, assigneeId: assigneeFilter, eventId: eventFilter }}
                    onFilterChange={(updates) => {
                        if (updates.query !== undefined) setSearchQuery(updates.query);
                        if (updates.assigneeId !== undefined) setAssigneeFilter(updates.assigneeId);
                        if (updates.eventId !== undefined) setEventFilter(updates.eventId);
                    }}
                    events={events}
                    assignees={assignees}
                />
            </div>

            {/* Board Area */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex h-full gap-5 pb-6 min-w-max">
                        {STAGES.map((stage) => (
                            <StageColumn
                                key={stage.id}
                                stage={stage.id}
                                title={stage.title}
                                cards={columns[stage.id]}
                                onCardClick={handleCardClick}
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
                availableWorkers={assignees}
            />
        </div>
    );
}

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
import { Search, Filter } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner"; // 가정: sonner가 설치되어 있음 (package.json 확인됨)
import { useRouter } from "next/navigation";

import { StageColumn } from "./StageColumn";
import { TaskCard } from "./TaskCard";
import { TaskDetailModal } from "./TaskDetailModal";
import { PipelineStage, PipelineCardWithDetails } from "../queries";
import { updateCardStage } from "../actions";

interface KanbanBoardProps {
    initialCards: PipelineCardWithDetails[];
}

const STAGES: { id: PipelineStage; title: string }[] = [
    { id: "WAITING", title: "Waiting" },
    { id: "SHOOTING", title: "Shooting" },
    { id: "EDITING", title: "Editing" },
    { id: "READY", title: "Ready" },
    { id: "DELIVERED", title: "Delivered" },
];

export function KanbanBoard({ initialCards }: KanbanBoardProps) {
    const router = useRouter();
    const [cards, setCards] = useState<PipelineCardWithDetails[]>(initialCards);
    const [activeId, setActiveId] = useState<string | null>(null);

    // 상세 모달 상태
    const [selectedCard, setSelectedCard] = useState<PipelineCardWithDetails | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 필터 상태
    const [searchQuery, setSearchQuery] = useState("");
    const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");

    // 초기 데이터 동기화 (Server Action revalidatePath 대응)
    useEffect(() => {
        setCards(initialCards);
    }, [initialCards]);

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
                card.order?.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                card.order?.package?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                false;

            const matchesAssignee =
                assigneeFilter === "ALL" || card.assignee_id === assigneeFilter;

            return matchesSearch && matchesAssignee;
        });
    }, [cards, searchQuery, assigneeFilter]);

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
            if (c.assignee) {
                unique.set(c.assignee_id, c.assignee.name);
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

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-card rounded-lg border border-border shadow-sm">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="주문자 또는 패키지 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 w-64 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select
                        value={assigneeFilter}
                        onChange={(e) => setAssigneeFilter(e.target.value)}
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        <option value="ALL">All Workers</option>
                        {assignees.map((a) => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Board Area */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex h-full gap-4 pb-4 min-w-max">
                        {STAGES.map((stage) => (
                            <StageColumn
                                key={stage.id}
                                stage={stage.id}
                                title={stage.title}
                                cards={columns[stage.id]}
                                onCardClick={handleCardClick}
                            /> // Card render 부분은 StageColumn 내에서 TaskCard를 호출할 때 onClick을 전달할 수 있도록 StageColumn도 수정이 필요하거나
                            // 방법 1: StageColumn에 onCardClick prop 추가
                            // 방법 2: Context API 사용
                            // 여기서는 StageColumn을 수정해서 props pass-through 하는 게 가장 빠름.
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

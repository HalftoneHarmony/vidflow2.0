"use client";

import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor } from "@dnd-kit/core";
import { useState, useMemo } from "react";
import { StageColumn } from "./StageColumn";
import { TaskCard } from "./TaskCard";
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
    // 낙관적 업데이트를 위해 로컬 상태 사용 (필요시)
    // Server Action + revalidatePath 패턴에서는 보통 props 갱신을 기다림.
    // 하지만 즉각적인 반응을 위해 로컬 state를 두는 것이 UX에 좋음.
    const [cards, setCards] = useState<PipelineCardWithDetails[]>(initialCards);
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // 5px 이동해야 드래그 시작 (클릭 실수 방지)
            },
        }),
        useSensor(TouchSensor)
    );

    // 스테이지별 카드 분류
    const columns = useMemo(() => {
        const cols = STAGES.reduce((acc, stage) => {
            acc[stage.id] = [];
            return acc;
        }, {} as Record<PipelineStage, PipelineCardWithDetails[]>);

        cards.forEach((card) => {
            if (cols[card.stage]) {
                cols[card.stage].push(card);
            } else {
                // 정의되지 않은 스테이지 예외 처리
                // console.warn(`Card ${card.id} has unknown stage: ${card.stage}`);
            }
        });
        return cols;
    }, [cards]);

    const activeCard = useMemo(() => {
        return cards.find((c) => c.id.toString() === activeId);
    }, [cards, activeId]);

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeIdStr = active.id.toString();
        const overIdStr = over.id.toString(); // Stage ID (e.g., "SHOOTING") or Card ID

        // Drop된 곳이 Stage 컬럼 자체인지 확인
        // 만약 카드 위에 드롭했다면 그 카드의 부모를 찾아야 함(여기서는 Droppable id가 Stage 이름과 동일)
        // Dnd-kit 구조상 StageColumn의 id를 Stage name으로 설정했음.
        const newStage = overIdStr as PipelineStage;

        // 유효한 Stage인지 검사 (Droppable ID가 Stage 이름 중 하나여야 함)
        const isValidStage = STAGES.some((s) => s.id === newStage);
        if (!isValidStage) return; // 카드 위에 드롭했을 때 처리 로직은 복잡해질 수 있음 (여기선 컬럼 드롭만 가정)

        const card = cards.find((c) => c.id.toString() === activeIdStr);
        if (!card) return;

        if (card.stage !== newStage) {
            // 1. Optimistic Update
            const originalStage = card.stage;
            setCards((prev) =>
                prev.map((c) =>
                    c.id.toString() === activeIdStr ? { ...c, stage: newStage } : c
                )
            );

            try {
                // 2. Server Action Call
                await updateCardStage(card.id, newStage);
            } catch (error) {
                console.error("Failed to move card:", error);

                // 3. Rollback on Error
                setCards((prev) =>
                    prev.map((c) =>
                        c.id.toString() === activeIdStr ? { ...c, stage: originalStage } : c
                    )
                );
                alert(`이동 실패: ${(error as Error).message}`);
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                {STAGES.map((stage) => (
                    <StageColumn
                        key={stage.id}
                        stage={stage.id}
                        title={stage.title}
                        cards={columns[stage.id]}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeCard ? <TaskCard card={activeCard} /> : null}
            </DragOverlay>
        </DndContext>
    );
}

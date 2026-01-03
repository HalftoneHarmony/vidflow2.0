"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PipelineCardWithDetails } from "../queries";
import { LinkInputModal } from "@/features/delivery/components/LinkInputModal";
import type { LinkStatus } from "@/features/delivery/actions";

interface TaskCardProps {
    card: PipelineCardWithDetails;
}

// Supabase 타입과 호환성을 위한 헬퍼 타입
type DeliverableRow = PipelineCardWithDetails["deliverables"][number];

export function TaskCard({ card }: TaskCardProps) {
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
    });

    // 모달 관리 상태
    const [selectedDeliverable, setSelectedDeliverable] = useState<DeliverableRow | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    // 병목 감지 로직
    const isBottleneck = (() => {
        if (card.stage === "DELIVERED") return false; // 배송 완료된 건은 병목 아님
        if (!card.stage_entered_at) return false;
        const entered = new Date(card.stage_entered_at).getTime();
        const now = new Date().getTime();
        const diffHours = (now - entered) / (1000 * 60 * 60);
        return diffHours > 72;
    })();

    const handleDeliverableClick = (e: React.MouseEvent, deliverable: DeliverableRow) => {
        e.stopPropagation(); // 드래그 방지
        e.preventDefault();

        setSelectedDeliverable(deliverable);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedDeliverable(null);
    };

    // 링크 상태 아이콘 색상 결정
    const getLinkStatusColor = (d: DeliverableRow) => {
        if (!d.external_link_url) return "text-zinc-500 hover:text-zinc-300"; // 미입력
        if (d.link_status === "VALID") return "text-green-500 hover:text-green-400";
        if (d.link_status === "INVALID") return "text-red-500 hover:text-red-400";
        return "text-amber-500 hover:text-amber-400"; // UNCHECKED
    };

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                {...listeners}
                {...attributes}
                className={`
                    relative p-4 mb-3 rounded-lg border-2 shadow-sm cursor-grab touch-none select-none
                    transition-all duration-200
                    ${isDragging ? "opacity-30 z-50 border-red-500 bg-zinc-800" : "opacity-100 bg-zinc-900 border-zinc-800 hover:border-zinc-700"}
                    ${isBottleneck ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]" : ""}
                `}
            >
                {/* Header: Order ID & Warning */}
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono text-zinc-500">#{card.order_id}</span>
                    {isBottleneck && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-950/50 px-2 py-0.5 rounded border border-red-900 animate-pulse">
                            STUCK (3d+)
                        </span>
                    )}
                </div>

                {/* Body: Package & Customer */}
                <h4 className="font-bold text-sm text-white mb-1 truncate">
                    {card.order?.package?.name || "Unknown Package"}
                </h4>
                <div className="flex justify-between items-end mb-3">
                    <p className="text-xs text-zinc-400">
                        {card.order?.user?.name || "Unknown User"}
                    </p>

                    {/* 🔗 링크 관리 영역 (Sentinel's Area) */}
                    {card.deliverables && card.deliverables.length > 0 && (
                        <div className="flex gap-1" onPointerDown={(e) => e.stopPropagation()}>
                            {card.deliverables.map((d) => (
                                <button
                                    key={d.id}
                                    onClick={(e) => handleDeliverableClick(e, d)}
                                    className={`
                                        p-1 rounded hover:bg-zinc-800 transition-colors
                                        ${getLinkStatusColor(d)}
                                    `}
                                    title={`${d.type}: ${d.link_status || "UNCHECKED"}`}
                                >
                                    {d.type === "MAIN_VIDEO" ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    ) : d.type === "SHORTS" ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                    )}
                                    {/* 상태 인디케이터 뱃지 */}
                                    {(!d.external_link_url || d.link_status === "INVALID") && (
                                        <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-red-500 border border-zinc-900" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer: Worker & Status */}
                <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden">
                            {card.assignee?.name ? card.assignee.name.charAt(0) : "?"}
                        </div>
                        <span className="text-xs text-zinc-400 truncate max-w-[80px]">
                            {card.assignee?.name || "Unassigned"}
                        </span>
                    </div>
                </div>
            </div>

            {/* 링크 입력 모달 (드래그 영역 밖에서 렌더링) */}
            {isModalOpen && selectedDeliverable && (
                <LinkInputModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    deliverableId={selectedDeliverable.id}
                    deliverableType={selectedDeliverable.type}
                    currentLink={selectedDeliverable.external_link_url}
                    onSuccess={(status) => {
                        // 성공 시 로컬 업데이트 없이 서버 리프레시(actions에서 처리됨)
                        // 필요하면 여기서 토스트나 상태 업데이트 가능
                    }}
                />
            )}
        </>
    );
}

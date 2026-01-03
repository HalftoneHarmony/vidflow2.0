"use server";

/**
 * 🏭 Pipeline Server Actions
 * 칸반 보드 상태 관리
 */

export type PipelineStage = "WAITING" | "SHOOTING" | "EDITING" | "READY" | "DELIVERED";

export async function updateCardStage(cardId: number, newStage: PipelineStage) {
    // TODO: Stage Gate 검증 - DELIVERED로 변경 시 모든 deliverables에 링크 필요
    // TODO: stage_entered_at 업데이트
    console.log(`Card ${cardId} moved to ${newStage}`);
}

export async function assignWorker(cardId: number, workerId: string) {
    // TODO: Supabase 업데이트
    console.log(`Card ${cardId} assigned to ${workerId}`);
}

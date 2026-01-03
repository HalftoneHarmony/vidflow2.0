"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type PipelineStage = "WAITING" | "SHOOTING" | "EDITING" | "READY" | "DELIVERED";

/**
 * 카드의 스테이지를 변경합니다.
 * @param cardId 파이프라인 카드 ID
 * @param newStage 변경할 스테이지
 */
export async function updateCardStage(cardId: number, newStage: PipelineStage) {
    const supabase = await createClient();

    // 1. Stage Gate: DELIVERED로 이동 시 제약 조건 검사
    if (newStage === "DELIVERED") {
        const { data: deliverables, error: fetchError } = await supabase
            .from("deliverables")
            .select("type, external_link_url")
            .eq("card_id", cardId);

        if (fetchError) {
            throw new Error(`Failed to fetch deliverables: ${fetchError.message}`);
        }

        // 산출물 체크
        if (deliverables && deliverables.length > 0) {
            const missingLinks = deliverables.filter((d) => !d.external_link_url);
            if (missingLinks.length > 0) {
                const missingTypes = missingLinks.map((d) => d.type).join(", ");
                throw new Error(
                    `Cannot move to DELIVERED. Missing links for: ${missingTypes}`
                );
            }
        } else {
            console.warn(`[StageGate] No deliverables found for card ${cardId}`);
        }
    }

    // 2. 상태 업데이트 및 stage_entered_at 갱신
    const { error } = await supabase
        .from("pipeline_cards")
        .update({
            stage: newStage,
            stage_entered_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq("id", cardId);

    if (error) {
        throw new Error(`Failed to update card stage: ${error.message}`);
    }

    console.log(`[Pipeline] Card ${cardId} moved to ${newStage}`);
    revalidatePath("/admin/pipeline");
}

/**
 * 작업자를 할당합니다.
 * @param cardId 파이프라인 카드 ID
 * @param workerId 작업자 Profile ID (UUID) 또는 null (할당 해제)
 */
export async function assignWorker(cardId: number, workerId: string | null) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("pipeline_cards")
        .update({
            assignee_id: workerId,
            updated_at: new Date().toISOString(),
        })
        .eq("id", cardId);

    if (error) {
        throw new Error(`Failed to assign worker: ${error.message}`);
    }

    console.log(`[Pipeline] Card ${cardId} assigned to ${workerId}`);
    revalidatePath("/admin/pipeline");
}

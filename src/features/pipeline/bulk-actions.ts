"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { PipelineStage } from "./queries";
import { updateCardStage, assignWorker } from "./actions";

/**
 * Multiple cards bulk stage update
 */
export async function updateCardsStage(cardIds: number[], newStage: PipelineStage) {
    const supabase = await createClient();

    // 🔐 Check Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized: Please login.");
    }

    // Process serially or in parallel. 
    // updateCardStage has specific logic (finance, delivery checks), so we should loop and call it.
    // However, for bulk, performance might be an issue.
    // For now, let's just loop to ensure safety logic runs for each.

    const results = [];
    const errors = [];

    for (const id of cardIds) {
        try {
            await updateCardStage(id, newStage);
            results.push(id);
        } catch (e: any) {
            console.error(`Failed to move card ${id}:`, e);
            errors.push({ id, message: e.message });
        }
    }

    revalidatePath("/admin/pipeline");

    return { success: results.length, failed: errors.length, errors };
}

/**
 * Multiple cards bulk assignee update
 */
export async function updateCardsAssignee(cardIds: number[], workerId: string | null) {
    const supabase = await createClient();

    // 🔐 Check Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    // Direct DB update for efficiency since assignWorker logic is simple.
    // But assignWorker updates 'updated_at' too.

    const { error } = await supabase
        .from("pipeline_cards")
        .update({
            assignee_id: workerId,
            updated_at: new Date().toISOString(),
        })
        .in("id", cardIds);

    if (error) {
        throw new Error(`Failed to bulk assign workers: ${error.message}`);
    }

    console.log(`[Pipeline] Bulk assigned ${cardIds.length} cards to ${workerId}`);
    revalidatePath("/admin/pipeline");

    return { success: true };
}

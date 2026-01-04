"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * 📅 Event Actions
 * 이벤트 상태 변경 및 관리
 */

/**
 * 이벤트 활성화 상태 토글
 */
export async function toggleEventActive(eventId: number, isActive: boolean) {
    const supabase = await createClient();

    // 관리자 권한 체크 (미들웨어에서도 하지만 한번 더)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from("events")
        .update({ is_active: isActive })
        .eq("id", eventId);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/events"); // Public events page
    revalidatePath("/admin/events"); // Admin events page
    revalidatePath("/showcase"); // Showcase page
    return { success: true };
}

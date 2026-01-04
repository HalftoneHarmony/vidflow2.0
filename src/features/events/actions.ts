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

/**
 * 이벤트 생성
 */
export async function createEvent(formData: FormData) {
    const supabase = await createClient();

    // 관리자 권한 체크
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const title = formData.get("title") as string;
    const location = formData.get("location") as string;
    const eventDate = formData.get("eventDate") as string;
    const thumbnailUrl = formData.get("thumbnailUrl") as string;
    const isActive = formData.get("isActive") === "true";

    if (!title || !eventDate) {
        throw new Error("필수 항목을 입력해주세요.");
    }

    const { error } = await supabase
        .from("events")
        .insert({
            title,
            location,
            event_date: eventDate,
            thumbnail_url: thumbnailUrl,
            is_active: isActive
        });

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/events");
    revalidatePath("/admin/events");
    return { success: true };
}

/**
 * 이벤트 수정
 */
export async function updateEvent(eventId: number, formData: FormData) {
    const supabase = await createClient();

    // 관리자 권한 체크
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const title = formData.get("title") as string;
    const location = formData.get("location") as string;
    const eventDate = formData.get("eventDate") as string;
    const thumbnailUrl = formData.get("thumbnailUrl") as string;
    // isActive는 별도 토글 액션이 있으므로 여기서는 폼에서 넘어온 값만 처리하거나 무시할 수 있음.
    // 폼에 isActive 스위치가 있다면 처리.
    const isActiveStr = formData.get("isActive");

    const updates: any = {
        title,
        location,
        event_date: eventDate,
        thumbnail_url: thumbnailUrl,
    };

    if (isActiveStr !== null) {
        updates.is_active = isActiveStr === "true";
    }

    const { error } = await supabase
        .from("events")
        .update(updates)
        .eq("id", eventId);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/events");
    revalidatePath("/admin/events");
    return { success: true };
}

/**
 * 이벤트 삭제
 */
export async function deleteEvent(eventId: number) {
    const supabase = await createClient();

    // 관리자 권한 체크
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/events");
    revalidatePath("/admin/events");
    return { success: true };
}

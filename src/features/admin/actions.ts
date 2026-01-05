"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// =============================================
// 공지사항 관련
// =============================================

export type Announcement = {
    id: number;
    title: string;
    content: string;
    type: "info" | "warning" | "promotion" | "maintenance" | "urgent";
    is_pinned: boolean;
    created_at: string;
};

// 활성 공지사항 조회
export async function getActiveAnnouncements(): Promise<Announcement[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("announcements")
        .select("id, title, content, type, is_pinned, created_at")
        .eq("is_active", true)
        .lte("starts_at", new Date().toISOString())
        .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching announcements:", error);
        return [];
    }

    return (data || []) as Announcement[];
}

// 공지사항 생성 (관리자용)
export async function createAnnouncement(data: {
    title: string;
    content: string;
    type?: string;
    target_audience?: string;
    is_pinned?: boolean;
    expires_at?: string | null;
}) {
    const supabase = await createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase.from("announcements").insert({
        title: data.title,
        content: data.content,
        type: data.type || "info",
        target_audience: data.target_audience || "all",
        is_pinned: data.is_pinned || false,
        expires_at: data.expires_at || null,
        created_by: user.user.id,
    });

    if (error) {
        console.error("Error creating announcement:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin");
    return { success: true };
}

// 공지사항 삭제 (관리자용)
export async function deleteAnnouncement(id: number) {
    const supabase = await createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting announcement:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin");
    return { success: true };
}

// =============================================
// 활동 로그 관련
// =============================================

export type ActivityLog = {
    id: number;
    user_id: string | null;
    action: string;
    entity_type: string | null;
    entity_id: string | null;
    old_value: Record<string, unknown> | null;
    new_value: Record<string, unknown> | null;
    created_at: string;
    user_name?: string;
};

// 최근 활동 로그 조회
export async function getRecentActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("activity_logs")
        .select(`
            id,
            user_id,
            action,
            entity_type,
            entity_id,
            old_value,
            new_value,
            created_at,
            profiles:user_id (name)
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching activity logs:", error);
        return [];
    }

    return (data || []).map((log: any) => ({
        ...log,
        user_name: log.profiles?.name || "System",
    }));
}

// 활동 로그 기록
export async function logActivity(
    action: string,
    entityType?: string,
    entityId?: string,
    oldValue?: Record<string, unknown>,
    newValue?: Record<string, unknown>
) {
    const supabase = await createClient();

    const { error } = await supabase.rpc("log_activity", {
        p_action: action,
        p_entity_type: entityType || null,
        p_entity_id: entityId || null,
        p_old_value: oldValue || null,
        p_new_value: newValue || null,
    });

    if (error) {
        console.error("Error logging activity:", error);
    }
}

// =============================================
// 사용자 설정 관련
// =============================================

export type UserPreferences = {
    user_id: string;
    email_notifications: boolean;
    sms_notifications: boolean;
    language: string;
    timezone: string;
    theme: "light" | "dark" | "system";
};

// 사용자 설정 조회
export async function getUserPreferences(): Promise<UserPreferences | null> {
    const supabase = await createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.user.id)
        .single();

    if (error) {
        // 설정이 없으면 기본값 반환
        if (error.code === "PGRST116") {
            return {
                user_id: user.user.id,
                email_notifications: true,
                sms_notifications: false,
                language: "ko",
                timezone: "Asia/Seoul",
                theme: "dark",
            };
        }
        console.error("Error fetching user preferences:", error);
        return null;
    }

    return data as UserPreferences;
}

// 사용자 설정 업데이트
export async function updateUserPreferences(preferences: Partial<UserPreferences>) {
    const supabase = await createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
        .from("user_preferences")
        .upsert({
            user_id: user.user.id,
            ...preferences,
            updated_at: new Date().toISOString(),
        });

    if (error) {
        console.error("Error updating user preferences:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// =============================================
// 문의 관리 (관리자용)
// =============================================

export type ContactSubmission = {
    id: number;
    name: string;
    email: string;
    subject: string | null;
    message: string;
    category: string;
    status: "pending" | "in_progress" | "resolved" | "closed";
    admin_notes: string | null;
    created_at: string;
};

// 문의 목록 조회 (관리자용)
export async function getContactSubmissions(status?: string): Promise<ContactSubmission[]> {
    const supabase = await createClient();

    let query = supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

    if (status) {
        query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching contact submissions:", error);
        return [];
    }

    return (data || []) as ContactSubmission[];
}

// 문의 상태 업데이트 (관리자용)
export async function updateContactStatus(
    id: number,
    status: "pending" | "in_progress" | "resolved" | "closed",
    adminNotes?: string
) {
    const supabase = await createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { success: false, error: "Unauthorized" };

    const updateData: Record<string, unknown> = { status };

    if (adminNotes !== undefined) {
        updateData.admin_notes = adminNotes;
    }

    if (status === "resolved" || status === "closed") {
        updateData.responded_at = new Date().toISOString();
        updateData.responded_by = user.user.id;
    }

    const { error } = await supabase
        .from("contact_submissions")
        .update(updateData)
        .eq("id", id);

    if (error) {
        console.error("Error updating contact status:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin");
    return { success: true };
}

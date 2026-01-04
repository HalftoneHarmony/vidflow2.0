import { createClient } from "@/lib/supabase/server";

/**
 * 🔍 Auth Queries
 * 현재 사용자 정보 조회 및 권한 확인
 * 
 * @author Vulcan (The Forge Master)
 */

export type UserWithProfile = {
    id: string;
    email: string;
    profile: {
        id: string;
        email: string;
        name: string;
        role: "ADMIN" | "EDITOR" | "USER";
        phone: string | null;
        commission_rate: number;
        created_at: string;
    } | null;
};

/**
 * 현재 로그인된 사용자 정보 조회
 */
export async function getCurrentUser(): Promise<UserWithProfile | null> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return null;
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (profileError) {
        console.error("[Vulcan] Profile fetch error:", profileError.message);
    }

    return {
        id: user.id,
        email: user.email || "",
        profile: profile || null,
    };
}

/**
 * 현재 사용자가 관리자인지 확인
 */
export async function isAdmin(): Promise<boolean> {
    const user = await getCurrentUser();
    return user?.profile?.role === "ADMIN";
}

/**
 * 현재 사용자가 스태프(ADMIN 또는 EDITOR)인지 확인
 */
export async function isStaff(): Promise<boolean> {
    const user = await getCurrentUser();
    const role = user?.profile?.role;
    return role === "ADMIN" || role === "EDITOR";
}

/**
 * 세션 유효성 확인 (미들웨어용)
 */
export async function getSession() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

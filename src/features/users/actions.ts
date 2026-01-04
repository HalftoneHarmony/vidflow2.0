"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * 👥 User Management Server Actions
 * 사용자 역할 및 커미션율 관리
 * 
 * @author Vulcan (The Forge Master)
 */

export type UserRole = "ADMIN" | "EDITOR" | "USER";

/**
 * 사용자 프로필 조회
 */
export async function getUserProfile(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) {
        console.error("[Vulcan] Get user profile error:", error.message);
        return null;
    }

    return data;
}

/**
 * 사용자 역할 업데이트
 */
export async function updateUserRole(userId: string, role: UserRole) {
    const supabase = await createClient();

    // 현재 사용자가 ADMIN인지 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("인증이 필요합니다.");
    }

    const { data: currentUserProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (currentUserProfile?.role !== "ADMIN") {
        throw new Error("관리자 권한이 필요합니다.");
    }

    // 역할 업데이트
    const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId);

    if (error) {
        console.error("[Vulcan] Role update error:", error.message);
        throw new Error(error.message);
    }

    revalidatePath("/users");
    return { success: true };
}

/**
 * 사용자 커미션율 업데이트
 */
export async function updateCommissionRate(userId: string, rate: number) {
    const supabase = await createClient();

    // 현재 사용자가 ADMIN인지 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("인증이 필요합니다.");
    }

    const { data: currentUserProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (currentUserProfile?.role !== "ADMIN") {
        throw new Error("관리자 권한이 필요합니다.");
    }

    // 범위 검증 (0원 ~ 무제한, 음수만 차단)
    if (rate < 0) {
        throw new Error("커미션율은 0 이상이어야 합니다.");
    }

    // 커미션율 업데이트
    const { error } = await supabase
        .from("profiles")
        .update({ commission_rate: rate })
        .eq("id", userId);

    if (error) {
        console.error("[Vulcan] Commission rate update error:", error.message);
        throw new Error(error.message);
    }

    revalidatePath("/users");
    return { success: true };
}

/**
 * 모든 사용자 목록 조회
 */
export async function getAllUsers() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[Vulcan] Get all users error:", error.message);
        throw new Error(error.message);
    }

    return data;
}

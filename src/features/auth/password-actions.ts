"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type PasswordActionState = {
    message?: string;
    error?: string;
    success?: boolean;
};

/**
 * 🔄 비밀번호 초기화 요청
 * 이메일로 비밀번호 재설정 링크 전송
 */
export async function requestPasswordReset(
    prevState: PasswordActionState,
    formData: FormData
): Promise<PasswordActionState> {
    const supabase = await createClient();
    const email = formData.get("email") as string;

    if (!email) {
        return { error: "이메일을 입력해주세요." };
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { error: "올바른 이메일 형식이 아닙니다." };
    }

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/reset-password`,
        });

        if (error) {
            console.error("[Password Reset] Error:", error.message);
            return { error: "비밀번호 재설정 이메일 전송에 실패했습니다." };
        }

        return {
            success: true,
            message: "비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.",
        };
    } catch (error: any) {
        console.error("[Password Reset] Unexpected error:", error);
        return { error: "오류가 발생했습니다. 다시 시도해주세요." };
    }
}

/**
 * 🔐 비밀번호 재설정
 * 이메일 링크를 통해 새로운 비밀번호 설정
 */
export async function resetPassword(
    prevState: PasswordActionState,
    formData: FormData
): Promise<PasswordActionState> {
    const supabase = await createClient();
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("passwordConfirm") as string;

    // Validation
    if (!password || !passwordConfirm) {
        return { error: "비밀번호를 입력해주세요." };
    }

    if (password !== passwordConfirm) {
        return { error: "비밀번호가 일치하지 않습니다." };
    }

    if (password.length < 8) {
        return { error: "비밀번호는 8자 이상이어야 합니다." };
    }

    const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
        return { error: "비밀번호는 영문 대문자, 소문자, 숫자를 모두 포함해야 합니다." };
    }

    try {
        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        if (error) {
            console.error("[Password Reset] Update error:", error.message);
            return { error: "비밀번호 재설정에 실패했습니다." };
        }

        revalidatePath("/", "layout");
        return {
            success: true,
            message: "비밀번호가 성공적으로 재설정되었습니다.",
        };
    } catch (error: any) {
        console.error("[Password Reset] Unexpected error:", error);
        return { error: "오류가 발생했습니다. 다시 시도해주세요." };
    }
}

/**
 * 🔑 비밀번호 변경 (로그인된 사용자)
 * 현재 비밀번호 확인 후 새 비밀번호로 변경
 */
export async function changePassword(
    prevState: PasswordActionState,
    formData: FormData
): Promise<PasswordActionState> {
    const supabase = await createClient();

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const newPasswordConfirm = formData.get("newPasswordConfirm") as string;

    // 현재 사용자 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "로그인이 필요합니다." };
    }

    // Validation
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
        return { error: "모든 항목을 입력해주세요." };
    }

    if (newPassword !== newPasswordConfirm) {
        return { error: "새 비밀번호가 일치하지 않습니다." };
    }

    if (newPassword.length < 8) {
        return { error: "비밀번호는 8자 이상이어야 합니다." };
    }

    const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(newPassword)) {
        return { error: "비밀번호는 영문 대문자, 소문자, 숫자를 모두 포함해야 합니다." };
    }

    if (currentPassword === newPassword) {
        return { error: "새 비밀번호는 현재 비밀번호와 달라야 합니다." };
    }

    try {
        // 현재 비밀번호 확인
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password: currentPassword,
        });

        if (signInError) {
            return { error: "현재 비밀번호가 올바르지 않습니다." };
        }

        // 새 비밀번호로 업데이트
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (updateError) {
            console.error("[Password Change] Update error:", updateError.message);
            return { error: "비밀번호 변경에 실패했습니다." };
        }

        revalidatePath("/", "layout");
        return {
            success: true,
            message: "비밀번호가 성공적으로 변경되었습니다.",
        };
    } catch (error: any) {
        console.error("[Password Change] Unexpected error:", error);
        return { error: "오류가 발생했습니다. 다시 시도해주세요." };
    }
}

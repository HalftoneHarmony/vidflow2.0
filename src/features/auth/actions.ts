"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/**
 * 🔐 Auth Server Actions
 * Supabase Auth 기반 로그인, 로그아웃, 회원가입 처리
 * 
 * @author Vulcan (The Forge Master)
 */

export type ActionState = {
    message?: string;
    error?: string;
    success?: boolean;
};

/**
 * 🔑 로그인 액션
 */
export async function login(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "이메일과 비밀번호를 입력해주세요." };
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error("[Vulcan] Login error:", error.message);
        return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
    }

    revalidatePath("/", "layout");
    redirect("/admin/dashboard");
}

/**
 * 📝 회원가입 액션
 */
export async function signup(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("passwordConfirm") as string;
    const phone = formData.get("phone") as string | null;
    const instagramId = formData.get("instagramId") as string | null;

    // Validation
    if (!name || !email || !password) {
        return { error: "필수 항목을 모두 입력해주세요." };
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

    // Supabase Auth 회원가입
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
                phone: phone,
            },
        },
    });

    if (error) {
        console.error("[Vulcan] Signup error:", error.message);

        if (error.message.includes("already registered")) {
            return { error: "이미 등록된 이메일입니다." };
        }
        return { error: error.message };
    }

    // Profile 테이블에 사용자 정보 생성
    if (data.user) {
        const { error: profileError } = await supabase.from("profiles").upsert({
            id: data.user.id,
            email: email,
            name: name,
            phone: phone || null,
            instagram_id: instagramId || null,
            role: "USER",
        });

        if (profileError) {
            console.error("[Vulcan] Profile creation error:", profileError.message);
        }
    }

    revalidatePath("/", "layout");
    return {
        success: true,
        message: "회원가입이 완료되었습니다. 이메일을 확인해주세요."
    };
}

/**
 * 🚪 로그아웃 액션
 */
export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/login");
}

/**
 * 🔑 signIn (Form Action용 래퍼)
 * 단순 formData만 받는 버전
 */
export async function signIn(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/", "layout");
    redirect("/admin/dashboard");
}

/**
 * 📝 signUp (Form Action용 래퍼)
 */
export async function signUp(formData: FormData) {
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const phone = formData.get("phone") as string | null;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
                phone: phone,
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    if (data.user) {
        await supabase.from("profiles").upsert({
            id: data.user.id,
            email: email,
            name: name,
            phone: phone || null,
            role: "USER",
        });
    }

    revalidatePath("/", "layout");
    return { success: true, message: "회원가입이 완료되었습니다." };
}

/**
 * 🔓 signOut (단순 래퍼)
 */
export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/login");
}

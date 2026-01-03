"use server";

/**
 * 🔐 Auth Server Actions
 * 로그인, 로그아웃, 회원가입 처리
 */

export async function login(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // TODO: Supabase Auth 연동
    console.log("Login attempt:", email);
}

export async function logout() {
    // TODO: Supabase Auth signOut
    console.log("Logout");
}

export async function signup(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    // TODO: Supabase Auth 연동 + profiles 테이블 생성
    console.log("Signup attempt:", email, name);
}

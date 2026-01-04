import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * 🛡️ Authentication Middleware
 * 관리자 페이지 접근 제어 및 세션 관리
 * 
 * @author Vulcan (The Forge Master)
 */

// 인증이 필요한 경로들
const PROTECTED_ROUTES = [
    "/dashboard",
    "/pipeline",
    "/finance",
    "/products",
    "/users",
    "/delivery",
];

// 로그인된 사용자가 접근하면 리다이렉트할 경로들
const AUTH_ROUTES = ["/login", "/join"];

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    // 세션 갱신 (중요: getUser()를 호출해야 세션이 갱신됨)
    const { data: { user } } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // 1. 보호된 경로 체크 - 비로그인 시 로그인 페이지로 리다이렉트
    const isProtectedRoute = PROTECTED_ROUTES.some(route =>
        pathname.startsWith(route)
    );

    if (isProtectedRoute && !user) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 2. 인증 경로 체크 - 로그인된 사용자는 대시보드로 리다이렉트
    const isAuthRoute = AUTH_ROUTES.some(route => pathname === route);

    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 3. (선택) 관리자 전용 경로 체크
    // 역할 기반 접근 제어 (Role-Based Access Control)
    if (isProtectedRoute && user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        // ADMIN 또는 EDITOR가 아니면 홈으로 추방 (Sentinel Kick)
        if (profile?.role !== "ADMIN" && profile?.role !== "EDITOR") {
            console.warn(`[Sentinel] Unauthorized access attempt by ${user.email} to ${pathname}`);
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc.)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    ],
};

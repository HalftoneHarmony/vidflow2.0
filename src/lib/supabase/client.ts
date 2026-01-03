/**
 * 🔌 Supabase Client (Client-side)
 * 브라우저에서 사용하는 Supabase 클라이언트
 */
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

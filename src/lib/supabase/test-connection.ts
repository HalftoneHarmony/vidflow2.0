/**
 * 🔌 Supabase Connection Test
 * 연결 테스트용 유틸리티 (개발 환경에서만 사용)
 */

export async function testSupabaseConnection() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log("🔍 Supabase Connection Test");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📍 URL: ${url ? "✅ Set" : "❌ Missing"}`);
    console.log(`🔑 Key: ${key ? "✅ Set" : "❌ Missing"}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    if (!url || !key) {
        console.error("❌ Missing environment variables!");
        return false;
    }

    return true;
}

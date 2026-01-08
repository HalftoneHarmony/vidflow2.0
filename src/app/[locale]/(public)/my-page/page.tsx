import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserOrders } from "@/features/orders/actions";
import { getUserProfile } from "@/features/users/actions";
import { getUserInquiries } from "@/features/support/actions";
import { MyPageClient } from "./MyPageClient";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: "MyPage" });
    return {
        title: t("meta_title"),
        description: t("meta_description"),
    };
}

export default async function MyPage() {
    const supabase = await createClient();

    // 1. 사용자 인증 확인
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?next=/my-page");
    }

    // 2. 데이터 병렬 로딩
    const [orders, profile, inquiries, preferences] = await Promise.all([
        getUserOrders(user.id),
        getUserProfile(user.id),
        getUserInquiries(user.id),
        import("@/features/users/actions").then(m => m.getUserPreferences(user.id))
    ]);

    return (
        <MyPageClient
            user={user}
            profile={profile}
            orders={orders}
            inquiries={inquiries}
            preferences={preferences}
        />
    );
}

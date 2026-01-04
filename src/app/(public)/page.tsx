import { getSettings } from "@/features/settings/actions";

/**
 * 🏠 Landing Page
 * 메인 랜딩 페이지
 */
export default async function HomePage() {
    const settings = await getSettings(["site_name"]);
    const siteName = settings.site_name || "VidFlow";

    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-5xl font-bold text-center mb-8">
                <span className="text-red-500">{siteName}</span> Manager
            </h1>
            <p className="text-xl text-zinc-400 text-center max-w-2xl mx-auto">
                보디빌딩 대회 영상 프로덕션의 전 과정을 관통하는 통합 비즈니스 엔진
            </p>
        </div>
    );
}

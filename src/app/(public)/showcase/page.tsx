/**
 * ✨ Showcase Page
 * 패키지 포트폴리오 갤러리 - Side-by-Side Player
 * 
 * @author Dealer (The Salesman)
 */

import { getActiveEvents, getPackagesWithShowcase } from "@/features/showcase/queries";
import { getSetting } from "@/features/settings/actions";
import { ShowcaseClient } from "./ShowcaseClient";

export const dynamic = "force-dynamic";

export default async function ShowcasePage() {
    // 1. 활성 이벤트 조회
    const activeEvents = await getActiveEvents();

    // 2. 설정 조회
    const pageTitle = await getSetting("showcase_title");
    const pageDesc = await getSetting("showcase_desc");

    // Client Component Settings
    const clientSettings = {
        sidebarTitle: await getSetting("showcase_sidebar_title") || "CHOOSE STAGE",
        selectPackage: await getSetting("showcase_select_package_text") || "Select Package",
        playing: await getSetting("showcase_playing_text") || "PLAYING",
        noVideo: await getSetting("showcase_no_video_text") || "No Video",
        detailsPlaceholder: await getSetting("showcase_package_details_placeholder") || "Package details..."
    };

    // 3. 가장 최신 이벤트의 패키지 데이터 조회 (데모용)
    // 실제로는 사용자가 이벤트를 선택할 수 있게 하거나, 여러 이벤트를 나열할 수 있음
    let showcaseData = null;

    if (activeEvents.length > 0) {
        const latestEventId = activeEvents[0].id;
        const packages = await getPackagesWithShowcase(latestEventId);
        showcaseData = {
            event: activeEvents[0],
            packages
        };
    }

    return (
        <div className="min-h-screen bg-black">
            {/* 헤더 섹션 */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800/50 via-black to-black" />
                <div className="container relative mx-auto px-4 text-center">
                    {pageTitle && (
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase">
                            {pageTitle}
                        </h1>
                    )}
                    {pageDesc && (
                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto whitespace-pre-wrap">
                            {pageDesc}
                        </p>
                    )}
                </div>
            </section>

            {/* 쇼케이스 클라이언트 영역 */}
            <section className="container mx-auto px-4 pb-20">
                {showcaseData ? (
                    <ShowcaseClient
                        eventName={showcaseData.event.title}
                        packages={showcaseData.packages}
                        settings={clientSettings}
                    />
                ) : (
                    <div className="text-center py-20 border border-zinc-800 bg-zinc-900/50">
                        <p className="text-zinc-500">현재 진행 중인 쇼케이스가 없습니다.</p>
                    </div>
                )}
            </section>
        </div>
    );
}

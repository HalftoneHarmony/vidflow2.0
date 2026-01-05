/**
 * ✨ Showcase Page
 * 패키지 포트폴리오 갤러리 - Side-by-Side Player
 * 
 * @author Dealer (The Salesman)
 */

import { getActiveEvents, getPackagesWithShowcase } from "@/features/showcase/queries";
import { getSetting } from "@/features/settings/actions";
import { GalleryGrid } from "@/features/showcase/components";
import { ShowcaseHeader } from "./ShowcaseHeader";

export const dynamic = "force-dynamic";

export default async function ShowcasePage() {
    // 1. 활성 이벤트 조회
    const activeEvents = await getActiveEvents();

    // 2. 설정 조회
    const pageTitle = await getSetting("showcase_title");
    const pageDesc = await getSetting("showcase_desc");

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
            <ShowcaseHeader
                title={pageTitle || "SHOWCASE"}
                description={pageDesc}
            />

            {/* 갤러리 영역 */}
            <section className="container mx-auto px-4 pb-32">
                {showcaseData ? (
                    <GalleryGrid packages={showcaseData.packages} />
                ) : (
                    <div className="text-center py-32 border border-zinc-800 rounded-2xl bg-zinc-900/30 backdrop-blur-md">
                        <p className="text-zinc-500 text-xl font-mono animate-pulse">PREPARING SHOWCASE...</p>
                    </div>
                )}
            </section>
        </div>
    );
}

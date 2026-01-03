/**
 * ✨ Showcase Page
 * 패키지 포트폴리오 갤러리 - Side-by-Side Player
 * 
 * @author Dealer (The Salesman)
 */

import { getActiveEvents, getPackagesWithShowcase } from "@/features/showcase/queries";
import { ShowcaseClient } from "./ShowcaseClient";

export const dynamic = "force-dynamic";

export default async function ShowcasePage() {
    // 1. 활성 이벤트 조회
    const activeEvents = await getActiveEvents();

    // 2. 가장 최신 이벤트의 패키지 데이터 조회 (데모용)
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
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
                        SHOWCASE <span className="text-red-500">2.0</span>
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        당신의 무대를 가장 완벽하게 담아내는 VidFlow만의 퀄리티를 직접 확인하세요.
                        4K 초고화질과 다이나믹한 편집의 차이를 경험할 수 있습니다.
                    </p>
                </div>
            </section>

            {/* 쇼케이스 클라이언트 영역 */}
            <section className="container mx-auto px-4 pb-20">
                {showcaseData ? (
                    <ShowcaseClient
                        eventName={showcaseData.event.title}
                        packages={showcaseData.packages}
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

/**
 * 🎪 Events List Page
 * 대회 목록 페이지
 */


import { getActiveEvents } from "@/features/showcase/queries";
import { EventList } from "@/features/shop/components/EventList";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
    // 활성화된 이벤트 조회
    const events = await getActiveEvents();

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
                    대회 목록
                </h1>
                <p className="text-zinc-500">
                    현재 진행 중인 대회에서 당신의 순간을 담아보세요.
                </p>
            </div>

            {/* Client Component for Interactive List */}
            <EventList initialEvents={events} />
        </div>
    );
}

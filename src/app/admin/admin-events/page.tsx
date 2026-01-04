import { getAdminEvents } from "@/features/events/queries";
import { EventTable } from "@/features/events/components/EventTable";
import { EmptyState } from "@/components/ui/empty-state";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 📅 Admin Events Page
 * 이벤트 목록 및 공개 상태 관리
 */

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
    const events = await getAdminEvents();

    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter font-[family-name:var(--font-oswald)]">
                        EVENT <span className="text-red-600">MANAGEMENT</span>
                    </h1>
                    <p className="text-zinc-500 text-sm mt-1">
                        대회 일정 및 쇼케이스 공개 여부 관리
                    </p>
                </div>
                <Button className="bg-red-600 hover:bg-red-500 text-white rounded-none uppercase font-bold tracking-wider gap-2">
                    <Plus className="w-4 h-4" />
                    New Event
                </Button>
            </header>

            {/* Event Table */}
            {events.length > 0 ? (
                <EventTable events={events} />
            ) : (
                <EmptyState
                    icon={<Calendar className="w-8 h-8" />}
                    title="등록된 대회가 없습니다"
                    description="새로운 대회를 생성하여 쇼케이스를 시작하세요."
                />
            )}
        </div>
    );
}

/**
 * 🎪 Events List Page
 * 대회 목록 페이지
 */

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Event = {
    id: number;
    title: string;
    event_date: string;
    location: string | null;
    is_active: boolean;
    thumbnail_url: string | null;
};

export default async function EventsPage() {
    const supabase = await createClient();

    // 활성화된 이벤트 조회
    const { data: events, error } = await supabase
        .from("events")
        .select("id, title, event_date, location, is_active, thumbnail_url")
        .eq("is_active", true)
        .order("event_date", { ascending: false });

    if (error) {
        console.error("Events fetch error:", error);
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "short",
        });
    };

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

            {/* Events Grid */}
            {!events || events.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-zinc-800 bg-zinc-900/50">
                    <div className="text-6xl mb-4">🎪</div>
                    <h2 className="text-xl font-bold text-zinc-400 mb-2">
                        진행 중인 대회가 없습니다
                    </h2>
                    <p className="text-zinc-600">
                        곧 새로운 대회가 등록될 예정입니다.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event: Event) => (
                        <Link
                            key={event.id}
                            href={`/events/${event.id}`}
                            className="group block bg-zinc-900 border border-zinc-800 hover:border-red-600 transition-all duration-300 overflow-hidden"
                        >
                            {/* Thumbnail */}
                            <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                                {event.thumbnail_url ? (
                                    <img
                                        src={event.thumbnail_url}
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                                        <span className="text-5xl">🎬</span>
                                    </div>
                                )}

                                {/* Active Badge */}
                                <div className="absolute top-3 left-3">
                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-600 text-white text-xs font-bold uppercase">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                        LIVE
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-white group-hover:text-red-500 transition-colors mb-2">
                                    {event.title}
                                </h3>

                                <div className="space-y-1 text-sm text-zinc-500">
                                    <div className="flex items-center gap-2">
                                        <span>📅</span>
                                        <span>{formatDate(event.event_date)}</span>
                                    </div>
                                    {event.location && (
                                        <div className="flex items-center gap-2">
                                            <span>📍</span>
                                            <span>{event.location}</span>
                                        </div>
                                    )}
                                </div>

                                {/* CTA */}
                                <div className="mt-4 pt-4 border-t border-zinc-800">
                                    <span className="text-sm font-bold text-red-500 group-hover:text-red-400 transition-colors">
                                        패키지 보기 →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

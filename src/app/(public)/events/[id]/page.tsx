/**
 * 🎪 Event Detail Page
 * 대회 상세 및 패키지 선택 페이지
 *
 * @author Dealer (The Salesman)
 */

import { notFound } from "next/navigation";
import { getEvent, getPackagesWithShowcase } from "@/features/showcase/queries";
import { EventDetailClient } from "./EventDetailClient";

export default async function EventDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const eventId = parseInt(id, 10);

    if (isNaN(eventId)) {
        notFound();
    }

    // 서버에서 데이터 페칭
    const [event, packages] = await Promise.all([
        getEvent(eventId),
        getPackagesWithShowcase(eventId),
    ]);

    if (!event) {
        notFound();
    }

    // 날짜 포맷팅
    const formattedDate = new Date(event.event_date).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
    });

    return (
        <div className="min-h-screen bg-black">
            {/* 히어로 섹션 */}
            <section className="relative bg-gradient-to-b from-zinc-900 to-black">
                {/* 백그라운드 이미지 (있을 경우) */}
                {event.thumbnail_url && (
                    <div className="absolute inset-0 opacity-20">
                        <img
                            src={event.thumbnail_url}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black" />
                    </div>
                )}

                <div className="relative container mx-auto px-4 py-16 md:py-24">
                    {/* 이벤트 상태 배지 */}
                    <div className="mb-6">
                        {event.is_active ? (
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 text-sm font-bold uppercase tracking-wider">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                판매중
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-500 text-sm font-bold uppercase tracking-wider">
                                종료됨
                            </span>
                        )}
                    </div>

                    {/* 이벤트 제목 */}
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
                        {event.title}
                    </h1>

                    {/* 이벤트 정보 */}
                    <div className="flex flex-wrap gap-6 text-zinc-400">
                        {/* 날짜 */}
                        <div className="flex items-center gap-2">
                            <svg
                                className="w-5 h-5 text-red-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <span>{formattedDate}</span>
                        </div>

                        {/* 장소 */}
                        {event.location && (
                            <div className="flex items-center gap-2">
                                <svg
                                    className="w-5 h-5 text-red-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                <span>{event.location}</span>
                            </div>
                        )}

                        {/* 패키지 수 */}
                        <div className="flex items-center gap-2">
                            <svg
                                className="w-5 h-5 text-red-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>
                            <span>{packages.length}개 패키지</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 패키지 선택 섹션 */}
            <section className="container mx-auto px-4 py-12">
                {/* 섹션 헤더 */}
                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        패키지 선택
                    </h2>
                    <p className="text-zinc-500">
                        원하는 패키지를 선택하고 결제를 진행하세요
                    </p>
                </div>

                {/* 패키지가 없는 경우 */}
                {packages.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-zinc-800">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-bold text-zinc-400 mb-2">
                            등록된 패키지가 없습니다
                        </h3>
                        <p className="text-zinc-600">
                            곧 새로운 패키지가 등록될 예정입니다
                        </p>
                    </div>
                ) : (
                    /* 클라이언트 컴포넌트로 패키지 선택 UI 위임 */
                    <EventDetailClient
                        packages={packages}
                        eventId={eventId}
                        isActive={event.is_active}
                        disciplines={event.disciplines || []}
                    />
                )}
            </section>

            {/* 주문 안내 */}
            <section className="container mx-auto px-4 py-12 border-t border-zinc-900">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* 안내 1 */}
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                            <span className="text-2xl">🎬</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">영상 제작</h3>
                        <p className="text-sm text-zinc-500">
                            결제 확인 후 전문 에디터가
                            <br />
                            고품질 영상을 제작합니다
                        </p>
                    </div>

                    {/* 안내 2 */}
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                            <span className="text-2xl">📱</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">진행 상황 확인</h3>
                        <p className="text-sm text-zinc-500">
                            마이페이지에서 실시간으로
                            <br />
                            제작 현황을 확인하세요
                        </p>
                    </div>

                    {/* 안내 3 */}
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                            <span className="text-2xl">📥</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">안전한 다운로드</h3>
                        <p className="text-sm text-zinc-500">
                            완성된 영상은 마이페이지에서
                            <br />
                            안전하게 다운로드하세요
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

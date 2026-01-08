/**
 * 🎪 Event Detail Page
 * 대회 상세 및 패키지 선택 페이지
 *
 * @author Dealer (The Salesman)
 */

import { notFound } from "next/navigation";
import { getEvent, getPackagesWithShowcase } from "@/features/showcase/queries";
import { EventDetailClient } from "./EventDetailClient";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }) {
    const { locale, id } = await params;
    const t = await getTranslations({ locale, namespace: "EventDetail" });
    const event = await getEvent(Number(id));

    if (!event) return {};

    return {
        title: `${event.title} | VIDFLOW`,
        description: t("meta_description"),
    };
}

export default async function EventDetailPage({
    params,
}: {
    params: Promise<{ id: string; locale: string }>;
}) {
    const { id, locale } = await params;
    const eventId = parseInt(id, 10);
    const t = await getTranslations({ locale, namespace: "EventDetail" });

    if (isNaN(eventId)) {
        notFound();
    }

    // Server data fetching
    const [event, packages] = await Promise.all([
        getEvent(eventId),
        getPackagesWithShowcase(eventId),
    ]);

    if (!event) {
        notFound();
    }

    // Date formatting
    const formattedDate = new Date(event.event_date).toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
    });

    return (
        <div className="min-h-screen bg-black">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-b from-zinc-900 to-black">
                {/* Background Image */}
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
                    {/* Event Status Badge */}
                    <div className="mb-6">
                        {event.is_active ? (
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 text-sm font-bold uppercase tracking-wider">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                {t("status_active")}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-500 text-sm font-bold uppercase tracking-wider">
                                {t("status_ended")}
                            </span>
                        )}
                    </div>

                    {/* Event Title */}
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
                        {event.title}
                    </h1>

                    {/* Event Info */}
                    <div className="flex flex-wrap gap-6 text-zinc-400">
                        {/* Date */}
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formattedDate}</span>
                        </div>

                        {/* Location */}
                        {event.location && (
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{event.location}</span>
                            </div>
                        )}

                        {/* Package Count */}
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span>{t("packages_count", { count: packages.length })}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Package Selection */}
            <section className="container mx-auto px-4 py-12">
                {/* Section Header */}
                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        {t("section_packages_title")}
                    </h2>
                    <p className="text-zinc-500">
                        {t("section_packages_desc")}
                    </p>
                </div>

                {/* Empty State */}
                {packages.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-zinc-800">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-bold text-zinc-400 mb-2">
                            {t("empty_title")}
                        </h3>
                        <p className="text-zinc-600">
                            {t("empty_desc")}
                        </p>
                    </div>
                ) : (
                    /* Client Component */
                    <EventDetailClient
                        packages={packages}
                        eventId={eventId}
                        isActive={event.is_active}
                        disciplines={event.disciplines || []}
                    />
                )}
            </section>

            {/* Guides Section */}
            <section className="container mx-auto px-4 py-12 border-t border-zinc-900">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Guide 1 */}
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                            <span className="text-2xl">🎬</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{t("guide_1_title")}</h3>
                        <p className="text-sm text-zinc-500" dangerouslySetInnerHTML={{ __html: t("guide_1_desc") }} />
                    </div>

                    {/* Guide 2 */}
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                            <span className="text-2xl">📱</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{t("guide_2_title")}</h3>
                        <p className="text-sm text-zinc-500" dangerouslySetInnerHTML={{ __html: t("guide_2_desc") }} />
                    </div>

                    {/* Guide 3 */}
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                            <span className="text-2xl">📥</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{t("guide_3_title")}</h3>
                        <p className="text-sm text-zinc-500" dangerouslySetInnerHTML={{ __html: t("guide_3_desc") }} />
                    </div>
                </div>
            </section>
        </div>
    );
}

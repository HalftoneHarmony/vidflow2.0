"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, MapPin, Film } from "lucide-react";
import { Event } from "@/features/showcase/queries";

type EventListProps = {
    initialEvents: Event[];
};

export function EventList({ initialEvents }: EventListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"ALL" | "LIVE" | "ENDED">("ALL");

    const filteredEvents = initialEvents.filter((event) => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus =
            filterStatus === "ALL" ? true :
                filterStatus === "LIVE" ? event.is_active :
                    !event.is_active;

        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "short",
        });
    };

    return (
        <div>
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-zinc-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="대회명 또는 장소 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    {(["ALL", "LIVE", "ENDED"] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${filterStatus === status
                                    ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                                    : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                }`}
                        >
                            {status === "ALL" ? "전체" : status === "LIVE" ? "진행중" : "종료됨"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Event Grid */}
            <div className="min-h-[400px]">
                {filteredEvents.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 border border-dashed border-zinc-800 bg-zinc-900/50 rounded-lg"
                    >
                        <div className="text-6xl mb-4">🎪</div>
                        <h2 className="text-xl font-bold text-zinc-400 mb-2">
                            검색 결과가 없습니다
                        </h2>
                        <p className="text-zinc-600">
                            다른 키워드로 검색해보세요.
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        <AnimatePresence>
                            {filteredEvents.map((event) => (
                                <motion.div
                                    layout
                                    key={event.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Link
                                        href={`/events/${event.id}`}
                                        className={`group block h-full bg-zinc-900 border transition-all duration-300 overflow-hidden rounded-lg relative ${event.is_active
                                                ? "border-zinc-800 hover:border-red-600 hover:shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                                                : "border-zinc-800/50 hover:border-zinc-700 opacity-70 hover:opacity-100 grayscale hover:grayscale-0"
                                            }`}
                                    >
                                        {/* Thumbnail */}
                                        <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                                            {event.thumbnail_url ? (
                                                <img
                                                    src={event.thumbnail_url}
                                                    alt={event.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                                                    <Film className="w-12 h-12 text-zinc-700" />
                                                </div>
                                            )}

                                            {/* Status Badge */}
                                            <div className="absolute top-3 left-3 z-10">
                                                {event.is_active ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white text-xs font-black uppercase tracking-wider rounded-sm shadow-lg">
                                                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                                        LIVE
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 bg-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-wider rounded-sm">
                                                        ENDED
                                                    </span>
                                                )}
                                            </div>

                                            {/* Overlay Gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80" />
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 relative">
                                            <h3 className="text-lg font-bold text-white group-hover:text-red-500 transition-colors mb-3 line-clamp-1">
                                                {event.title}
                                            </h3>

                                            <div className="space-y-2 text-sm text-zinc-400">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-colors" />
                                                    <span>{formatDate(event.event_date)}</span>
                                                </div>
                                                {event.location && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-colors" />
                                                        <span>{event.location}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* CTA */}
                                            <div className="mt-5 pt-4 border-t border-zinc-800 flex justify-between items-center text-sm">
                                                <span className={`font-bold transition-colors ${event.is_active ? "text-red-500 group-hover:text-red-400" : "text-zinc-600"
                                                    }`}>
                                                    {event.is_active ? "패키지 보기" : "판매 종료"}
                                                </span>
                                                <span className="transform group-hover:translate-x-1 transition-transform duration-300 text-zinc-500 group-hover:text-white">
                                                    →
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

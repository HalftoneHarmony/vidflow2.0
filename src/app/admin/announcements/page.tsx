

import { Metadata } from "next";
import { Megaphone, Plus, Pin, Clock, AlertTriangle, Info, PartyPopper, Wrench } from "lucide-react";

export const metadata: Metadata = {
    title: "Announcements | VidFlow Admin",
    description: "공지사항 관리",
};

/**
 * 📢 Announcements Page
 * 공지사항 관리 페이지
 * 
 * 사용 가능한 함수:
 * - getActiveAnnouncements() - 활성 공지사항 조회
 * - createAnnouncement(data) - 공지사항 생성
 * 
 * @author Agent 4 (Backend/Integration Master)
 * @todo Agent 2 (Admin UI Master)가 상세 UI 구현 예정
 */

const typeIcons: Record<string, typeof Info> = {
    info: Info,
    warning: AlertTriangle,
    promotion: PartyPopper,
    maintenance: Wrench,
    urgent: AlertTriangle,
};

const typeColors: Record<string, string> = {
    info: "bg-blue-600",
    warning: "bg-amber-600",
    promotion: "bg-green-600",
    maintenance: "bg-orange-600",
    urgent: "bg-red-600",
};

export default async function AnnouncementsPage() {
    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-500 flex items-center justify-center">
                        <Megaphone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-oswald)] uppercase">
                            Announcements
                        </h1>
                        <p className="text-sm text-zinc-400">
                            공지사항 관리
                        </p>
                    </div>
                </div>

                {/* Add Button */}
                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold uppercase tracking-wider transition-colors">
                    <Plus className="w-4 h-4" />
                    새 공지
                </button>
            </div>

            {/* Announcement Type Legend */}
            <div className="flex flex-wrap gap-3">
                {Object.entries(typeColors).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-2 text-xs text-zinc-400">
                        <div className={`w-3 h-3 ${color}`} />
                        <span className="uppercase">{type}</span>
                    </div>
                ))}
            </div>

            {/* Announcements List Placeholder */}
            <div className="space-y-4">
                {[
                    { title: "시스템 점검 안내", type: "maintenance", is_pinned: true, created_at: "2025-01-04" },
                    { title: "신년 프로모션", type: "promotion", is_pinned: false, created_at: "2025-01-03" },
                    { title: "서비스 이용약관 변경", type: "info", is_pinned: false, created_at: "2025-01-02" },
                ].map((announcement, i) => {
                    const IconComponent = typeIcons[announcement.type] || Info;
                    const bgColor = typeColors[announcement.type] || "bg-zinc-600";

                    return (
                        <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-4 hover:border-zinc-700 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 ${bgColor} flex items-center justify-center flex-shrink-0`}>
                                    <IconComponent className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {announcement.is_pinned && (
                                            <Pin className="w-3 h-3 text-amber-500" />
                                        )}
                                        <h3 className="text-lg font-bold text-white">{announcement.title}</h3>
                                        <span className={`text-xs px-2 py-0.5 uppercase ${bgColor}`}>
                                            {announcement.type}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {announcement.created_at}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1 text-xs text-zinc-400 border border-zinc-700 hover:border-zinc-500 transition-colors">
                                        편집
                                    </button>
                                    <button className="px-3 py-1 text-xs text-red-400 border border-red-900/50 hover:border-red-700 transition-colors">
                                        삭제
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Info Message */}
            <div className="text-center text-zinc-500 text-sm py-4">
                <p>Agent 2가 상세 UI 구현 예정</p>
                <p className="text-xs text-zinc-600 mt-1">
                    새 공지 생성 폼, 만료일 설정, 고정 토글 포함
                </p>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { AlertTriangle, Bell } from "lucide-react";
import { AnnouncementModal, type Announcement } from "@/components/ui/announcement-modal";

interface DashboardAnnouncementBannerProps {
    announcements: Announcement[];
}

export function DashboardAnnouncementBanner({ announcements }: DashboardAnnouncementBannerProps) {
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (announcements.length === 0) return null;

    const urgent = announcements.find(a => a.type === "urgent" || a.type === "warning");
    const announcement = urgent || announcements[0];

    const typeStyles: Record<string, string> = {
        urgent: "bg-red-600/20 border-red-600/50 text-red-400 hover:bg-red-600/30",
        warning: "bg-amber-600/20 border-amber-600/50 text-amber-400 hover:bg-amber-600/30",
        info: "bg-blue-600/20 border-blue-600/50 text-blue-400 hover:bg-blue-600/30",
        promotion: "bg-emerald-600/20 border-emerald-600/50 text-emerald-400 hover:bg-emerald-600/30",
        maintenance: "bg-zinc-600/20 border-zinc-600/50 text-zinc-400 hover:bg-zinc-600/30",
    };

    const handleBannerClick = () => {
        setSelectedAnnouncement(announcement);
        setIsModalOpen(true);
    };

    return (
        <>
            <div
                onClick={handleBannerClick}
                className={`p-4 border rounded-sm flex items-center gap-3 cursor-pointer transition-colors ${typeStyles[announcement.type] || typeStyles.info}`}
            >
                {announcement.type === "urgent" || announcement.type === "warning" ? (
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                ) : (
                    <Bell className="w-5 h-5 flex-shrink-0" />
                )}
                <div className="flex-1">
                    <span className="font-bold text-sm">{announcement.title}</span>
                    <span className="text-sm opacity-80 ml-2 line-clamp-1">{announcement.content}</span>
                </div>
            </div>

            <AnnouncementModal
                announcement={selectedAnnouncement}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </>
    );
}

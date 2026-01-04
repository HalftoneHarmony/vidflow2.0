import { Metadata } from "next";
import { AnnouncementsClient } from "./AnnouncementsClient";

export const metadata: Metadata = {
    title: "Announcements | VidFlow Admin",
    description: "공지사항 관리",
};

/**
 * 📢 Announcements Page
 * 공지사항 관리 페이지
 * 
 * @author Agent 2 (Admin UI Master)
 */
export default function AnnouncementsPage() {
    return <AnnouncementsClient />;
}

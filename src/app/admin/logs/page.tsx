import { Metadata } from "next";
import { LogsClient } from "./LogsClient";

export const metadata: Metadata = {
    title: "Activity Logs | VidFlow Admin",
    description: "시스템 활동 로그 뷰어",
};

/**
 * 📜 Activity Logs Page
 * 시스템 활동 로그 뷰어
 * 
 * @author Agent 2 (Admin UI Master)
 */
export default function LogsPage() {
    return <LogsClient />;
}

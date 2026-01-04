

import { Metadata } from "next";
import { ScrollText, Filter, Calendar } from "lucide-react";

export const metadata: Metadata = {
    title: "Activity Logs | VidFlow Admin",
    description: "시스템 활동 로그 뷰어",
};

/**
 * 📜 Activity Logs Page
 * 시스템 활동 로그 뷰어
 * 
 * 사용 가능한 함수:
 * - getRecentActivityLogs(limit) - 최근 활동 로그 조회
 * - logActivity(action, entityType?, entityId?, oldValue?, newValue?) - 로그 기록
 * 
 * @author Agent 4 (Backend/Integration Master)
 * @todo Agent 2 (Admin UI Master)가 상세 UI 구현 예정
 */
export default async function LogsPage() {
    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-500 flex items-center justify-center">
                        <ScrollText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-oswald)] uppercase">
                            Activity Logs
                        </h1>
                        <p className="text-sm text-zinc-400">
                            시스템 활동 로그 뷰어
                        </p>
                    </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 border border-zinc-800 hover:border-zinc-600 transition-colors">
                        <Filter className="w-4 h-4" />
                        필터
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 border border-zinc-800 hover:border-zinc-600 transition-colors">
                        <Calendar className="w-4 h-4" />
                        날짜 선택
                    </button>
                </div>
            </div>

            {/* Timeline Placeholder */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6">
                <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-zinc-800" />

                    {/* Timeline Items */}
                    <div className="space-y-6">
                        {[
                            { action: "ORDER_CREATED", entity: "Order #1234", time: "2분 전" },
                            { action: "STATUS_CHANGED", entity: "Pipeline Task", time: "15분 전" },
                            { action: "USER_LOGIN", entity: "admin@vidflow.com", time: "1시간 전" },
                            { action: "EVENT_UPDATED", entity: "대회 #5", time: "3시간 전" },
                            { action: "EXPENSE_ADDED", entity: "지출 항목", time: "5시간 전" },
                        ].map((log, i) => (
                            <div key={i} className="relative pl-10">
                                {/* Timeline Dot */}
                                <div className="absolute left-2 w-4 h-4 rounded-full bg-zinc-700 border-2 border-zinc-600" />

                                {/* Log Content */}
                                <div className="bg-zinc-800/30 border border-zinc-800/50 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-mono text-red-400 bg-red-950/30 px-2 py-1">
                                            {log.action}
                                        </span>
                                        <span className="text-xs text-zinc-500">{log.time}</span>
                                    </div>
                                    <p className="text-sm text-zinc-300">{log.entity}</p>
                                    <p className="text-xs text-zinc-500 mt-1">by System</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Load More */}
                <div className="text-center mt-8">
                    <button className="px-6 py-2 text-sm text-zinc-400 border border-zinc-800 hover:border-zinc-600 transition-colors">
                        더보기
                    </button>
                </div>
            </div>

            {/* Info Message */}
            <div className="text-center text-zinc-500 text-sm py-4">
                <p>Agent 2가 상세 UI 구현 예정</p>
                <p className="text-xs text-zinc-600 mt-1">
                    실시간 데이터, 필터링, 사용자별 뷰 포함
                </p>
            </div>
        </div>
    );
}

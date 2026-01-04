

import { Metadata } from "next";
import { MessageSquare } from "lucide-react";

export const metadata: Metadata = {
    title: "Contacts | VidFlow Admin",
    description: "고객 문의 관리",
};

/**
 * 💬 Contacts Page
 * 고객 문의 관리 페이지
 * 
 * 사용 가능한 함수:
 * - getContactSubmissions(status?) - 문의 목록 조회
 * - updateContactStatus(id, status, adminNotes?) - 상태 업데이트
 * 
 * @author Agent 4 (Backend/Integration Master)
 * @todo Agent 2 (Admin UI Master)가 상세 UI 구현 예정
 */
export default async function ContactsPage() {
    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-oswald)] uppercase">
                        Contacts
                    </h1>
                    <p className="text-sm text-zinc-400">
                        고객 문의 관리
                    </p>
                </div>
            </div>

            {/* Status Filter Tabs Placeholder */}
            <div className="flex gap-2 border-b border-zinc-800 pb-4">
                {["전체", "대기중", "처리중", "해결됨", "종료"].map((status) => (
                    <button
                        key={status}
                        className="px-4 py-2 text-sm text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 transition-colors"
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Table Placeholder */}
            <div className="bg-zinc-900/50 border border-zinc-800 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-zinc-800/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">이름</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">이메일</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">카테고리</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">상태</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">접수일</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">액션</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                                <td className="px-4 py-3"><div className="h-4 w-20 bg-zinc-700 animate-pulse" /></td>
                                <td className="px-4 py-3"><div className="h-4 w-32 bg-zinc-700 animate-pulse" /></td>
                                <td className="px-4 py-3"><div className="h-4 w-16 bg-zinc-700 animate-pulse" /></td>
                                <td className="px-4 py-3"><div className="h-6 w-16 bg-zinc-700 animate-pulse rounded-full" /></td>
                                <td className="px-4 py-3"><div className="h-4 w-24 bg-zinc-700 animate-pulse" /></td>
                                <td className="px-4 py-3"><div className="h-8 w-8 bg-zinc-700 animate-pulse" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Info Message */}
            <div className="text-center text-zinc-500 text-sm py-8">
                <p>Agent 2가 상세 UI 구현 예정</p>
                <p className="text-xs text-zinc-600 mt-1">
                    상태 변경, 관리자 메모, 상세 보기 모달 포함
                </p>
            </div>
        </div>
    );
}

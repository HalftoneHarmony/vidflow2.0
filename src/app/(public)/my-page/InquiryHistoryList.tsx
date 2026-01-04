"use client";

import { MessageSquare, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface Inquiry {
    id: number;
    subject: string | null;
    message: string;
    category: string;
    status: string;
    created_at: string;
    responded_at?: string;
    admin_notes?: string;
}

interface InquiryHistoryListProps {
    inquiries: Inquiry[];
}

export function InquiryHistoryList({ inquiries }: InquiryHistoryListProps) {
    if (!inquiries || inquiries.length === 0) {
        return (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-12 text-center">
                <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">문의 내역이 없습니다</h3>
                <p className="text-zinc-500 text-sm">궁금한 점이 있으시다면 언제든 문의해주세요.</p>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "resolved":
            case "closed":
                return (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">
                        <CheckCircle2 className="w-3 h-3" />
                        답변 완료
                    </span>
                );
            case "in_progress":
                return (
                    <span className="flex items-center gap-1 text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded">
                        <Clock className="w-3 h-3" />
                        처리중
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1 text-xs font-bold text-zinc-500 bg-zinc-500/10 px-2 py-1 rounded">
                        <Clock className="w-3 h-3" />
                        접수됨
                    </span>
                );
        }
    };

    const getCategoryLabel = (category: string) => {
        const map: Record<string, string> = {
            general: "일반 문의",
            support: "기술 지원",
            partnership: "제휴 문의",
            complaint: "불편 신고",
            feedback: "피드백"
        };
        return map[category] || category;
    };

    return (
        <div className="space-y-4">
            {inquiries.map((inquiry) => (
                <div
                    key={inquiry.id}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 hover:border-zinc-700 transition-colors"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            {getStatusBadge(inquiry.status)}
                            <span className="text-xs text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded-full">
                                {getCategoryLabel(inquiry.category)}
                            </span>
                        </div>
                        <span className="text-xs text-zinc-600">
                            {new Date(inquiry.created_at).toLocaleDateString()}
                        </span>
                    </div>

                    <h4 className="text-white font-bold mb-2">
                        {inquiry.subject || "제목 없음"}
                    </h4>

                    <p className="text-zinc-400 text-sm line-clamp-2 mb-4">
                        {inquiry.message}
                    </p>

                    {inquiry.admin_notes && (inquiry.status === "resolved" || inquiry.status === "closed") && (
                        <div className="bg-zinc-950/50 border border-zinc-800/50 rounded p-3 mt-4">
                            <div className="flex items-center gap-2 mb-1">
                                <MessageSquare className="w-3 h-3 text-red-500" />
                                <span className="text-xs font-bold text-red-500">답변 내용</span>
                            </div>
                            <p className="text-zinc-300 text-sm pl-5">
                                {inquiry.admin_notes}
                            </p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

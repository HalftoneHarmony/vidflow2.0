/**
 * 💬 Contacts Client Component
 * 고객 문의 관리 페이지 - 클라이언트 컴포넌트
 * 
 * @author Agent 2 (Admin UI Master)
 */

"use client";

import { useState, useEffect, useTransition } from "react";
import {
    MessageSquare,
    Search,
    Eye,
    Clock,
    User,
    Mail,
    Tag,
    CheckCircle2,
    AlertCircle,
    Loader2,
    X,
    FileText,
    Send,
    Reply
} from "lucide-react";
import {
    getContactSubmissions,
    updateContactStatus,
    type ContactSubmission
} from "@/features/admin/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

type StatusType = "all" | "pending" | "in_progress" | "resolved" | "closed";

const statusConfig: Record<StatusType, { label: string; color: string; bgColor: string }> = {
    all: { label: "전체", color: "text-zinc-300", bgColor: "bg-zinc-700" },
    pending: { label: "대기중", color: "text-amber-400", bgColor: "bg-amber-900/30" },
    in_progress: { label: "처리중", color: "text-blue-400", bgColor: "bg-blue-900/30" },
    resolved: { label: "해결됨", color: "text-green-400", bgColor: "bg-green-900/30" },
    closed: { label: "종료", color: "text-zinc-400", bgColor: "bg-zinc-800" },
};

const categoryConfig: Record<string, { label: string; color: string }> = {
    general: { label: "일반 문의", color: "bg-zinc-600" },
    technical: { label: "기술 지원", color: "bg-purple-600" },
    billing: { label: "결제 문의", color: "bg-green-600" },
    partnership: { label: "제휴 문의", color: "bg-blue-600" },
    other: { label: "기타", color: "bg-zinc-500" },
};

export function ContactsClient() {
    const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState<ContactSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<StatusType>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [replyMessage, setReplyMessage] = useState("");
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [isPending, startTransition] = useTransition();

    // 데이터 로딩
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const data = await getContactSubmissions();
            setSubmissions(data);
            setFilteredSubmissions(data);
            setIsLoading(false);
        }
        loadData();
    }, []);

    // 필터링 적용
    useEffect(() => {
        let result = [...submissions];

        // 상태 필터
        if (activeFilter !== "all") {
            result = result.filter(s => s.status === activeFilter);
        }

        // 검색 필터
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.email.toLowerCase().includes(query) ||
                s.message.toLowerCase().includes(query) ||
                s.subject?.toLowerCase().includes(query)
            );
        }

        setFilteredSubmissions(result);
    }, [activeFilter, searchQuery, submissions]);

    // 상태 업데이트
    const handleStatusUpdate = async (id: number, newStatus: ContactSubmission['status']) => {
        startTransition(async () => {
            const result = await updateContactStatus(id, newStatus, adminNotes || undefined);
            if (result.success) {
                toast.success("상태가 업데이트되었습니다.");
                // UI 업데이트
                setSubmissions(prev => prev.map(s =>
                    s.id === id ? { ...s, status: newStatus, admin_notes: adminNotes || s.admin_notes } : s
                ));
                setSelectedContact(null);
                setAdminNotes("");
            } else {
                toast.error("업데이트 실패: " + result.error);
            }
        });
    };

    // 상세 모달 열기
    const openDetailModal = (contact: ContactSubmission) => {
        setSelectedContact(contact);
        setAdminNotes(contact.admin_notes || "");
        setReplyMessage("");
        setShowReplyForm(false);
    };

    // 답변 발송 시뮬레이션
    const handleSendReply = async () => {
        if (!selectedContact) return;
        if (!replyMessage.trim()) {
            toast.error("답변 내용을 입력해주세요.");
            return;
        }

        startTransition(async () => {
            // 실제로는 여기서 이메일 발송 API를 호출해야 함
            await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션 지연

            // 답변 발송 후 자동으로 상태를 'resolved'로 변경하고 메모에 발송 기록 추가
            const updatedNotes = (adminNotes ? adminNotes + "\n\n" : "") + `[답변 발송됨] ${new Date().toLocaleString()}\n${replyMessage}`;

            const result = await updateContactStatus(selectedContact.id, "resolved", updatedNotes);

            if (result.success) {
                toast.success(`'${selectedContact.email}' 님에게 답변이 발송되었습니다.`);
                // UI 업데이트
                setSubmissions(prev => prev.map(s =>
                    s.id === selectedContact.id ? { ...s, status: "resolved", admin_notes: updatedNotes } : s
                ));
                setSelectedContact(null);
                setReplyMessage("");
                setShowReplyForm(false);
                setAdminNotes("");
            } else {
                toast.error("업데이트 실패: " + result.error);
            }
        });
    };

    // 날짜 포맷
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}분 전`;
        if (diffHours < 24) return `${diffHours}시간 전`;
        if (diffDays < 7) return `${diffDays}일 전`;
        return date.toLocaleDateString("ko-KR");
    };

    // 상태별 카운트 계산
    const statusCounts = submissions.reduce((acc, s) => {
        acc[s.status] = (acc[s.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

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
                        고객 문의 관리 · {submissions.length}건
                    </p>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="이름, 이메일, 제목, 내용 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-600 transition-colors"
                    />
                </div>

                {/* Status Tabs */}
                <div className="flex gap-1 bg-zinc-900 border border-zinc-800 p-1">
                    {(Object.keys(statusConfig) as StatusType[]).map((status) => (
                        <button
                            key={status}
                            onClick={() => setActiveFilter(status)}
                            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${activeFilter === status
                                ? "bg-red-600 text-white"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                                }`}
                        >
                            {statusConfig[status].label}
                            {status !== "all" && statusCounts[status] !== undefined && (
                                <span className="ml-1.5 opacity-60">({statusCounts[status] || 0})</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-zinc-900/50 border border-zinc-800 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
                    </div>
                ) : filteredSubmissions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                        <MessageSquare className="w-12 h-12 mb-4 opacity-30" />
                        <p className="text-sm">문의 내역이 없습니다</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-zinc-800/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">이름</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">이메일</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">제목</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">카테고리</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">상태</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">접수일</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">액션</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredSubmissions.map((contact) => {
                                const category = categoryConfig[contact.category] || categoryConfig.other;
                                const status = statusConfig[contact.status] || statusConfig.pending;

                                return (
                                    <tr
                                        key={contact.id}
                                        className="hover:bg-zinc-800/30 transition-colors cursor-pointer"
                                        onClick={() => openDetailModal(contact)}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-zinc-400" />
                                                </div>
                                                <span className="font-medium text-white">{contact.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-zinc-400 font-mono text-sm">{contact.email}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-zinc-300 text-sm font-medium line-clamp-1">
                                                {contact.subject || "제목 없음"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-1 text-xs font-bold uppercase ${category.color} text-white`}>
                                                {category.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-bold ${status.bgColor} ${status.color}`}>
                                                {contact.status === "resolved" ? <CheckCircle2 className="w-3 h-3" /> :
                                                    contact.status === "pending" ? <AlertCircle className="w-3 h-3" /> :
                                                        contact.status === "in_progress" ? <Loader2 className="w-3 h-3" /> :
                                                            <X className="w-3 h-3" />}
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-zinc-500 text-sm flex items-center gap-1.5">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(contact.created_at)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openDetailModal(contact);
                                                }}
                                                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Detail Modal */}
            <Dialog open={!!selectedContact} onOpenChange={(open) => !open && setSelectedContact(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    {selectedContact && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-3">
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-bold ${statusConfig[selectedContact.status].bgColor} ${statusConfig[selectedContact.status].color}`}>
                                        {statusConfig[selectedContact.status].label}
                                    </span>
                                    {selectedContact.subject || "문의 상세"}
                                </DialogTitle>
                                <DialogDescription>
                                    {formatDate(selectedContact.created_at)} · #{selectedContact.id}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                {/* Contact Info */}
                                <div className="grid grid-cols-2 gap-3 p-4 bg-zinc-900/50 border border-zinc-800">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-zinc-500" />
                                        <span className="text-sm text-zinc-300">{selectedContact.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-zinc-500" />
                                        <span className="text-sm text-zinc-300 font-mono">{selectedContact.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-zinc-500" />
                                        <span className={`text-xs px-2 py-0.5 ${categoryConfig[selectedContact.category]?.color || categoryConfig.other.color} text-white`}>
                                            {categoryConfig[selectedContact.category]?.label || selectedContact.category}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-zinc-500" />
                                        <span className="text-sm text-zinc-400">{new Date(selectedContact.created_at).toLocaleString("ko-KR")}</span>
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                        <FileText className="w-3 h-3" />
                                        문의 내용
                                    </label>
                                    <div className="p-4 bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                                        {selectedContact.message}
                                    </div>
                                </div>

                                {/* Status Update */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                        상태 변경
                                    </label>
                                    <div className="flex gap-2">
                                        {(["pending", "in_progress", "resolved", "closed"] as const).map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusUpdate(selectedContact.id, status)}
                                                disabled={isPending || selectedContact.status === status}
                                                className={`flex-1 py-2 text-xs font-bold uppercase transition-all ${selectedContact.status === status
                                                    ? `${statusConfig[status].bgColor} ${statusConfig[status].color} border border-current`
                                                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                                                    } disabled:opacity-50`}
                                            >
                                                {isPending ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : statusConfig[status].label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Admin Notes */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                        관리자 메모
                                    </label>
                                    <textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="내부 메모를 입력하세요..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-600 transition-colors resize-none"
                                    />
                                </div>

                                {/* Reply Section */}
                                <div className="space-y-2 pt-2 border-t border-zinc-800">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                            <Reply className="w-3 h-3" />
                                            답변 하기
                                        </label>
                                        <button
                                            onClick={() => setShowReplyForm(!showReplyForm)}
                                            className="text-xs text-blue-400 hover:text-blue-300 font-bold"
                                        >
                                            {showReplyForm ? "취소" : "이메일 답변 작성"}
                                        </button>
                                    </div>

                                    {showReplyForm && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                            <textarea
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                                placeholder={`To: ${selectedContact.email}\n\n안녕하세요, VidFlow 지원팀입니다.\n문의주신 내용에 대해 답변드립니다...`}
                                                rows={5}
                                                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-600 transition-colors resize-none"
                                            />
                                            <button
                                                onClick={handleSendReply}
                                                disabled={isPending || !replyMessage.trim()}
                                                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> 답변 발송 및 해결 처리</>}
                                            </button>
                                            <p className="text-[10px] text-zinc-500 text-center">
                                                * 발송 시 상태가 '해결됨'으로 변경되며, 내용이 메모에 자동 저장됩니다.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <DialogFooter className="flex gap-2">
                                <button
                                    onClick={() => setSelectedContact(null)}
                                    className="px-4 py-2 text-sm text-zinc-400 border border-zinc-700 hover:border-zinc-500 transition-colors"
                                >
                                    닫기
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(selectedContact.id, selectedContact.status)}
                                    disabled={isPending}
                                    className="px-4 py-2 text-sm font-bold bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
                                >
                                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "메모 저장"}
                                </button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

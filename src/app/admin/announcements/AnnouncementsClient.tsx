"use client";

import { useState, useEffect, useTransition } from "react";
import { Megaphone, Plus, Pin, Clock, AlertTriangle, Info, PartyPopper, Wrench, X, Loader2, Calendar } from "lucide-react";
import { getActiveAnnouncements, createAnnouncement, type Announcement } from "@/features/admin/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

type AnnouncementType = "info" | "warning" | "promotion" | "maintenance" | "urgent";

const typeConfig: Record<AnnouncementType, { icon: typeof Info; color: string; bgColor: string; label: string }> = {
    info: { icon: Info, color: "text-blue-400", bgColor: "bg-blue-600", label: "정보" },
    warning: { icon: AlertTriangle, color: "text-amber-400", bgColor: "bg-amber-600", label: "경고" },
    promotion: { icon: PartyPopper, color: "text-green-400", bgColor: "bg-green-600", label: "프로모션" },
    maintenance: { icon: Wrench, color: "text-orange-400", bgColor: "bg-orange-600", label: "점검" },
    urgent: { icon: AlertTriangle, color: "text-red-400", bgColor: "bg-red-600", label: "긴급" },
};

export function AnnouncementsClient() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isPending, startTransition] = useTransition();

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        type: "info" as AnnouncementType,
        is_pinned: false,
        expires_at: "",
    });

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const data = await getActiveAnnouncements();
            setAnnouncements(data);
            setIsLoading(false);
        }
        loadData();
    }, []);

    const handleCreate = () => {
        if (!formData.title.trim() || !formData.content.trim()) {
            toast.error("제목과 내용을 입력해주세요");
            return;
        }
        startTransition(async () => {
            const result = await createAnnouncement({
                title: formData.title,
                content: formData.content,
                type: formData.type,
                is_pinned: formData.is_pinned,
                expires_at: formData.expires_at || null,
            });
            if (result.success) {
                toast.success("공지사항이 생성되었습니다");
                setShowCreateModal(false);
                setFormData({ title: "", content: "", type: "info", is_pinned: false, expires_at: "" });
                const data = await getActiveAnnouncements();
                setAnnouncements(data);
            } else {
                toast.error("생성 실패: " + result.error);
            }
        });
    };

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" });

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-500 flex items-center justify-center">
                        <Megaphone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-oswald)] uppercase">Announcements</h1>
                        <p className="text-sm text-zinc-400">공지사항 관리 · {announcements.length}건</p>
                    </div>
                </div>
                <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold uppercase tracking-wider transition-colors">
                    <Plus className="w-4 h-4" />새 공지
                </button>
            </div>

            <div className="flex flex-wrap gap-3">
                {(Object.entries(typeConfig) as [AnnouncementType, typeof typeConfig.info][]).map(([type, config]) => (
                    <div key={type} className="flex items-center gap-2 text-xs text-zinc-400">
                        <div className={`w-3 h-3 ${config.bgColor}`} />
                        <span className="uppercase">{config.label}</span>
                    </div>
                ))}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-zinc-500 animate-spin" /></div>
            ) : announcements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500 border border-dashed border-zinc-800">
                    <Megaphone className="w-12 h-12 mb-4 opacity-30" />
                    <p className="text-sm">공지사항이 없습니다</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.map((ann) => {
                        const config = typeConfig[ann.type] || typeConfig.info;
                        const IconComponent = config.icon;
                        return (
                            <div key={ann.id} className="bg-zinc-900/50 border border-zinc-800 p-4 hover:border-zinc-700 transition-colors group">
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                                        <IconComponent className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            {ann.is_pinned && <Pin className="w-3 h-3 text-amber-500" />}
                                            <h3 className="text-lg font-bold text-white">{ann.title}</h3>
                                            <span className={`text-xs px-2 py-0.5 uppercase ${config.bgColor}`}>{config.label}</span>
                                        </div>
                                        <p className="text-sm text-zinc-400 mb-2 line-clamp-2">{ann.content}</p>
                                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(ann.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>새 공지사항</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">제목</label>
                            <input type="text" value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="공지 제목을 입력하세요" className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-600" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">내용</label>
                            <textarea value={formData.content} onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))} placeholder="공지 내용을 입력하세요" rows={4} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-600 resize-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">타입</label>
                                <select value={formData.type} onChange={(e) => setFormData(p => ({ ...p, type: e.target.value as AnnouncementType }))} className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-red-600">
                                    {(Object.entries(typeConfig) as [AnnouncementType, typeof typeConfig.info][]).map(([type, config]) => (
                                        <option key={type} value={type}>{config.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2"><Calendar className="w-3 h-3" />만료일</label>
                                <input type="date" value={formData.expires_at} onChange={(e) => setFormData(p => ({ ...p, expires_at: e.target.value }))} className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-red-600" />
                            </div>
                        </div>
                        <label className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800 cursor-pointer hover:border-zinc-700">
                            <input type="checkbox" checked={formData.is_pinned} onChange={(e) => setFormData(p => ({ ...p, is_pinned: e.target.checked }))} className="w-4 h-4 accent-red-600" />
                            <div>
                                <span className="text-sm text-white font-medium flex items-center gap-2"><Pin className="w-3 h-3 text-amber-500" />상단 고정</span>
                                <span className="text-xs text-zinc-500">목록 상단에 고정 표시됩니다</span>
                            </div>
                        </label>
                    </div>
                    <DialogFooter>
                        <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-zinc-400 border border-zinc-700 hover:border-zinc-500 transition-colors">취소</button>
                        <button onClick={handleCreate} disabled={isPending} className="px-4 py-2 text-sm font-bold bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50 flex items-center gap-2">
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}생성
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

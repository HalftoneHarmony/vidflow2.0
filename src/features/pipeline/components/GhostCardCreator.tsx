"use client";

import { useState } from "react";
import { Plus, Ghost, Loader2, UserPlus, User } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter
} from "@/components/ui/sheet";
import { createGhostCard, createGhostCardWithNewUser } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface GhostCardCreatorProps {
    users: { id: string; name: string; email: string }[];
    packages: { id: number; name: string }[];
    events: { id: number; title: string }[];
}

type TabMode = "EXISTING" | "NEW";

export function GhostCardCreator({ users, packages, events }: GhostCardCreatorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mode, setMode] = useState<TabMode>("EXISTING");
    const router = useRouter();

    const [form, setForm] = useState({
        userId: "",
        packageId: "",
        eventId: "",
        // New User Fields
        newName: "",
        newEmail: "",
        newPhone: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 공통 유효성 검사
        if (!form.packageId || !form.eventId) {
            toast.error("이벤트와 패키지를 선택해주세요.");
            return;
        }

        if (mode === "EXISTING" && !form.userId) {
            toast.error("선수를 선택해주세요.");
            return;
        }

        if (mode === "NEW" && (!form.newName || !form.newEmail || !form.newPhone)) {
            toast.error("신규 등록 정보를 모두 입력해주세요.");
            return;
        }

        setIsSubmitting(true);
        try {
            if (mode === "NEW") {
                await createGhostCardWithNewUser({
                    eventId: Number(form.eventId),
                    packageId: Number(form.packageId),
                    user: {
                        name: form.newName,
                        email: form.newEmail,
                        phone: form.newPhone
                    }
                });
            } else {
                await createGhostCard({
                    userId: form.userId,
                    packageId: Number(form.packageId),
                    eventId: Number(form.eventId)
                });
            }

            toast.success("Ghost Card가 생성되었습니다. SHOOTING 단계로 진입합니다.");
            setIsOpen(false);
            setForm({
                userId: "", packageId: "", eventId: "",
                newName: "", newEmail: "", newPhone: ""
            });
            router.refresh();
        } catch (error) {
            toast.error(`생성 실패: ${(error as Error).message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <button className="flex items-center gap-2 h-10 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] active:scale-95 group">
                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                    REGISTER GHOST
                </button>
            </SheetTrigger>
            <SheetContent className="bg-[#0A0A0A] border-l border-zinc-800 text-zinc-100 sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                        <Ghost className="h-6 w-6 text-red-600" />
                        GHOST <span className="text-red-600">CREATOR</span>
                    </SheetTitle>
                    <SheetDescription className="text-zinc-500 font-mono text-[10px] uppercase">
                        현장 등록 엔진: 결제 전 작업을 즉시 시작합니다.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="flex flex-col h-full py-6 space-y-6">
                    {/* Event & Package (Common) */}
                    <div className="space-y-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Select Event</label>
                            <select
                                className="w-full bg-zinc-950 border border-zinc-800 h-10 px-3 text-xs font-mono uppercase focus:border-red-600 focus:ring-1 focus:ring-red-600/30 transition-all outline-none"
                                value={form.eventId}
                                onChange={(e) => setForm({ ...form, eventId: e.target.value })}
                                required
                            >
                                <option value="">-- Choose Event --</option>
                                {events.map(e => (
                                    <option key={e.id} value={e.id}>{e.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Select Package</label>
                            <select
                                className="w-full bg-zinc-950 border border-zinc-800 h-10 px-3 text-xs font-mono uppercase focus:border-red-600 focus:ring-1 focus:ring-red-600/30 transition-all outline-none"
                                value={form.packageId}
                                onChange={(e) => setForm({ ...form, packageId: e.target.value })}
                                required
                            >
                                <option value="">-- Select Service Level --</option>
                                {packages.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* User Selection Mode */}
                    <div className="flex bg-zinc-900 p-1 rounded border border-zinc-800">
                        <button
                            type="button"
                            onClick={() => setMode("EXISTING")}
                            className={`flex-1 text-xs font-bold py-2 uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${mode === "EXISTING" ? "bg-zinc-800 text-white shadow" : "text-zinc-500 hover:text-zinc-300"
                                }`}
                        >
                            <User className="h-3 w-3" /> Existing
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("NEW")}
                            className={`flex-1 text-xs font-bold py-2 uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${mode === "NEW" ? "bg-red-900/30 text-red-500 border border-red-500/30" : "text-zinc-500 hover:text-zinc-300"
                                }`}
                        >
                            <UserPlus className="h-3 w-3" /> Register New
                        </button>
                    </div>

                    {mode === "EXISTING" ? (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Select Operative</label>
                            <select
                                className="w-full bg-zinc-950 border border-zinc-800 h-10 px-3 text-xs font-mono uppercase focus:border-red-600 focus:ring-1 focus:ring-red-600/30 transition-all outline-none"
                                value={form.userId}
                                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                            >
                                <option value="">-- Select Registered Player --</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 bg-red-950/10 p-4 border border-red-900/20 rounded">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-red-500/80 uppercase tracking-widest">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-zinc-950 border border-zinc-800 h-10 px-3 text-sm text-white focus:border-red-600 focus:outline-none transition-all placeholder:text-zinc-700"
                                    placeholder="ex. JAX TELLER"
                                    value={form.newName}
                                    onChange={(e) => setForm({ ...form, newName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-red-500/80 uppercase tracking-widest">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full bg-zinc-950 border border-zinc-800 h-10 px-3 text-sm text-white focus:border-red-600 focus:outline-none transition-all placeholder:text-zinc-700"
                                    placeholder="ex. jax@samcro.com"
                                    value={form.newEmail}
                                    onChange={(e) => setForm({ ...form, newEmail: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-red-500/80 uppercase tracking-widest">Phone Number</label>
                                <input
                                    type="tel"
                                    className="w-full bg-zinc-950 border border-zinc-800 h-10 px-3 text-sm text-white focus:border-red-600 focus:outline-none transition-all placeholder:text-zinc-700"
                                    placeholder="ex. 010-1234-5678"
                                    value={form.newPhone}
                                    onChange={(e) => setForm({ ...form, newPhone: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex-1" />

                    <SheetFooter>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-14 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <Ghost className="h-5 w-5" />
                                    INITIALIZE ENGINE
                                </>
                            )}
                        </button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}

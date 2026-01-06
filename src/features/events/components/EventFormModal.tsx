"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createEvent, updateEvent } from "../actions";
import { AdminEvent } from "../queries";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface EventFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    event?: AdminEvent; // If provided, it's edit mode
}

export function EventFormModal({ isOpen, onClose, event }: EventFormModalProps) {
    const isEditMode = !!event;
    const [isLoading, setIsLoading] = useState(false);
    const [isActive, setIsActive] = useState(event ? event.is_active : true);
    const [disciplinesStr, setDisciplinesStr] = useState(
        event?.disciplines ? event.disciplines.join(", ") : ""
    );
    const [compositionOptionsStr, setCompositionOptionsStr] = useState(
        event?.composition_options ? event.composition_options.join(", ") : "VIDEO, PHOTO, HIGHLIGHT, RAW, REELS, DRONE, INTERVIEW"
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        // Switch does not submit via FormData automatically if not inside form as input
        // Rely on the hidden input.

        try {
            if (isEditMode && event) {
                await updateEvent(event.id, formData);
                toast.success("이벤트가 수정되었습니다.");
            } else {
                await createEvent(formData);
                toast.success("새로운 이벤트가 생성되었습니다.");
            }
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || (isEditMode ? "이벤트 수정 실패" : "이벤트 생성 실패"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold font-[family-name:var(--font-oswald)] uppercase tracking-wide">
                        {isEditMode ? "Edit Event" : "Create New Event"}
                    </DialogTitle>
                </DialogHeader>

                <motion.form
                    onSubmit={handleSubmit}
                    className="space-y-4 py-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                >
                    {/* Title */}
                    <motion.div className="space-y-2" initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                        <Label htmlFor="title" className="text-zinc-400">Event Title</Label>
                        <Input
                            id="title"
                            name="title"
                            defaultValue={event?.title}
                            placeholder="e.g. 2024 NABBA Korea"
                            required
                            className="bg-zinc-950 border-zinc-800 focus:border-red-500 text-white"
                        />
                    </motion.div>

                    {/* Date */}
                    <motion.div className="space-y-2" initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
                        <Label htmlFor="eventDate" className="text-zinc-400">Date</Label>
                        <Input
                            id="eventDate"
                            name="eventDate"
                            type="date"
                            defaultValue={event?.event_date ? new Date(event.event_date).toISOString().split('T')[0] : ''}
                            required
                            className="bg-zinc-950 border-zinc-800 focus:border-red-500 text-white"
                        />
                    </motion.div>

                    {/* Location */}
                    <motion.div className="space-y-2" initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                        <Label htmlFor="location" className="text-zinc-400">Location</Label>
                        <Input
                            id="location"
                            name="location"
                            defaultValue={event?.location}
                            placeholder="e.g. Seoul Grand Hyatt"
                            className="bg-zinc-950 border-zinc-800 focus:border-red-500 text-white"
                        />
                    </motion.div>

                    {/* Thumbnail URL */}
                    <motion.div className="space-y-2" initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
                        <Label htmlFor="thumbnailUrl" className="text-zinc-400">Thumbnail URL</Label>
                        <Input
                            id="thumbnailUrl"
                            name="thumbnailUrl"
                            defaultValue={event?.thumbnail_url}
                            placeholder="https://..."
                            className="bg-zinc-950 border-zinc-800 focus:border-red-500 text-white"
                        />
                    </motion.div>

                    {/* Disciplines */}
                    <motion.div className="space-y-2" initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                        <Label htmlFor="disciplines" className="text-zinc-400">Disciplines (Categories)</Label>
                        <div className="flex flex-wrap gap-2 p-3 min-h-[60px] bg-zinc-950 border border-zinc-800 rounded-md">
                            {disciplinesStr.split(",").map(s => s.trim()).filter(Boolean).map((discipline, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/50 text-red-400 text-sm rounded"
                                >
                                    {discipline}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const arr = disciplinesStr.split(",").map(s => s.trim()).filter(Boolean);
                                            arr.splice(idx, 1);
                                            setDisciplinesStr(arr.join(", "));
                                        }}
                                        className="hover:text-red-300 ml-1"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                            <input
                                type="text"
                                placeholder="종목 입력 후 Enter"
                                className="flex-1 min-w-[120px] bg-transparent text-white text-sm outline-none placeholder:text-zinc-600"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        const val = e.currentTarget.value.trim();
                                        if (val) {
                                            const arr = disciplinesStr.split(",").map(s => s.trim()).filter(Boolean);
                                            if (!arr.includes(val)) {
                                                arr.push(val);
                                                setDisciplinesStr(arr.join(", "));
                                            }
                                            e.currentTarget.value = "";
                                        }
                                    }
                                }}
                            />
                        </div>
                        <p className="text-[10px] text-zinc-500">종목을 입력하고 Enter를 눌러 추가하세요 (예: Bodybuilding, Physique)</p>
                        <input
                            type="hidden"
                            name="disciplines"
                            value={JSON.stringify(disciplinesStr.split(",").map(s => s.trim()).filter(Boolean))}
                        />
                    </motion.div>

                    {/* Composition Options */}
                    <motion.div className="space-y-2" initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.42 }}>
                        <Label htmlFor="composition_options" className="text-zinc-400">Composition Options</Label>
                        <div className="flex flex-wrap gap-2 p-3 min-h-[60px] bg-zinc-950 border border-zinc-800 rounded-md">
                            {compositionOptionsStr.split(",").map(s => s.trim()).filter(Boolean).map((opt, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-400 text-sm rounded"
                                >
                                    {opt}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const arr = compositionOptionsStr.split(",").map(s => s.trim()).filter(Boolean);
                                            arr.splice(idx, 1);
                                            setCompositionOptionsStr(arr.join(", "));
                                        }}
                                        className="hover:text-blue-300 ml-1"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                            <input
                                type="text"
                                placeholder="옵션 입력 후 Enter"
                                className="flex-1 min-w-[120px] bg-transparent text-white text-sm outline-none placeholder:text-zinc-600"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        const val = e.currentTarget.value.trim();
                                        if (val) {
                                            const arr = compositionOptionsStr.split(",").map(s => s.trim()).filter(Boolean);
                                            if (!arr.includes(val)) {
                                                arr.push(val);
                                                setCompositionOptionsStr(arr.join(", "));
                                            }
                                            e.currentTarget.value = "";
                                        }
                                    }
                                }}
                            />
                        </div>
                        <p className="text-[10px] text-zinc-500">패키지 구성 옵션을 입력하고 Enter를 눌러 추가하세요 (예: 4K, ALTO)</p>
                        <input
                            type="hidden"
                            name="composition_options"
                            value={JSON.stringify(compositionOptionsStr.split(",").map(s => s.trim()).filter(Boolean))}
                        />
                    </motion.div>

                    {/* Active Status */}
                    <motion.div className="flex items-center justify-between pt-2 p-3 border border-zinc-800 rounded-md bg-zinc-950/50" initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.45 }}>
                        <div className="flex flex-col gap-0.5">
                            <Label htmlFor="isActive" className="text-zinc-300">Public Visibility</Label>
                            <span className="text-[10px] text-zinc-500">
                                {isActive ? "이벤트가 쇼케이스에 노출됩니다." : "이벤트가 숨김 처리됩니다."}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="isActive"
                                checked={isActive}
                                onCheckedChange={setIsActive}
                                className="data-[state=checked]:bg-red-600"
                            />
                            {/* Hidden input to pass value to FormData */}
                            <input
                                type="hidden"
                                name="isActive"
                                value={String(isActive)}
                            />
                        </div>
                    </motion.div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={isLoading}
                            className="text-zinc-400 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isEditMode ? "Save Changes" : "Create Event"}
                        </Button>
                    </DialogFooter>
                </motion.form>
            </DialogContent>
        </Dialog>
    );
}

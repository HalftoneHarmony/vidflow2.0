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

interface EventFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    event?: AdminEvent; // If provided, it's edit mode
}

export function EventFormModal({ isOpen, onClose, event }: EventFormModalProps) {
    const isEditMode = !!event;
    const [isLoading, setIsLoading] = useState(false);
    const [isActive, setIsActive] = useState(event ? event.is_active : true);

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

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-zinc-400">Event Title</Label>
                        <Input
                            id="title"
                            name="title"
                            defaultValue={event?.title}
                            placeholder="e.g. 2024 NABBA Korea"
                            required
                            className="bg-zinc-950 border-zinc-800 focus:border-red-500 text-white"
                        />
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label htmlFor="eventDate" className="text-zinc-400">Date</Label>
                        <Input
                            id="eventDate"
                            name="eventDate"
                            type="date"
                            defaultValue={event?.event_date ? new Date(event.event_date).toISOString().split('T')[0] : ''}
                            required
                            className="bg-zinc-950 border-zinc-800 focus:border-red-500 text-white"
                        />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <Label htmlFor="location" className="text-zinc-400">Location</Label>
                        <Input
                            id="location"
                            name="location"
                            defaultValue={event?.location}
                            placeholder="e.g. Seoul Grand Hyatt"
                            className="bg-zinc-950 border-zinc-800 focus:border-red-500 text-white"
                        />
                    </div>

                    {/* Thumbnail URL */}
                    <div className="space-y-2">
                        <Label htmlFor="thumbnailUrl" className="text-zinc-400">Thumbnail URL</Label>
                        <Input
                            id="thumbnailUrl"
                            name="thumbnailUrl"
                            defaultValue={event?.thumbnail_url}
                            placeholder="https://..."
                            className="bg-zinc-950 border-zinc-800 focus:border-red-500 text-white"
                        />
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center justify-between pt-2 p-3 border border-zinc-800 rounded-md bg-zinc-950/50">
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
                    </div>

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
                </form>
            </DialogContent>
        </Dialog>
    );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PipelineCardWithDetails } from "../queries";
import { assignWorker } from "../actions";
import { toast } from "sonner"; // Assuming sonner is installed
import { Loader2 } from "lucide-react";

interface TaskDetailModalProps {
    card: PipelineCardWithDetails | null;
    isOpen: boolean;
    onClose: () => void;
    availableWorkers: Array<{ id: string; name: string }>;
}

export function TaskDetailModal({ card, isOpen, onClose, availableWorkers }: TaskDetailModalProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!card) return null;

    const currentWorkerId = card.assignee_id || "unassigned";

    const handleAssign = async (workerId: string) => {
        if (workerId === currentWorkerId) return;

        setIsSubmitting(true);
        try {
            const targetId = workerId === "unassigned" ? null : workerId;
            await assignWorker(card.id, targetId);
            toast.success("작업자가 변경되었습니다.");
            router.refresh();
            // 모달을 즉시 닫거나 유지할 수 있음. 여기선 유지.
        } catch (error) {
            toast.error("작업자 할당 실패: " + (error as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <span>Order #{card.order_id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-normal ${getStatusColor(card.stage)}`}>
                            {card.stage}
                        </span>
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        {card.order?.package?.name} for {card.order?.user?.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Status & Timing */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                            <label className="text-xs text-zinc-500 uppercase font-bold">Entered Stage</label>
                            <div className="font-mono">{new Date(card.stage_entered_at).toLocaleDateString()}</div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-zinc-500 uppercase font-bold">Last Updated</label>
                            <div className="font-mono">{new Date(card.updated_at).toLocaleDateString()}</div>
                        </div>
                    </div>

                    {/* Worker Assignment */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Assign Worker</label>
                        <div className="relative">
                            <select
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                                value={currentWorkerId}
                                onChange={(e) => handleAssign(e.target.value)}
                                disabled={isSubmitting}
                            >
                                <option value="unassigned">Unassigned</option>
                                {availableWorkers.map((worker) => (
                                    <option key={worker.id} value={worker.id}>
                                        {worker.name}
                                    </option>
                                ))}
                            </select>
                            {isSubmitting && (
                                <div className="absolute right-3 top-2.5">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-zinc-500">
                            Selecting a worker will instantly update the assignment.
                        </p>
                    </div>

                    {/* Deliverables List (ReadOnly for now) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Deliverables</label>
                        {card.deliverables.length === 0 ? (
                            <div className="text-xs text-zinc-500 italic p-2 border border-zinc-800 rounded bg-zinc-900/50">
                                No deliverables defined.
                            </div>
                        ) : (
                            <ul className="space-y-1">
                                {card.deliverables.map((d) => (
                                    <li key={d.id} className="flex items-center justify-between text-xs p-2 bg-zinc-900 rounded border border-zinc-800">
                                        <span className="font-mono text-zinc-300">{d.type}</span>
                                        <span className={d.external_link_url ? "text-green-500" : "text-amber-500"}>
                                            {d.external_link_url ? "Linked" : "Missing"}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <DialogFooter className="sm:justify-start">
                    {/* Footer info or Close button can go here */}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function getStatusColor(stage: string): string {
    switch (stage) {
        case "WAITING": return "bg-zinc-800 text-zinc-300";
        case "SHOOTING": return "bg-blue-900/50 text-blue-300";
        case "EDITING": return "bg-purple-900/50 text-purple-300";
        case "READY": return "bg-orange-900/50 text-orange-300";
        case "DELIVERED": return "bg-green-900/50 text-green-300";
        default: return "bg-gray-800 text-gray-300";
    }
}

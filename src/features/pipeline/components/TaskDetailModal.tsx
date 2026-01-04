import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PipelineCardWithDetails } from "../queries";
import { assignWorker } from "../actions";
import { toast } from "sonner";
import { Loader2, Link as LinkIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { LinkInputModal } from "@/features/delivery/components/LinkInputModal";

interface TaskDetailModalProps {
    card: PipelineCardWithDetails | null;
    isOpen: boolean;
    onClose: () => void;
    availableWorkers: Array<{ id: string; name: string }>;
}

export function TaskDetailModal({ card, isOpen, onClose, availableWorkers }: TaskDetailModalProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [editingDeliverable, setEditingDeliverable] = useState<{
        id: number;
        type: string;
        link: string | null;
    } | null>(null);

    const [activeTab, setActiveTab] = useState<"INFO" | "DELIVERABLES" | "FINANCE">("INFO");

    if (!card) return null;

    const currentWorkerId = card.assignee_id || "unassigned";
    const workerRate = card.worker_node?.commission_rate || 0;
    const orderAmount = card.order_node?.amount || 0;
    const estimatedProfit = orderAmount - workerRate;

    const handleAssign = async (workerId: string) => {
        if (workerId === currentWorkerId) return;

        setIsSubmitting(true);
        try {
            const targetId = workerId === "unassigned" ? null : workerId;
            await assignWorker(card.id, targetId);
            toast.success("작업자가 변경되었습니다.");
            router.refresh();
        } catch (error) {
            toast.error("작업자 할당 실패: " + (error as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLinkClick = (d: PipelineCardWithDetails['deliverables'][number]) => {
        setEditingDeliverable({
            id: d.id,
            type: d.type,
            link: d.external_link_url,
        });
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="sm:max-w-[600px] bg-zinc-950 border-zinc-800 text-zinc-100 p-0 overflow-hidden flex flex-col max-h-[85vh]">
                    <DialogHeader className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/30">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <span>Order #{card.order_id}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-normal ${getStatusColor(card.stage)}`}>
                                {card.stage}
                            </span>
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            {card.order_node?.package_node?.name} for {card.order_node?.user_node?.name}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Tabs Header */}
                    <div className="flex border-b border-zinc-800 bg-zinc-900/50">
                        {(["INFO", "DELIVERABLES", "FINANCE"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === tab
                                    ? "border-red-600 text-white bg-red-900/10"
                                    : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {activeTab === "INFO" && (
                            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                {/* Status & Timing */}
                                <div className="grid grid-cols-2 gap-4 text-sm bg-zinc-900/50 p-4 rounded border border-zinc-800">
                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-500 uppercase font-bold">Entered Stage</label>
                                        <div className="font-mono text-zinc-200">
                                            {card.stage_entered_at ? new Date(card.stage_entered_at).toLocaleDateString() : '-'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-500 uppercase font-bold">Last Updated</label>
                                        <div className="font-mono text-zinc-200">
                                            {new Date(card.updated_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Worker Assignment */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                        Assign Worker
                                        {isSubmitting && <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />}
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-3 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 appearance-none transition-shadow"
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
                                        <div className="absolute right-3 top-3.5 pointer-events-none text-zinc-500 text-[10px]">▼</div>
                                    </div>
                                    <p className="text-[10px] text-zinc-500">
                                        Change assignee to re-route this card.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === "DELIVERABLES" && (
                            <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-zinc-300">Deliverables & Links</label>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">
                                        {card.deliverables.filter(d => d.link_status === 'VALID').length}/{card.deliverables.length} READY
                                    </span>
                                </div>

                                {card.deliverables.length === 0 ? (
                                    <div className="text-xs text-zinc-500 italic p-8 border border-dashed border-zinc-800 rounded bg-zinc-900/50 text-center flex flex-col items-center gap-2">
                                        <div className="bg-zinc-800 p-2 rounded-full">
                                            <AlertCircle className="h-4 w-4" />
                                        </div>
                                        No deliverables required for this package.
                                    </div>
                                ) : (
                                    <ul className="space-y-2">
                                        {card.deliverables.map((d) => (
                                            <li key={d.id} className="flex items-center justify-between text-xs p-3 bg-zinc-900 rounded border border-zinc-800 hover:border-zinc-700 transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <span className={`p-2 rounded-full ${d.external_link_url ? (d.link_status === 'INVALID' ? 'bg-red-900/30 text-red-500' : 'bg-green-900/30 text-green-500') : 'bg-zinc-800 text-zinc-500'}`}>
                                                        {d.type === 'MAIN_VIDEO' ? '🎬' : d.type === 'SHORTS' ? '📱' : d.type === 'PHOTO_ZIP' ? '📸' : '📦'}
                                                    </span>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-zinc-300 uppercase tracking-tight">{d.type}</span>
                                                        <span className="text-[10px] text-zinc-500 truncate max-w-[200px] font-mono">
                                                            {d.external_link_url || "No link attached"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleLinkClick(d)}
                                                    className={`
                                                        flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all
                                                        ${d.external_link_url
                                                            ? d.link_status === 'VALID'
                                                                ? "bg-green-900/20 text-green-400 hover:bg-green-900/40 border border-green-900/50"
                                                                : d.link_status === 'INVALID'
                                                                    ? "bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50"
                                                                    : "bg-amber-900/20 text-amber-400 hover:bg-amber-900/40 border border-amber-900/50"
                                                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700"
                                                        }
                                                    `}
                                                >
                                                    {d.external_link_url ? (
                                                        <>
                                                            {d.link_status === 'VALID' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                            {d.link_status || "UNCHECKED"}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <LinkIcon className="w-3 h-3" />
                                                            ADD LINK
                                                        </>
                                                    )}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {activeTab === "FINANCE" && (
                            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded flex flex-col gap-1">
                                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Revenue</span>
                                        <span className="text-xl font-mono text-white">₩{orderAmount.toLocaleString()}</span>
                                        <span className="text-[10px] text-zinc-600">Package Price</span>
                                    </div>
                                    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded flex flex-col gap-1">
                                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Labor Cost</span>
                                        <span className="text-xl font-mono text-red-400">-₩{workerRate.toLocaleString()}</span>
                                        <span className="text-[10px] text-zinc-600">Assigned: {card.worker_node?.name || "None"}</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded flex flex-col gap-2 relative overflow-hidden">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${estimatedProfit >= 0 ? 'bg-green-600' : 'bg-red-600'}`} />
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Estimated Profit</span>
                                        <span className={`text-2xl font-black font-mono ${estimatedProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            ₩{estimatedProfit.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-zinc-500 text-center">
                                    * Labor cost is automatically registered when this card reaches DELIVERED stage.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-zinc-900 bg-zinc-950 sm:justify-between items-center">
                        <div className="text-[10px] text-zinc-600 font-mono">
                            ID: {card.id} • {card.order_id ? `ORD-${card.order_id}` : 'GHOST'}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Link Input Modal */}
            {editingDeliverable && (
                <LinkInputModal
                    isOpen={!!editingDeliverable}
                    onClose={() => setEditingDeliverable(null)}
                    deliverableId={editingDeliverable.id}
                    deliverableType={editingDeliverable.type}
                    currentLink={editingDeliverable.link}
                    onSuccess={(status) => {
                        toast.success(`Link status: ${status}`);
                        router.refresh();
                    }}
                />
            )}
        </>
    );
}

function getStatusColor(stage: string): string {
    switch (stage) {
        case "WAITING": return "bg-zinc-800 text-zinc-300";
        case "EDITING": return "bg-purple-900/50 text-purple-300 border border-purple-900";
        case "READY": return "bg-orange-900/50 text-orange-300 border border-orange-900";
        case "DELIVERED": return "bg-green-900/50 text-green-300 border border-green-900";
        default: return "bg-gray-800 text-gray-300";
    }
}

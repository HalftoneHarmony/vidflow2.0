"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate } from "@/shared/utils/formatters";
import { AdminEvent } from "../queries";
import { toggleEventActive, deleteEvent } from "../actions";
import { toast } from "sonner";
import { Calendar, MapPin, Package, Edit3, Trash2 } from "lucide-react";
import { EventFormModal } from "./EventFormModal";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * 📅 Event Table Component
 * 이벤트 목록, 활성화 관리, 수정/삭제
 * Premium UI with Animations
 * 
 * @author Vulcan (The Forge Master) & Agent 4
 */

interface EventTableProps {
    events: AdminEvent[];
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const rowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
};

export function EventTable({ events }: EventTableProps) {
    const [loadingId, setLoadingId] = useState<number | null>(null);

    // Modal States
    const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Toggle Active Status
    const handleToggle = async (eventId: number, currentState: boolean) => {
        try {
            setLoadingId(eventId);
            await toggleEventActive(eventId, !currentState);
            toast.success(currentState ? "이벤트가 비공개 처리되었습니다." : "이벤트가 공개되었습니다.");
        } catch (error) {
            toast.error("상태 변경에 실패했습니다.");
            console.error(error);
        } finally {
            setLoadingId(null);
        }
    };

    // Delete Event
    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            await deleteEvent(deletingId);
            toast.success("이벤트가 삭제되었습니다.");
        } catch (error) {
            toast.error("이벤트 삭제 실패");
            console.error(error);
        } finally {
            setDeletingId(null);
        }
    };

    const MotionTableRow = motion(TableRow);

    return (
        <div className="rounded-none border border-zinc-800 bg-[#0A0A0A] overflow-hidden">
            <Table>
                <TableHeader className="bg-zinc-900/50">
                    <TableRow className="hover:bg-zinc-900/50 border-zinc-800">
                        <TableHead className="h-12 px-4 text-xs font-bold text-zinc-400 uppercase tracking-wider font-[family-name:var(--font-oswald)]">Event</TableHead>
                        <TableHead className="h-12 px-4 text-xs font-bold text-zinc-400 uppercase tracking-wider font-[family-name:var(--font-oswald)]">Location</TableHead>
                        <TableHead className="h-12 px-4 text-xs font-bold text-zinc-400 uppercase tracking-wider font-[family-name:var(--font-oswald)]">Active</TableHead>
                        <TableHead className="h-12 px-4 text-xs font-bold text-zinc-400 uppercase tracking-wider font-[family-name:var(--font-oswald)]">Packages</TableHead>
                        <TableHead className="h-12 px-4 text-xs font-bold text-zinc-400 uppercase tracking-wider font-[family-name:var(--font-oswald)]">Disciplines</TableHead>
                        <TableHead className="h-12 px-4 text-xs font-bold text-zinc-400 uppercase tracking-wider font-[family-name:var(--font-oswald)]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <motion.tbody
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="[&_tr:last-child]:border-0"
                >
                    {events.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                                No events found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        events.map((event) => (
                            <MotionTableRow
                                key={event.id}
                                variants={rowVariants}
                                className="group border-zinc-800/50 transition-all duration-200 border-l-[3px] border-l-transparent hover:bg-white/[0.02] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:border-l-red-600 hover:-translate-y-[1px]"
                            >
                                <TableCell className="px-4 py-3">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-bold text-white text-base group-hover:text-red-500 transition-colors">{event.title}</span>
                                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(event.event_date)}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                        <MapPin className="w-3 h-3" />
                                        {event.location}
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={event.is_active}
                                            onCheckedChange={() => handleToggle(event.id, event.is_active)}
                                            disabled={loadingId === event.id}
                                            className="data-[state=checked]:bg-red-600"
                                        />
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "gap-1.5 transition-all text-[10px]",
                                                event.is_active
                                                    ? "bg-red-500/10 text-red-500 border-red-500/20 badge-shimmer"
                                                    : "bg-zinc-800/50 text-zinc-500 border-transparent"
                                            )}
                                        >
                                            {event.is_active && <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />}
                                            {event.is_active ? "PUBLIC" : "HIDDEN"}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                    <Badge variant="outline" className="gap-1 border-zinc-700 text-zinc-300 group-hover:border-zinc-500 transition-colors">
                                        <Package className="w-3 h-3" />
                                        {event.package_count} Items
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                        {event.disciplines && event.disciplines.length > 0 ? (
                                            <>
                                                {event.disciplines.slice(0, 3).map((d) => (
                                                    <Badge key={d} className="text-[10px] bg-zinc-800 text-zinc-300 border-0 group-hover:bg-zinc-700 transition-colors">
                                                        {d}
                                                    </Badge>
                                                ))}
                                                {event.disciplines.length > 3 && (
                                                    <Badge className="text-[10px] bg-zinc-700 text-zinc-400 border-0">
                                                        +{event.disciplines.length - 3}
                                                    </Badge>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-xs text-zinc-600 italic">No disciplines</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setEditingEvent(event)}
                                            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeletingId(event.id)}
                                            className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-900/20"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </MotionTableRow>
                        ))
                    )}
                </motion.tbody>
            </Table>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingEvent && (
                    <EventFormModal
                        isOpen={!!editingEvent}
                        onClose={() => setEditingEvent(null)}
                        event={editingEvent}
                    />
                )}
            </AnimatePresence>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deletingId}
                onOpenChange={(open) => !open && setDeletingId(null)}
                onConfirm={handleDelete}
                title="Events 삭제"
                description="이 대회를 정말 삭제하시겠습니까? 연결된 모든 패키지와 주문 데이터에 영향을 줄 수 있습니다."
                variant="destructive"
            />
        </div>
    );
}

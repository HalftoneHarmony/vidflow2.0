"use client";

import { useState } from "react";
import { DataTable, Column } from "@/components/ui/data-table";
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

/**
 * 📅 Event Table Component
 * 이벤트 목록, 활성화 관리, 수정/삭제
 * 
 * @author Vulcan (The Forge Master)
 */

interface EventTableProps {
    events: AdminEvent[];
}

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

    const columns: Column<AdminEvent>[] = [
        {
            header: "Event",
            cell: (event) => (
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-white text-base">{event.title}</span>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(event.event_date)}
                    </div>
                </div>
            ),
        },
        {
            header: "Location",
            cell: (event) => (
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <MapPin className="w-3 h-3" />
                    {event.location}
                </div>
            ),
        },
        {
            header: "Active",
            cell: (event) => (
                <div className="flex items-center gap-2">
                    <Switch
                        checked={event.is_active}
                        onCheckedChange={() => handleToggle(event.id, event.is_active)}
                        disabled={loadingId === event.id}
                        className="data-[state=checked]:bg-red-600"
                    />
                    <span className={`text-xs font-bold uppercase ${event.is_active ? "text-red-500" : "text-zinc-600"}`}>
                        {event.is_active ? "Public" : "Hidden"}
                    </span>
                </div>
            ),
        },
        {
            header: "Packages",
            cell: (event) => (
                <Badge variant="outline" className="gap-1 border-zinc-700 text-zinc-300">
                    <Package className="w-3 h-3" />
                    {event.package_count} Items
                </Badge>
            ),
        },
        {
            header: "Disciplines",
            cell: (event) => (
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {event.disciplines && event.disciplines.length > 0 ? (
                        <>
                            {event.disciplines.slice(0, 3).map((d) => (
                                <Badge key={d} className="text-[10px] bg-zinc-800 text-zinc-300 border-0">
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
            ),
        },
        {
            header: "Actions",
            cell: (event) => (
                <div className="flex items-center gap-2">
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
            ),
        },
    ];

    return (
        <>
            <DataTable columns={columns} data={events} />

            {/* Edit Modal */}
            {editingEvent && (
                <EventFormModal
                    isOpen={!!editingEvent}
                    onClose={() => setEditingEvent(null)}
                    event={editingEvent}
                />
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deletingId}
                onOpenChange={(open) => !open && setDeletingId(null)}
                onConfirm={handleDelete}
                title="Events 삭제"
                description="이 대회를 정말 삭제하시겠습니까? 연결된 모든 패키지와 주문 데이터에 영향을 줄 수 있습니다."
                variant="destructive"
            />
        </>
    );
}

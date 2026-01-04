"use client";

import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { formatDate } from "@/shared/utils/formatters";
import { AdminEvent } from "../queries";
import { toggleEventActive } from "../actions";
import { toast } from "sonner";
import { useState } from "react";
import { Calendar, MapPin, Package } from "lucide-react";

/**
 * 📅 Event Table Component
 * 이벤트 목록 및 활성화 관리
 */

interface EventTableProps {
    events: AdminEvent[];
}

export function EventTable({ events }: EventTableProps) {
    const [loadingId, setLoadingId] = useState<number | null>(null);

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
            header: "Created",
            cell: (event) => (
                <span className="text-zinc-600 text-xs font-mono">
                    {new Date(event.created_at).toLocaleDateString()}
                </span>
            ),
        },
    ];

    return <DataTable columns={columns} data={events} />;
}

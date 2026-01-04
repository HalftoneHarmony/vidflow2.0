"use client";

import { Search, Filter, User, Calendar } from "lucide-react";

export interface PipelineFiltersState {
    eventId: string | "ALL";
    assigneeId: string | "ALL";
    query: string;
}

interface KanbanFiltersProps {
    filters: PipelineFiltersState;
    onFilterChange: (updates: Partial<PipelineFiltersState>) => void;
    events: { id: number; title: string }[];
    assignees: { id: string; name: string }[];
}

export function KanbanFilters({ filters, onFilterChange, events, assignees }: KanbanFiltersProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-2 bg-zinc-900/30 p-1.5 rounded-lg border border-zinc-800">
            {/* Search */}
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input
                    className="w-full h-9 bg-zinc-950 border border-black/20 rounded-md py-1.5 pl-9 pr-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all font-mono"
                    placeholder="Search Order No, Customer, Package..."
                    value={filters.query}
                    onChange={(e) => onFilterChange({ query: e.target.value })}
                />
            </div>

            <div className="flex gap-2 shrink-0">
                {/* Event Filter */}
                <div className="relative w-[160px]">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                    <select
                        className="w-full h-9 bg-zinc-950 border border-black/20 rounded-md pl-9 pr-8 text-[11px] font-bold text-zinc-400 focus:outline-none appearance-none cursor-pointer hover:text-zinc-200 hover:bg-zinc-900 transition-colors uppercase"
                        value={filters.eventId}
                        onChange={(e) => onFilterChange({ eventId: e.target.value })}
                    >
                        <option value="ALL">ALL EVENTS</option>
                        {events.map(e => (
                            <option key={e.id} value={String(e.id)}>{e.title}</option>
                        ))}
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-700 text-[8px]">▼</div>
                </div>

                {/* Assignee Filter */}
                <div className="relative w-[140px]">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                    <select
                        className="w-full h-9 bg-zinc-950 border border-black/20 rounded-md pl-9 pr-8 text-[11px] font-bold text-zinc-400 focus:outline-none appearance-none cursor-pointer hover:text-zinc-200 hover:bg-zinc-900 transition-colors uppercase"
                        value={filters.assigneeId}
                        onChange={(e) => onFilterChange({ assigneeId: e.target.value })}
                    >
                        <option value="ALL">ALL OPERATIVES</option>
                        <option value="unassigned">UNASSIGNED</option>
                        {assignees.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-700 text-[8px]">▼</div>
                </div>
            </div>
        </div>
    )
}

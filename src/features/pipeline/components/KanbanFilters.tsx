import { Search, Filter, User, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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
        <div className="flex flex-col sm:flex-row gap-3 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50 shadow-sm backdrop-blur-sm">
            {/* Search */}
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 z-10" />
                <Input
                    className="w-full h-10 bg-zinc-950 border-zinc-800 focus-visible:ring-red-900/50 pl-9 text-xs mb-1 sm:mb-0"
                    placeholder="SEARCH ORDER, PACKAGE..."
                    value={filters.query}
                    onChange={(e) => onFilterChange({ query: e.target.value })}
                />
            </div>

            <div className="flex gap-2 shrink-0">
                {/* Event Filter */}
                <div className="w-[180px]">
                    <Select
                        value={filters.eventId}
                        onValueChange={(value) => onFilterChange({ eventId: value })}
                    >
                        <SelectTrigger className="h-10 bg-zinc-950 border-zinc-800 text-xs font-bold uppercase tracking-wide text-zinc-400 focus:ring-red-900/50">
                            <div className="flex items-center gap-2 truncate">
                                <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                                <SelectValue placeholder="FILTER EVENT" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-800">
                            <SelectItem value="ALL" className="text-xs font-bold text-zinc-400 focus:bg-zinc-900 focus:text-zinc-200">ALL EVENTS</SelectItem>
                            {events.map((e) => (
                                <SelectItem key={e.id} value={String(e.id)} className="text-xs text-zinc-400 focus:bg-zinc-900 focus:text-zinc-200">
                                    {e.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Assignee Filter */}
                <div className="w-[160px]">
                    <Select
                        value={filters.assigneeId}
                        onValueChange={(value) => onFilterChange({ assigneeId: value })}
                    >
                        <SelectTrigger className="h-10 bg-zinc-950 border-zinc-800 text-xs font-bold uppercase tracking-wide text-zinc-400 focus:ring-red-900/50">
                            <div className="flex items-center gap-2 truncate">
                                <User className="h-3.5 w-3.5 text-zinc-500" />
                                <SelectValue placeholder="OPERATIVE" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-800">
                            <SelectItem value="ALL" className="text-xs font-bold text-zinc-400 focus:bg-zinc-900 focus:text-zinc-200">ALL OPERATIVES</SelectItem>
                            <SelectItem value="unassigned" className="text-xs text-zinc-400 focus:bg-zinc-900 focus:text-zinc-200">UNASSIGNED</SelectItem>
                            {assignees.map((a) => (
                                <SelectItem key={a.id} value={a.id} className="text-xs text-zinc-400 focus:bg-zinc-900 focus:text-zinc-200">
                                    {a.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}

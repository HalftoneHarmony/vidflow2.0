"use client";

import { useState, useEffect, useMemo } from "react";
import { ScrollText, Filter, Calendar, User, ShoppingCart, Settings, FileEdit, LogIn, Plus, Trash, RefreshCw, ChevronDown, X, Loader2, ChevronRight, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { getRecentActivityLogs, type ActivityLog } from "@/features/admin/actions";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const actionConfig: Record<string, { icon: typeof ScrollText; color: string; label: string }> = {
    ORDER_CREATED: { icon: ShoppingCart, color: "bg-green-600", label: "주문 생성" },
    ORDER_UPDATED: { icon: FileEdit, color: "bg-blue-600", label: "주문 수정" },
    ORDER_DELETED: { icon: Trash, color: "bg-red-600", label: "주문 삭제" },
    STATUS_CHANGED: { icon: RefreshCw, color: "bg-purple-600", label: "상태 변경" },
    USER_LOGIN: { icon: LogIn, color: "bg-emerald-600", label: "로그인" },
    EVENT_CREATED: { icon: Plus, color: "bg-amber-600", label: "이벤트 생성" },
    EVENT_UPDATED: { icon: FileEdit, color: "bg-amber-500", label: "이벤트 수정" },
    EXPENSE_ADDED: { icon: Plus, color: "bg-red-500", label: "지출 추가" },
    SETTINGS_UPDATED: { icon: Settings, color: "bg-zinc-500", label: "설정 변경" },
};

const defaultActionConfig = { icon: ScrollText, color: "bg-zinc-700", label: "기타" };

export function LogsClient() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [limit, setLimit] = useState(50);
    const [selectedActions, setSelectedActions] = useState<string[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
    const [expandedLogId, setExpandedLogId] = useState<ActivityLog['id'] | null>(null);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const data = await getRecentActivityLogs(limit);
            setLogs(data);
            setIsLoading(false);
        }
        loadData();
    }, [limit]);

    const uniqueActions = useMemo(() => Array.from(new Set(logs.map(log => log.action))).sort(), [logs]);
    const uniqueUsers = useMemo(() => {
        const users = new Map<string, string>();
        logs.forEach(log => { if (log.user_id && log.user_name) users.set(log.user_id, log.user_name); });
        return Array.from(users.entries());
    }, [logs]);

    const filteredLogs = useMemo(() => {
        let result = [...logs];
        if (selectedActions.length > 0) result = result.filter(log => selectedActions.includes(log.action));
        if (selectedUser) result = result.filter(log => log.user_id === selectedUser);
        if (dateRange.start) result = result.filter(log => new Date(log.created_at) >= new Date(dateRange.start));
        if (dateRange.end) {
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59, 999);
            result = result.filter(log => new Date(log.created_at) <= endDate);
        }
        return result;
    }, [logs, selectedActions, selectedUser, dateRange]);

    const groupedLogs = useMemo(() => {
        const groups: Record<string, ActivityLog[]> = {};
        filteredLogs.forEach(log => {
            const dateKey = new Date(log.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(log);
        });
        return groups;
    }, [filteredLogs]);

    const formatTime = (dateStr: string) => {
        const diffMins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
        if (diffMins < 1) return "방금 전";
        if (diffMins < 60) return `${diffMins}분 전`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}시간 전`;
        return new Date(dateStr).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    };

    const clearFilters = () => { setSelectedActions([]); setSelectedUser(null); setDateRange({ start: "", end: "" }); };
    const hasActiveFilters = selectedActions.length > 0 || selectedUser || dateRange.start || dateRange.end;

    const handleExport = (format: "csv" | "json") => {
        let content = "";
        const fileName = `activity_logs_${new Date().toISOString().split("T")[0]}.${format}`;

        if (format === "json") {
            content = JSON.stringify(filteredLogs, null, 2);
        } else {
            // CSV 헤더
            const headers = ["ID", "Time", "Action", "User", "Entity Type", "Entity ID", "Old Value", "New Value"];
            const rows = filteredLogs.map(log => [
                log.id,
                new Date(log.created_at).toLocaleString(),
                log.action,
                log.user_name || "System",
                log.entity_type || "",
                log.entity_id || "",
                JSON.stringify(log.old_value || "").replace(/"/g, '""'),
                JSON.stringify(log.new_value || "").replace(/"/g, '""')
            ]);

            content = [
                headers.join(","),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
            ].join("\n");
        }

        const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", fileName);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-500 flex items-center justify-center">
                        <ScrollText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-oswald)] uppercase">Activity Logs</h1>
                        <p className="text-sm text-zinc-400">시스템 활동 로그 · {filteredLogs.length}건</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="flex bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden">
                        <button
                            onClick={() => handleExport("csv")}
                            className="px-3 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors border-r border-zinc-800"
                        >
                            CSV
                        </button>
                        <button
                            onClick={() => handleExport("json")}
                            className="px-3 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        >
                            JSON
                        </button>
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2 text-sm border transition-colors ${showFilters || hasActiveFilters ? "bg-red-600/20 border-red-600 text-red-400" : "border-zinc-800 text-zinc-400 hover:border-zinc-600"}`}>
                        <Filter className="w-4 h-4" />필터{hasActiveFilters && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 space-y-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">필터 옵션</span>
                        {hasActiveFilters && <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"><X className="w-3 h-3" />초기화</button>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs text-zinc-400">액션 타입</label>
                            <select multiple value={selectedActions} onChange={(e) => setSelectedActions(Array.from(e.target.selectedOptions, opt => opt.value))} className="w-full h-24 bg-zinc-800 border border-zinc-700 text-sm text-white p-2 focus:outline-none focus:border-red-600">
                                {uniqueActions.map(action => <option key={action} value={action}>{actionConfig[action]?.label || action}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-zinc-400">사용자</label>
                            <div className="relative">
                                <select value={selectedUser || ""} onChange={(e) => setSelectedUser(e.target.value || null)} className="w-full bg-zinc-800 border border-zinc-700 text-sm text-white py-2 px-3 pr-8 focus:outline-none focus:border-red-600 appearance-none">
                                    <option value="">전체 사용자</option>
                                    {uniqueUsers.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-zinc-400">날짜 범위</label>
                            <div className="flex gap-2">
                                <input type="date" value={dateRange.start} onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} className="flex-1 bg-zinc-800 border border-zinc-700 text-sm text-white py-2 px-3 focus:outline-none focus:border-red-600" />
                                <input type="date" value={dateRange.end} onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} className="flex-1 bg-zinc-800 border border-zinc-700 text-sm text-white py-2 px-3 focus:outline-none focus:border-red-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-zinc-900/50 border border-zinc-800 p-6">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-zinc-500 animate-spin" /></div>
                ) : filteredLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-500"><ScrollText className="w-12 h-12 mb-4 opacity-30" /><p className="text-sm">활동 로그가 없습니다</p></div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedLogs).map(([date, dateLogs]) => (
                            <div key={date}>
                                <div className="flex items-center gap-3 mb-4">
                                    <Calendar className="w-4 h-4 text-red-500" />
                                    <span className="text-sm font-bold text-zinc-300">{date}</span>
                                    <span className="text-xs text-zinc-600">({dateLogs.length}건)</span>
                                    <div className="flex-1 h-px bg-zinc-800" />
                                </div>
                                <div className="relative pl-6">
                                    <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-zinc-700 via-zinc-800 to-transparent" />
                                    <div className="space-y-3">
                                        <AnimatePresence mode="popLayout">
                                            {dateLogs.map((log) => {
                                                const config = actionConfig[log.action] || defaultActionConfig;
                                                const IconComponent = config.icon;
                                                const isExpanded = expandedLogId === log.id;

                                                // Determine severity color for background tint
                                                const isError = log.action.includes("DELETED") || log.action.includes("ERROR");
                                                const isWarning = log.action.includes("UPDATED") || log.action.includes("CHANGED");
                                                const bgClass = isError ? "bg-red-950/20 border-red-900/30" :
                                                    isWarning ? "bg-amber-950/10 border-amber-900/20" :
                                                        "bg-zinc-800/30 border-zinc-800/50";

                                                return (
                                                    <motion.div
                                                        layout
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        key={log.id}
                                                        className={cn(
                                                            "relative group overflow-hidden transition-all duration-300 rounded-sm border cursor-pointer",
                                                            bgClass,
                                                            isExpanded && "border-zinc-600 bg-zinc-800/80 shadow-lg"
                                                        )}
                                                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                                    >
                                                        {/* Selection Indicator on Left */}
                                                        <motion.div
                                                            className={cn("absolute left-0 top-0 bottom-0 w-1 transition-colors", config.color)}
                                                            animate={{ width: isExpanded ? 4 : 2 }}
                                                        />

                                                        <div className="p-4 pl-6">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className={cn("text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5", config.color, "bg-opacity-20 text-white border border-white/10")}>
                                                                            <IconComponent className="w-3 h-3" />
                                                                            {log.action}
                                                                        </span>
                                                                        {log.entity_type && <span className="text-xs text-zinc-500 font-mono">[{log.entity_type}]</span>}
                                                                    </div>
                                                                    <p className="text-sm text-zinc-300 font-medium">{log.entity_id || config.label}</p>
                                                                    <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                                                                        <span className="flex items-center gap-1 text-zinc-400"><User className="w-3 h-3" />{log.user_name || "System"}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col items-end gap-2">
                                                                    <span className="text-xs text-zinc-500 font-mono">{formatTime(log.created_at)}</span>
                                                                    <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} className="text-zinc-600">
                                                                        <ChevronRight className="w-4 h-4" />
                                                                    </motion.div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Expanded Details */}
                                                        <AnimatePresence>
                                                            {isExpanded && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: "auto", opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    className="overflow-hidden border-t border-zinc-800/50 bg-black/20"
                                                                >
                                                                    <div className="p-4 grid grid-cols-2 gap-4 text-xs font-mono">
                                                                        <div className="space-y-1">
                                                                            <span className="text-zinc-500 block uppercase tracking-wider text-[10px]">Previous Value</span>
                                                                            <div className="p-2 bg-red-950/10 border border-red-900/20 text-red-200 rounded min-h-[40px] break-all">
                                                                                {log.old_value ? JSON.stringify(log.old_value, null, 2) : <span className="text-zinc-600 italic">None</span>}
                                                                            </div>
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <span className="text-zinc-500 block uppercase tracking-wider text-[10px]">New Value</span>
                                                                            <div className="p-2 bg-emerald-950/10 border border-emerald-900/20 text-emerald-200 rounded min-h-[40px] break-all">
                                                                                {log.new_value ? JSON.stringify(log.new_value, null, 2) : <span className="text-zinc-600 italic">None</span>}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {!isLoading && logs.length >= limit && (
                    <div className="text-center mt-8 pt-6 border-t border-zinc-800">
                        <button onClick={() => setLimit(prev => prev + 50)} className="px-6 py-2 text-sm text-zinc-400 border border-zinc-800 hover:border-red-600 hover:text-red-400 transition-colors">더 불러오기</button>
                    </div>
                )}
            </div>
        </div>
    );
}

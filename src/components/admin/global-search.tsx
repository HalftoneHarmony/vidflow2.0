"use client";

/**
 * 🔍 Global Search Component
 * 헤더에 통합되는 글로벌 검색 바
 * @author Agent 3 (Analytics Master)
 */

import { useState, useEffect, useRef, useTransition } from "react";
import { Search, X, Loader2, Package, User, Calendar, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { searchOrders } from "@/features/analytics/actions";
import Link from "next/link";

// ==========================================
// Types
// ==========================================

type SearchResult = {
    order_id: number;
    customer_name: string;
    customer_email: string;
    event_title: string;
    package_name: string;
    total_price: number;
    status: string;
    created_at: string;
};

// ==========================================
// Utils
// ==========================================

const currencyFormatter = (value: number) =>
    new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "KRW",
        maximumFractionDigits: 0,
    }).format(value);

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
};

const getStatusColor = (status: string) => {
    switch (status) {
        case "waiting": return "text-yellow-500 bg-yellow-500/10";
        case "shooting": return "text-blue-500 bg-blue-500/10";
        case "editing": return "text-purple-500 bg-purple-500/10";
        case "ready": return "text-green-500 bg-green-500/10";
        case "delivered": return "text-emerald-500 bg-emerald-500/10";
        default: return "text-zinc-500 bg-zinc-500/10";
    }
};

// ==========================================
// Main Component
// ==========================================

export function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isPending, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Keyboard shortcut (Cmd+K / Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Search handler
    const handleSearch = (value: string) => {
        setQuery(value);

        if (value.trim().length < 2) {
            setResults([]);
            return;
        }

        startTransition(async () => {
            const data = await searchOrders(value.trim());
            setResults(data as SearchResult[]);
        });
    };

    const handleClose = () => {
        setIsOpen(false);
        setQuery("");
        setResults([]);
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Search Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors group"
            >
                <Search className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400" />
                <span className="text-sm text-zinc-500 hidden sm:inline">검색...</span>
                <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-500 font-mono">
                    ⌘K
                </kbd>
            </button>

            {/* Search Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                            onClick={handleClose}
                        />

                        {/* Search Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50"
                        >
                            <div className="bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden">
                                {/* Search Input */}
                                <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
                                    {isPending ? (
                                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                    ) : (
                                        <Search className="w-5 h-5 text-zinc-500" />
                                    )}
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={query}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        placeholder="주문, 고객, 이벤트 검색..."
                                        className="flex-1 bg-transparent text-white placeholder:text-zinc-500 outline-none text-base font-[family-name:var(--font-oswald)]"
                                    />
                                    {query && (
                                        <button
                                            onClick={() => { setQuery(""); setResults([]); }}
                                            className="p-1 hover:bg-zinc-800 rounded transition-colors"
                                        >
                                            <X className="w-4 h-4 text-zinc-500" />
                                        </button>
                                    )}
                                    <button
                                        onClick={handleClose}
                                        className="text-xs text-zinc-500 hover:text-white transition-colors"
                                    >
                                        ESC
                                    </button>
                                </div>

                                {/* Results */}
                                <div className="max-h-[400px] overflow-y-auto">
                                    {query.trim().length < 2 ? (
                                        <div className="p-8 text-center text-zinc-500">
                                            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                            <p className="text-sm">2자 이상 입력해주세요</p>
                                            <p className="text-xs text-zinc-600 mt-1">
                                                고객명, 이메일, 이벤트명으로 검색하세요
                                            </p>
                                        </div>
                                    ) : results.length === 0 && !isPending ? (
                                        <div className="p-8 text-center text-zinc-500">
                                            <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                            <p className="text-sm">검색 결과가 없습니다</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-zinc-800">
                                            {results.map((result, index) => (
                                                <motion.div
                                                    key={result.order_id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <Link
                                                        href={`/admin/pipeline?order=${result.order_id}`}
                                                        onClick={handleClose}
                                                        className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-800/50 transition-colors group"
                                                    >
                                                        {/* Order ID Badge */}
                                                        <div className="w-16 h-10 bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-xs font-mono text-zinc-400">
                                                                #{result.order_id}
                                                            </span>
                                                        </div>

                                                        {/* Details */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <User className="w-3 h-3 text-zinc-500" />
                                                                <span className="text-sm font-bold text-white truncate">
                                                                    {result.customer_name}
                                                                </span>
                                                                <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase ${getStatusColor(result.status)}`}>
                                                                    {result.status}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-4 mt-1 text-xs text-zinc-500">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    {result.event_title}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Package className="w-3 h-3" />
                                                                    {result.package_name}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Price & Date */}
                                                        <div className="text-right flex-shrink-0">
                                                            <p className="text-sm font-mono font-bold text-white">
                                                                {currencyFormatter(result.total_price)}
                                                            </p>
                                                            <p className="text-[10px] text-zinc-500">
                                                                {formatDate(result.created_at)}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                {results.length > 0 && (
                                    <div className="px-4 py-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                                        <span>{results.length}개 결과</span>
                                        <span className="flex items-center gap-2">
                                            <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 font-mono">↑↓</kbd>
                                            탐색
                                            <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 font-mono">↵</kbd>
                                            열기
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

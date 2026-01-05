"use client";

import { useState } from "react";
import { Product } from "../queries";
import { PackageCard } from "./PackageCard";
import { GroupedPackageCard } from "./GroupedPackageCard";
import { CreatePackageModal } from "./CreatePackageModal";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductArsenalProps = {
    packages: Product[];
    events: { id: number; title: string; event_date: string }[];
};

export function ProductArsenal({ packages, events }: ProductArsenalProps) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

    const filteredPackages = packages.filter(pkg => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = pkg.name.toLowerCase().includes(term) ||
            (pkg.events?.title?.toLowerCase().includes(term) ?? false);

        const matchesEvent = selectedEventId === null || pkg.event_id === selectedEventId;

        return matchesSearch && matchesEvent;
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">PRODUCT ARSENAL</h1>
                    <p className="text-zinc-500">Manage your sales packages and pricing strategies.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search packages..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="flex-1 md:w-64 bg-zinc-900 border border-zinc-800 rounded px-4 py-2 text-white focus:border-red-500 focus:outline-none"
                    />
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        New Package
                    </button>
                </div>
            </div>

            {/* Event Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                <button
                    onClick={() => setSelectedEventId(null)}
                    className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap",
                        selectedEventId === null
                            ? "bg-white text-black border-white"
                            : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white"
                    )}
                >
                    ALL PRODUCTS
                </button>
                {events.map(event => (
                    <button
                        key={event.id}
                        onClick={() => setSelectedEventId(event.id)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap",
                            selectedEventId === event.id
                                ? "bg-white text-black border-white"
                                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white"
                        )}
                    >
                        {event.title}
                    </button>
                ))}
            </div>

            {filteredPackages.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl">
                    <div className="text-6xl mb-4 opacity-20">📦</div>
                    <p className="text-zinc-500 mb-6">
                        {searchTerm || selectedEventId
                            ? "조건에 맞는 패키지가 없습니다."
                            : "등록된 패키지가 없습니다."}
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="text-red-500 font-bold hover:underline"
                    >
                        {searchTerm || selectedEventId ? "필터를 해제하거나 검색어를 변경하세요" : "첫 번째 패키지를 생성하세요"}
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {selectedEventId === null ? (
                        // Grouped View for "All Products"
                        Object.entries(
                            filteredPackages.reduce((acc, pkg) => {
                                if (!acc[pkg.name]) acc[pkg.name] = [];
                                acc[pkg.name].push(pkg);
                                return acc;
                            }, {} as Record<string, Product[]>)
                        ).map(([name, groupPackages]) => (
                            <GroupedPackageCard
                                key={name}
                                name={name}
                                packages={groupPackages}
                                eventsList={events}
                            />
                        ))
                    ) : (
                        // Grid View for Specific Event
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredPackages.map((pkg) => (
                                <PackageCard
                                    key={pkg.id}
                                    pkg={pkg}
                                    eventsList={events}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {showCreateModal && (
                <CreatePackageModal
                    eventsList={events}
                    onClose={() => setShowCreateModal(false)}
                />
            )}
        </div>
    );
}

"use client";

import { useState } from "react";
import { Product } from "../queries";
import { ChevronDown, ChevronUp, Edit2, Play, Pause, MoreVertical, Layers } from "lucide-react";
import { PackageCard } from "./PackageCard";
import { Badge } from "@/components/ui/badge";

type GroupedPackageCardProps = {
    name: string;
    packages: Product[];
    eventsList: { id: number; title: string; event_date: string; composition_options?: string[] }[];
};

export function GroupedPackageCard({ name, packages, eventsList }: GroupedPackageCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Calculate stats
    const minPrice = Math.min(...packages.map(p => p.price));
    const maxPrice = Math.max(...packages.map(p => p.price));
    const activeCount = packages.filter(p => !p.is_sold_out).length;
    const totalCount = packages.length;

    const commonComposition = packages[0]?.composition || [];

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:border-zinc-700 transition-all">
            {/* Header Section */}
            <div
                className="p-6 cursor-pointer hover:bg-zinc-900/80 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-900/10 rounded-lg text-red-500 hidden sm:block">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-white">{name}</h3>
                                <Badge variant="outline" className="text-[10px] bg-zinc-950 text-zinc-400 border-zinc-800">
                                    {totalCount} VARIANTS
                                </Badge>
                            </div>
                            <div className="text-sm text-zinc-400 font-mono">
                                {minPrice === maxPrice
                                    ? new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(minPrice)
                                    : `${new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(minPrice)} - ${new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(maxPrice)}`
                                }
                            </div>
                            {/* Composition Preview */}
                            <div className="flex flex-wrap gap-1 mt-3">
                                {commonComposition.slice(0, 3).map((comp) => (
                                    <span key={comp} className="px-1.5 py-0.5 bg-zinc-800/50 border border-zinc-800 rounded text-[10px] text-zinc-500">
                                        {comp}
                                    </span>
                                ))}
                                {commonComposition.length > 3 && (
                                    <span className="px-1.5 py-0.5 bg-zinc-800/50 border border-zinc-800 rounded text-[10px] text-zinc-500">
                                        +{commonComposition.length - 3}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 text-right">
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <span className={`w-2 h-2 rounded-full ${activeCount > 0 ? "bg-green-500" : "bg-red-500"}`}></span>
                            <span className={activeCount > 0 ? "text-green-500" : "text-zinc-500"}>
                                {activeCount} Active / {totalCount} Total
                            </span>
                        </div>
                        <button className="text-zinc-500 hover:text-white transition-colors">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Expanded Body: List individual cards */}
            {isExpanded && (
                <div className="border-t border-zinc-800 bg-zinc-950/30 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {packages.map(pkg => (
                            <PackageCard
                                key={pkg.id}
                                pkg={pkg}
                                eventsList={eventsList}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

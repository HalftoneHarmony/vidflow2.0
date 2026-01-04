"use client";

import { useState } from "react";
import { Product } from "../queries";
import { PackageCard } from "./PackageCard";
import { CreatePackageModal } from "./CreatePackageModal";
import { Plus } from "lucide-react";

type ProductArsenalProps = {
    packages: Product[];
    events: { id: number; title: string; event_date: string }[];
};

export function ProductArsenal({ packages, events }: ProductArsenalProps) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredPackages = packages.filter(pkg =>
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.events?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

            {filteredPackages.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl">
                    <div className="text-6xl mb-4 opacity-20">📦</div>
                    <p className="text-zinc-500 mb-6">등록된 패키지가 없습니다.</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="text-red-500 font-bold hover:underline"
                    >
                        첫 번째 패키지를 생성하세요
                    </button>
                </div>
            ) : (
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

            {showCreateModal && (
                <CreatePackageModal
                    eventsList={events}
                    onClose={() => setShowCreateModal(false)}
                />
            )}
        </div>
    );
}

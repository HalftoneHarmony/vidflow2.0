"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PackageWithShowcase } from "../queries";
import { FilterBar } from "./FilterBar";
import { ShowcaseCard } from "./ShowcaseCard";

type GalleryGridProps = {
    packages: PackageWithShowcase[];
};

export function GalleryGrid({ packages }: GalleryGridProps) {
    const [filter, setFilter] = useState("ALL");

    // Extract unique composition types for filters
    const allExampleCompositions = packages.flatMap(p => p.composition);
    const uniqueCompositions = Array.from(new Set(allExampleCompositions)).filter(Boolean); // Clean up
    const filters = ["ALL", ...uniqueCompositions];

    const filteredPackages = packages.filter(p => {
        if (filter === "ALL") return true;
        return p.composition.includes(filter);
    });

    return (
        <div className="w-full">
            <FilterBar
                filters={filters}
                activeFilter={filter}
                onFilterChange={setFilter}
            />

            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4"
            >
                <AnimatePresence mode="popLayout">
                    {filteredPackages.map((pkg) => (
                        <div key={pkg.id}>
                            <ShowcaseCard packageData={pkg} />
                        </div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {filteredPackages.length === 0 && (
                <div className="text-center py-20 border border-zinc-900 rounded-xl bg-zinc-900/30">
                    <p className="text-zinc-500 text-lg font-mono">NO PACKAGES FOUND</p>
                </div>
            )}
        </div>
    );
}

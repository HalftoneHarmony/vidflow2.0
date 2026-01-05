"use client";

import { motion } from "framer-motion";

type FilterBarProps = {
    filters: string[];
    activeFilter: string;
    onFilterChange: (filter: string) => void;
};

export function FilterBar({ filters, activeFilter, onFilterChange }: FilterBarProps) {
    return (
        <div className="flex flex-wrap justify-center gap-2 mb-12">
            {filters.map((filter) => (
                <button
                    key={filter}
                    onClick={() => onFilterChange(filter)}
                    className={`relative px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-colors z-10 ${activeFilter === filter ? "text-black" : "text-white hover:text-red-400"
                        }`}
                >
                    {activeFilter === filter && (
                        <motion.div
                            layoutId="activeFilter"
                            className="absolute inset-0 bg-white rounded-full z-[-1]"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    )}
                    {filter.replace(/_/g, " ")}
                </button>
            ))}
        </div>
    );
}

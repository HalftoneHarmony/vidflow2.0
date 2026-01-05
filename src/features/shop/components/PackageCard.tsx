"use client";

import { motion } from "framer-motion";
import { Check, Play, Package as PackageIcon } from "lucide-react";
import { PackageWithShowcase } from "@/features/showcase/queries";

type PackageCardProps = {
    package_: PackageWithShowcase;
    isSelected?: boolean;
    onSelect?: (packageId: number) => void;
};

function formatPrice(price: number): string {
    return new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "KRW",
        maximumFractionDigits: 0,
    }).format(price);
}

const COMPOSITION_ICONS: Record<string, string> = {
    MAIN_VIDEO: "🎬",
    SHORTS: "📱",
    PHOTO_ZIP: "📸",
    HIGHLIGHT: "✨",
    RAW_FOOTAGE: "🎥",
};

export function PackageCard({ package_: pkg, isSelected, onSelect }: PackageCardProps) {
    const bestCutMedia = pkg.showcase_items.find((item) => item.is_best_cut);

    return (
        <motion.div
            layout
            onClick={() => !pkg.is_sold_out && onSelect?.(pkg.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={!pkg.is_sold_out ? { y: -8, rotateX: 2, scale: 1.02 } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`
                relative group cursor-pointer 
                bg-zinc-900 border-2 rounded-xl overflow-hidden
                ${isSelected
                    ? "border-red-500 shadow-[0_10px_40px_-10px_rgba(220,38,38,0.5)] z-10"
                    : "border-zinc-800 hover:border-zinc-600 shadow-lg"
                }
                ${pkg.is_sold_out ? "opacity-60 grayscale cursor-not-allowed" : ""}
            `}
        >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-zinc-950 overflow-hidden">
                {bestCutMedia?.thumbnail_url ? (
                    <motion.img
                        src={bestCutMedia.thumbnail_url}
                        alt={pkg.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700 bg-zinc-900">
                        <PackageIcon className="w-16 h-16 opacity-20" />
                    </div>
                )}

                {/* Play Overlay */}
                {bestCutMedia?.type === "VIDEO" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            className="w-16 h-16 rounded-full bg-red-600/90 backdrop-blur-sm flex items-center justify-center"
                        >
                            <Play className="w-8 h-8 text-white ml-1 fill-white" />
                        </motion.div>
                    </div>
                )}

                {/* Sold Out Badge */}
                {pkg.is_sold_out && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-[2px]">
                        <span className="text-3xl font-black text-red-500 tracking-widest border-4 border-red-500 px-6 py-2 -rotate-12 uppercase">
                            Sold Out
                        </span>
                    </div>
                )}

                {/* Selected Indicator */}
                <motion.div
                    initial={false}
                    animate={{
                        scale: isSelected ? 1 : 0,
                        opacity: isSelected ? 1 : 0
                    }}
                    className="absolute top-4 right-4 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                >
                    <Check className="w-5 h-5 stroke-[3px]" />
                </motion.div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white tracking-tight pr-4">
                        {pkg.name}
                    </h3>
                    <div className="text-right">
                        <span className={`block text-2xl font-black ${isSelected ? "text-red-500 scale-110" : "text-white"} transition-all duration-300`}>
                            {formatPrice(pkg.price)}
                        </span>
                    </div>
                </div>

                {pkg.description && (
                    <p className="text-sm text-zinc-400 mb-6 line-clamp-2 min-h-[40px]">
                        {pkg.description}
                    </p>
                )}

                {/* Features Pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {pkg.composition.map((item, idx) => (
                        <span
                            key={`${item}-${idx}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold bg-zinc-800 text-zinc-300 rounded border border-zinc-700/50"
                        >
                            <span>{COMPOSITION_ICONS[item] || "📦"}</span>
                            <span>{item.replace(/_/g, " ")}</span>
                        </span>
                    ))}
                </div>

                {/* Action Button - Morphing */}
                <motion.button
                    disabled={pkg.is_sold_out}
                    className={`
                        w-full py-4 text-sm font-bold uppercase tracking-wider rounded-lg overflow-hidden relative
                        ${pkg.is_sold_out
                            ? "bg-zinc-800 text-zinc-500"
                            : isSelected
                                ? "bg-red-600 text-white"
                                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        }
                    `}
                    animate={isSelected ? { scale: 0.98 } : { scale: 1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <motion.div
                        initial={false}
                        animate={{ y: isSelected ? -30 : 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="h-5 flex items-center justify-center w-full"
                    >
                        {!pkg.is_sold_out ? "선택하기" : "품절"}
                    </motion.div>

                    <motion.div
                        initial={{ y: 30 }}
                        animate={{ y: isSelected ? -20 : 30 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="absolute inset-0 flex items-center justify-center gap-2"
                    >
                        <Check className="w-5 h-5" />
                        <span>선택됨</span>
                    </motion.div>
                </motion.button>
            </div>
        </motion.div>
    );
}

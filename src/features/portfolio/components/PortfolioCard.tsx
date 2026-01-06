
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PortfolioItem } from "../queries";
import { Play, ExternalLink } from "lucide-react";

type PortfolioCardProps = {
    item: PortfolioItem;
};

export function PortfolioCard({ item }: PortfolioCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    // Determine if we can show a video preview (only if direct file, unlikely given sample data uses embeds)
    // So we primarily rely on thumbnail.

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="group relative aspect-video bg-zinc-900 rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-red-900/20 transition-all duration-500 border border-zinc-800 hover:border-red-500/50"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => window.open(item.video_url, '_blank')}
        >
            {/* Thumbnail Layer */}
            {item.thumbnail_url ? (
                <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-700 font-mono text-sm bg-zinc-900">
                    NO THUMBNAIL
                </div>
            )}

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

            {/* Play Icon / Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                <div className="w-16 h-16 rounded-full bg-red-600/90 flex items-center justify-center backdrop-blur-sm shadow-xl shadow-red-900/40">
                    <Play className="w-8 h-8 text-white ml-1 fill-white" />
                </div>
            </div>

            {/* Info Slide-up */}
            <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/10 text-white backdrop-blur-md border border-white/10">
                            {item.category}
                        </span>
                        {item.client_name && (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                {item.client_name}
                            </span>
                        )}
                    </div>

                    <h3 className="text-white font-bold text-xl md:text-2xl leading-tight line-clamp-1 group-hover:text-red-500 transition-colors">
                        {item.title}
                    </h3>

                    {item.description && (
                        <p className="text-zinc-400 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 mt-2">
                            {item.description}
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

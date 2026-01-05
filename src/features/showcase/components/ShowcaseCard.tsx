"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { PackageWithShowcase } from "../queries";
import Link from "next/link";

type ShowcaseCardProps = {
    packageData: PackageWithShowcase;
};

function formatPrice(price: number): string {
    return new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "KRW",
        maximumFractionDigits: 0,
    }).format(price);
}

export function ShowcaseCard({ packageData }: ShowcaseCardProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Find best media (prefer video)
    const bestMedia = packageData.showcase_items.find(item => item.is_best_cut) || packageData.showcase_items[0];
    const isVideo = bestMedia?.type === "VIDEO";

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (isVideo && videoRef.current) {
            videoRef.current.play().catch(() => {
                // Autoplay interactions might be blocked
            });
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (isVideo && videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    return (
        <Link href={`/showcase/${packageData.id}`} className="block">
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="group relative aspect-video bg-zinc-900 rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-red-900/20 transition-all duration-500 border border-zinc-800 hover:border-red-500/50"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Media Layer */}
                {bestMedia ? (
                    <>
                        <img
                            src={bestMedia.thumbnail_url || bestMedia.media_url || ""}
                            alt={packageData.name}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered && isVideo ? "opacity-0" : "opacity-100"}`}
                        />
                        {isVideo && (
                            <video
                                ref={videoRef}
                                src={bestMedia.media_url}
                                muted
                                loop
                                playsInline
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 bg-black ${isHovered ? "opacity-100" : "opacity-0"}`}
                            />
                        )}
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-700 font-mono text-sm">
                        NO MEDIA
                    </div>
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Info Slide-up */}
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                    <div className="flex justify-between items-end">
                        <div>
                            <h3 className="text-white font-black text-xl md:text-2xl uppercase tracking-tighter mb-1">
                                {packageData.name}
                            </h3>
                            <p className="text-zinc-400 text-sm line-clamp-1">{packageData.description}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-red-500 font-bold font-mono text-lg">{formatPrice(packageData.price)}</p>
                        </div>
                    </div>
                </div>

                {/* Sold Out Overlay */}
                {packageData.is_sold_out && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-10 pointer-events-none">
                        <span className="text-3xl md:text-4xl font-black text-zinc-600 tracking-widest uppercase border-4 border-zinc-600 px-4 py-2 rotate-[-12deg]">
                            Sold Out
                        </span>
                    </div>
                )}
            </motion.div>
        </Link>
    );
}

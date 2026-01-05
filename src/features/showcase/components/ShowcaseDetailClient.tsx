"use client";

import { useState } from "react";
import { PackageWithShowcase, ShowcaseItem } from "../queries";
import Link from "next/link";
import { motion } from "framer-motion";

type ShowcaseDetailClientProps = {
    packageData: PackageWithShowcase;
};

export function ShowcaseDetailClient({ packageData }: ShowcaseDetailClientProps) {
    // Find videos and images separately
    const videos = packageData.showcase_items.filter(item => item.type === "VIDEO");
    const images = packageData.showcase_items.filter(item => item.type === "IMAGE");

    // Default to best cut video, or first video, or nothing
    const [activeMedia, setActiveMedia] = useState<ShowcaseItem | null>(
        videos.find(v => v.is_best_cut) || videos[0] || images[0] || null
    );

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("ko-KR", {
            style: "currency",
            currency: "KRW",
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="min-h-screen bg-black text-white relative">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black pointer-events-none" />

            {/* Back Button */}
            <div className="absolute top-8 left-8 z-50">
                <Link
                    href="/showcase"
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
                >
                    <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="font-bold uppercase tracking-widest text-sm">Back to Gallery</span>
                </Link>
            </div>

            <div className="container mx-auto px-4 py-32 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left: Main Cinematic Player (8 cols) */}
                    <div className="lg:col-span-8">
                        <div className="aspect-video bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl shadow-black border border-zinc-800 relative group">
                            {activeMedia?.type === "VIDEO" ? (
                                <video
                                    key={activeMedia.media_url}
                                    src={activeMedia.media_url}
                                    className="w-full h-full object-contain bg-black"
                                    controls
                                    autoPlay
                                    playsInline
                                />
                            ) : activeMedia?.type === "IMAGE" ? (
                                <img
                                    src={activeMedia.media_url}
                                    alt="Showcase Detail"
                                    className="w-full h-full object-contain bg-black"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                    NO MEDIA
                                </div>
                            )}
                        </div>

                        {/* Thumbnails / Playlist if multiple items */}
                        {(videos.length > 1 || images.length > 0) && (
                            <div className="mt-6 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                {[...videos, ...images].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveMedia(item)}
                                        className={`shrink-0 w-32 aspect-video rounded-lg overflow-hidden border-2 transition-all ${activeMedia?.id === item.id
                                                ? "border-red-500 shadow-lg shadow-red-900/20 scale-105"
                                                : "border-zinc-800 opacity-60 hover:opacity-100 hover:scale-105"
                                            }`}
                                    >
                                        <img
                                            src={item.thumbnail_url || item.media_url}
                                            alt="Thumbnail"
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info & Details (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col h-full">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-[0.9]">
                                {packageData.name}
                            </h1>

                            <div className="flex items-center gap-4 mb-8">
                                <span className="text-3xl font-mono text-red-500 font-bold">
                                    {formatPrice(packageData.price)}
                                </span>
                                {packageData.is_sold_out && (
                                    <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-widest border border-zinc-700">
                                        Sold Out
                                    </span>
                                )}
                            </div>

                            <p className="text-zinc-400 text-lg leading-relaxed mb-8 border-l-2 border-zinc-800 pl-4">
                                {packageData.description}
                            </p>

                            {/* Composition / Included Items */}
                            <div className="mb-8">
                                <h3 className="text-sx font-bold text-zinc-500 uppercase tracking-widest mb-4">Included In Package</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {packageData.composition.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded border border-zinc-800/50">
                                            <div className="w-1 h-8 bg-red-500/50 rounded-full" />
                                            <span className="font-bold text-zinc-200">{item.replace(/_/g, " ")}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Specs */}
                            {packageData.specs && (
                                <div className="mb-12">
                                    <h3 className="text-sx font-bold text-zinc-500 uppercase tracking-widest mb-4">Specifications</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(packageData.specs).map(([key, value]) => (
                                            <div key={key}>
                                                <p className="text-xs text-zinc-600 uppercase mb-1">{key}</p>
                                                <p className="text-sm font-medium text-zinc-300">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CTA Button */}
                            <button
                                disabled={packageData.is_sold_out}
                                className={`w-full py-5 text-xl font-black uppercase tracking-widest transition-all clip-path-slant ${packageData.is_sold_out
                                        ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                        : "bg-red-600 hover:bg-white hover:text-black text-white"
                                    }`}
                            >
                                {packageData.is_sold_out ? "Sold Out" : "Purchase License"}
                            </button>

                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

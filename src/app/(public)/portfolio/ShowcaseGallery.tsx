"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, ExternalLink, Maximize2 } from "lucide-react";
import Image from "next/image"; // Note: Might need unoptimized if external domains strictly blocked, but usually okay.

interface ShowcaseItem {
    id: number;
    title: string;
    description: string | null;
    video_url: string;
    thumbnail_url: string | null;
    category: string | null;
    client_name: string | null;
    tags: string[] | null;
}

interface Props {
    items: ShowcaseItem[];
    categories: string[];
}

export function ShowcaseGallery({ items, categories }: Props) {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedVideo, setSelectedVideo] = useState<ShowcaseItem | null>(null);

    const filteredItems = selectedCategory === "All"
        ? items
        : items.filter(item => item.category === selectedCategory);

    // Helper to extract embed URL
    const getEmbedUrl = (url: string) => {
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
            const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
            return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url;
        }
        if (url.includes("vimeo.com")) {
            const match = url.match(/vimeo\.com\/(\d+)/);
            return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1` : url;
        }
        return url; // Fallback for direct links or other players
    };

    return (
        <div className="space-y-12">
            {/* Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-2">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === category
                            ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105"
                            : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800"
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Gallery Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="group relative aspect-video bg-zinc-900 rounded-xl overflow-hidden cursor-pointer border border-zinc-800 hover:border-zinc-600 transition-colors"
                            onClick={() => setSelectedVideo(item)}
                        >
                            {/* Thumbnail */}
                            {item.thumbnail_url ? (
                                <div className="relative w-full h-full">
                                    <img // Using img for simplicity with external URLs without config
                                        src={item.thumbnail_url}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
                                    <Play className="w-12 h-12 text-zinc-600" />
                                </div>
                            )}

                            {/* Overlay Content */}
                            <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                                <div className="transform md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">{item.category}</span>
                                        <Play className="w-8 h-8 text-white fill-white opacity-80" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{item.title}</h3>
                                    {item.client_name && (
                                        <p className="text-sm text-zinc-400 mb-2">{item.client_name}</p>
                                    )}
                                    {item.description && (
                                        <p className="text-sm text-zinc-300 line-clamp-2 hidden md:block">{item.description}</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {filteredItems.length === 0 && (
                <div className="text-center py-20 text-zinc-500">
                    <p>No works found in this category yet.</p>
                </div>
            )}

            {/* Video Modal */}
            <AnimatePresence>
                {selectedVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-8"
                        onClick={() => setSelectedVideo(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-6xl bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10 pointer-events-none">
                                <div />
                                <button
                                    onClick={() => setSelectedVideo(null)}
                                    className="pointer-events-auto p-2 bg-black/50 rounded-full text-white hover:bg-white hover:text-black transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Video Player Embed */}
                            <div className="relative aspect-video bg-black">
                                <iframe
                                    src={getEmbedUrl(selectedVideo.video_url)}
                                    className="absolute inset-0 w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>

                            {/* Info Section */}
                            <div className="p-6 md:p-8 bg-zinc-900">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-xs font-semibold uppercase">{selectedVideo.category}</span>
                                            {selectedVideo.client_name && (
                                                <span className="text-zinc-500 text-sm">Client: {selectedVideo.client_name}</span>
                                            )}
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{selectedVideo.title}</h2>
                                        <p className="text-zinc-400 leading-relaxed max-w-3xl">{selectedVideo.description}</p>

                                        {selectedVideo.tags && selectedVideo.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-6">
                                                {selectedVideo.tags.map(tag => (
                                                    <span key={tag} className="text-xs text-zinc-500">#{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions / Links */}
                                    <div className="flex gap-4">
                                        <a
                                            href={selectedVideo.video_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-bold hover:bg-zinc-200 transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Watch on Site
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

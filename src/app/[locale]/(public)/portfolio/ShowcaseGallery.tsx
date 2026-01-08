"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, ArrowUpRight, Maximize2 } from "lucide-react";
import { useTranslations } from "next-intl";

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
    const [hoveredId, setHoveredId] = useState<number | null>(null);

    // Translations
    const t = useTranslations("Portfolio");
    const tCommon = useTranslations("Common");

    // Filter items
    const filteredItems = useMemo(() => {
        return selectedCategory === "All"
            ? items
            : items.filter((item) => item.category === selectedCategory);
    }, [items, selectedCategory]);

    // Calculate grid classes for "Bento" / Masonry feel
    // We'll use a deterministic pattern based on index to create visual variety
    const getGridClass = (index: number) => {
        // Pattern: Big, Small, Small, Wide, Small, Small...
        const patternIndex = index % 10;
        switch (patternIndex) {
            case 0: return "md:col-span-2 md:row-span-2"; // Big Feature
            case 3: return "md:col-span-2"; // Wide
            case 6: return "md:row-span-2"; // Tall (if image supports, otherwise just big) -> actually for 16:9 video, row-span-2 might crop too much. Let's stick to col-spans mostly or 2x2.
            case 7: return "md:col-span-2 md:row-span-2";
            default: return "md:col-span-1 md:row-span-1";
        }
    };

    const getEmbedUrl = (url: string) => {
        if (!url) return "";
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
            const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
            return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&modestbranding=1&rel=0` : url;
        }
        if (url.includes("vimeo.com")) {
            const match = url.match(/vimeo\.com\/(\d+)/);
            return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1` : url;
        }
        return url;
    };

    return (
        <div className="min-h-screen bg-black">
            {/* Sticky Header / Filter - Minimalist floating */}
            <div className="sticky top-0 z-40 w-full px-6 py-4 bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none">
                <div className="flex items-center justify-between pointer-events-auto">
                    <h1 className="text-xl font-bold tracking-tighter text-white mix-blend-difference hidden md:block">
                        VIDFLOW<span className="text-zinc-500">.{t('gallery')}</span>
                    </h1>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide bg-black/50 backdrop-blur-md rounded-full p-1 border border-white/10">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${selectedCategory === category
                                    ? "bg-white text-black shadow-lg"
                                    : "text-zinc-400 hover:text-white hover:bg-white/10"
                                    }`}
                            >
                                {category === "All" ? t('filter_all') : category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* The Wall - Dense Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-1 p-1 md:p-2 auto-rows-[200px] md:auto-rows-[250px]"
            >
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className={`relative group bg-zinc-900 overflow-hidden cursor-pointer ${getGridClass(index)}`}
                            onMouseEnter={() => setHoveredId(item.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            onClick={() => setSelectedVideo(item)}
                        >
                            {/* Image */}
                            {item.thumbnail_url ? (
                                <motion.img
                                    src={item.thumbnail_url}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                    <div className="text-zinc-700 font-bold uppercase tracking-widest text-center px-4">
                                        {item.title}
                                    </div>
                                </div>
                            )}

                            {/* Dark Gradient Overlay - Always present slightly, stronger on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                            {/* Hover Info */}
                            <div className="absolute inset-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <motion.div
                                    initial={{ y: 20 }}
                                    animate={hoveredId === item.id ? { y: 0 } : { y: 20 }}
                                    className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                                >
                                    <span className="inline-block px-2 py-1 mb-2 text-[10px] font-bold uppercase tracking-widest bg-white text-black">
                                        {item.category}
                                    </span>
                                    <h3 className="text-lg md:text-2xl font-black text-white leading-tight drop-shadow-md">
                                        {item.title}
                                    </h3>
                                    {item.client_name && (
                                        <p className="text-zinc-300 text-xs font-mono mt-1">{item.client_name}</p>
                                    )}
                                </motion.div>
                            </div>

                            {/* Center Play Icon - shows on hover */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                                    <Play className="w-6 h-6 text-white fill-white" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Footer area check */}
            {filteredItems.length === 0 && (
                <div className="h-[50vh] flex items-center justify-center text-zinc-500">
                    <p>{t('no_works')}</p>
                </div>
            )}

            {/* Video Modal - Full Screen Immersive */}
            <AnimatePresence>
                {selectedVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedVideo(null)}
                            className="absolute top-6 right-6 z-50 p-4 group"
                        >
                            <X className="w-8 h-8 text-zinc-500 group-hover:text-white transition-colors" />
                        </button>

                        <div className="w-full h-full flex flex-col md:flex-row">
                            {/* Main Video Area */}
                            <div className="flex-1 h-[50vh] md:h-full bg-black relative flex items-center justify-center">
                                <iframe
                                    src={getEmbedUrl(selectedVideo.video_url)}
                                    className="absolute inset-0 w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>

                            {/* Sidebar Info (Bottom on mobile, Right on desktop) */}
                            <div className="md:w-[400px] h-[50vh] md:h-full bg-zinc-950 border-l border-zinc-900 p-8 md:p-12 flex flex-col justify-center overflow-y-auto">
                                <div className="space-y-8">
                                    <div>
                                        <span className="text-red-500 font-mono text-xs uppercase tracking-widest mb-2 block">
                                            {t('selected_work')}
                                        </span>
                                        <h2 className="text-3xl md:text-4xl font-black text-white leading-none">
                                            {selectedVideo.title}
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="border-t border-zinc-800 pt-4">
                                            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">{t('client')}</p>
                                            <p className="text-white">{selectedVideo.client_name || t('internal_production')}</p>
                                        </div>
                                        <div className="border-t border-zinc-800 pt-4">
                                            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">{t('category')}</p>
                                            <p className="text-white">{selectedVideo.category}</p>
                                        </div>
                                    </div>

                                    {selectedVideo.description && (
                                        <p className="text-zinc-400 leading-relaxed text-sm md:text-base border-t border-zinc-800 pt-4">
                                            {selectedVideo.description}
                                        </p>
                                    )}

                                    <a
                                        href={selectedVideo.video_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-white hover:text-red-500 transition-colors font-bold uppercase tracking-wider text-sm mt-8"
                                    >
                                        {t('open_original')} <ArrowUpRight className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

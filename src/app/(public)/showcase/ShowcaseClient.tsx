"use client";

import { useState } from "react";
import { PackageWithShowcase, ShowcaseItem } from "@/features/showcase/queries";
import { PackageCard } from "@/features/showcase/components";

type ShowcaseClientProps = {
    eventName: string;
    packages: PackageWithShowcase[];
    settings?: {
        sidebarTitle: string;
        selectPackage: string;
        playing: string;
        noVideo: string;
        detailsPlaceholder: string;
    };
};

export function ShowcaseClient({ eventName, packages, settings }: ShowcaseClientProps) {
    const sortedPackages = [...packages].sort((a, b) => a.price - b.price);
    const [activePackageId, setActivePackageId] = useState<number>(sortedPackages[0]?.id || 0);

    const activePackage = packages.find((p) => p.id === activePackageId);

    // Get the best video for the active package
    const activeVideo = activePackage?.showcase_items.find((item) => item.type === "VIDEO")?.media_url;

    // Helper to determine if video is YouTube
    const isYouTube = (url: string) => {
        return url.includes("youtube.com") || url.includes("youtu.be");
    };

    const getYouTubeEmbedUrl = (url: string) => {
        let videoId = "";
        if (url.includes("youtu.be")) {
            videoId = url.split("/").pop() || "";
        } else if (url.includes("v=")) {
            videoId = url.split("v=")[1].split("&")[0];
        } else if (url.includes("embed")) {
            return url;
        }
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`;
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("ko-KR", {
            style: "currency",
            currency: "KRW",
            maximumFractionDigits: 0,
        }).format(price);
    };

    // Defaults in case settings are missing
    const t = {
        sidebarTitle: settings?.sidebarTitle || "CHOOSE STAGE",
        selectPackage: settings?.selectPackage || "Select Package",
        playing: settings?.playing || "PLAYING",
        noVideo: settings?.noVideo || "재생할 영상이 없습니다.",
        detailsPlaceholder: settings?.detailsPlaceholder || "Package details...",
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)] gap-6">

            {/* Left: Main Player (Flex Grow) */}
            <div className="flex-1 bg-black rounded-xl overflow-hidden relative shadow-2xl border border-zinc-800">
                {activeVideo ? (
                    isYouTube(activeVideo) ? (
                        <iframe
                            src={getYouTubeEmbedUrl(activeVideo)}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <video
                            key={activeVideo}
                            src={activeVideo}
                            className="w-full h-full object-contain bg-black"
                            controls
                            autoPlay
                            playsInline
                        />
                    )
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-zinc-950">
                        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>{t.noVideo}</p>
                    </div>
                )}

                {/* Overlay Info (Optional, floats on video) */}
                <div className="absolute top-6 left-6 z-10">
                    <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded border-l-4 border-red-500">
                        <h2 className="text-white font-bold text-xl uppercase tracking-wider">
                            {activePackage ? activePackage.name : t.selectPackage}
                        </h2>
                        <p className="text-zinc-300 text-sm">{eventName}</p>
                    </div>
                </div>
            </div>

            {/* Right: Sidebar List (Fixed Width) */}
            <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">

                <h3 className="text-lg font-black text-white italic uppercase flex items-center gap-2 mb-2 sticky top-0 bg-[#0a0a0a] z-20 py-2">
                    <span className="w-1 h-5 bg-red-500"></span>
                    {t.sidebarTitle}
                </h3>

                {sortedPackages.map((pkg) => {
                    const isActive = activePackageId === pkg.id;
                    return (
                        <button
                            key={pkg.id}
                            onClick={() => setActivePackageId(pkg.id)}
                            className={`
                                text-left p-4 rounded-lg border transition-all duration-200 group relative overflow-hidden
                                ${isActive
                                    ? "bg-zinc-900 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                                    : "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700"}
                            `}
                        >
                            {/* Active Indicator Strip */}
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 animate-pulse" />}

                            <div className="flex justify-between items-start mb-1">
                                <span className={`font-bold text-lg uppercase tracking-tight ${isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                                    {pkg.name}
                                </span>
                                {isActive && <span className="text-red-500 text-xs font-bold animate-pulse">{t.playing}</span>}
                            </div>

                            <p className="text-xs text-zinc-500 mb-3 line-clamp-2">
                                {pkg.description || t.detailsPlaceholder}
                            </p>

                            <div className={`font-mono font-bold text-right ${isActive ? "text-red-400" : "text-zinc-500"}`}>
                                {formatPrice(pkg.price)}
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    );
}


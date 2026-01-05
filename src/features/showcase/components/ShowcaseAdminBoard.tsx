"use client";

import { useState, useEffect } from "react";
import { Product } from "@/features/products/queries";
import { upsertShowcaseVideo } from "@/features/showcase/actions";
import { getSetting, upsertSetting } from "@/features/settings/actions";
import { Search, Save, Film, ExternalLink, PlayCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * 🎬 Showcase Admin Board
 * Manage showcase videos for packages and page settings
 */

type ShowcaseAdminBoardProps = {
    packages: Product[];
};

// Drag and Drop Imports
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ... existing imports ... (Search, Save, Film, ExternalLink, PlayCircle, Loader2 already imported)
import { GripVertical } from "lucide-react";


// Package Card UI Component (Pure Presentation)
function PackageCardUI({ pkg, isEditing, editingId, editUrl, setEditUrl, handleSave, setEditingId, handleEditStart, hasVideo, videoItem, isYouTube, dragAttributes, dragListeners, style, isDragging, wrapperRef }: any) {
    return (
        <div
            ref={wrapperRef}
            style={style}
            className={`
                    group relative bg-zinc-900 border rounded-xl overflow-hidden transition-all
                    ${hasVideo ? "border-zinc-800 hover:border-zinc-600" : "border-zinc-800/50 opacity-80 hover:opacity-100 hover:border-red-900/50"}
                    ${isDragging ? "shadow-2xl shadow-red-500/20 scale-105 ring-2 ring-red-500 cursor-grabbing bg-zinc-800" : ""}
                `}
        >
            {/* Drag Handle */}
            <div
                {...dragAttributes}
                {...dragListeners}
                className="absolute top-2 left-2 z-20 p-2 text-zinc-600 hover:text-white cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                onPointerDown={(e) => {
                    // Ensure we don't trigger drag when clicking other interactive elements logic if needed
                    dragListeners?.onPointerDown(e);
                }}
            >
                <GripVertical className="w-5 h-5" />
            </div>

            {/* Status Stripe */}
            <div className={`h-1 w-full ${hasVideo ? "bg-red-500" : "bg-zinc-800"}`} />

            <div className="p-4">
                <div className="flex items-start justify-between mb-4 pl-6">
                    <div>
                        <div className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1 mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            PACKAGE
                        </div>
                        <h3 className="text-2xl font-black text-white leading-tight tracking-tight uppercase">{pkg.name}</h3>
                    </div>
                    <div className={`
                            p-2 rounded-lg
                            ${hasVideo ? "bg-red-500/10 text-red-500" : "bg-zinc-800 text-zinc-600"}
                        `}>
                        <Film className="w-5 h-5" />
                    </div>
                </div>

                {/* Video Preview / Input Area */}
                <div className="space-y-3">
                    {isEditing ? (
                        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <label className="text-xs font-bold text-zinc-500 block mb-1">Video URL</label>
                            <div className="flex gap-2">
                                <input
                                    autoFocus
                                    type="text"
                                    value={editUrl}
                                    onChange={(e) => setEditUrl(e.target.value)}
                                    placeholder="YouTube or File URL..."
                                    className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-red-500 outline-none"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSave(pkg.id);
                                        if (e.key === 'Escape') setEditingId(null);
                                    }}
                                    onPointerDown={(e) => e.stopPropagation()}
                                />
                                <button
                                    onClick={() => handleSave(pkg.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white rounded px-3 py-2"
                                >
                                    <Save className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-[10px] text-zinc-600 mt-2">
                                Press Enter to save, Esc to cancel. Leave empty to delete.
                            </p>
                        </div>
                    ) : (
                        <div
                            onClick={() => handleEditStart(pkg)}
                            className="relative aspect-video bg-zinc-950 rounded border border-zinc-800 overflow-hidden cursor-pointer group/preview"
                        >
                            {hasVideo ? (
                                <>
                                    {isYouTube(videoItem!.media_url) ? (
                                        <img
                                            src={`https://img.youtube.com/vi/${videoItem!.media_url.split('v=')[1]?.split('&')[0] || videoItem!.media_url.split('/').pop()}/mqdefault.jpg`}
                                            alt="Preview"
                                            className="w-full h-full object-cover opacity-50 group-hover/preview:opacity-100 transition-opacity"
                                        />
                                    ) : (
                                        <video
                                            src={videoItem!.media_url}
                                            className="w-full h-full object-cover opacity-50 group-hover/preview:opacity-100 transition-opacity"
                                        />
                                    )}

                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <PlayCircle className="w-10 h-10 text-white opacity-80 group-hover/preview:scale-110 transition-transform shadow-xl" />
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 group-hover/preview:text-zinc-500 transition-colors">
                                    <Film className="w-8 h-8 mb-2" />
                                    <span className="text-xs font-bold">NO VIDEO</span>
                                </div>
                            )}

                            <div className="absolute top-2 right-2 opacity-0 group-hover/preview:opacity-100 transition-opacity">
                                <span className="bg-black/70 text-white text-[10px] px-2 py-1 rounded font-bold backdrop-blur-sm">
                                    EDIT
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Link Display (Non-editing) */}
                    {!isEditing && hasVideo && (
                        <a
                            href={videoItem!.media_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-500 transition-colors truncate mt-2"
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{videoItem!.media_url}</span>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

// Sortable Wrapper
function SortablePackageCard(props: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: props.pkg.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : "auto",
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <PackageCardUI
            {...props}
            dragAttributes={attributes}
            dragListeners={listeners}
            style={style}
            isDragging={isDragging}
            wrapperRef={setNodeRef}
        />
    );
}

export function ShowcaseAdminBoard({ packages }: ShowcaseAdminBoardProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<"ALL" | "HAS_VIDEO" | "NO_VIDEO">("ALL");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editUrl, setEditUrl] = useState("");

    // Settings State
    const [pageTitle, setPageTitle] = useState("");
    const [pageDesc, setPageDesc] = useState("");
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);

    // Local State for Ordered Packages
    const [orderedPackages, setOrderedPackages] = useState<Product[]>([]);
    const [activeId, setActiveId] = useState<number | null>(null); // For Drag Overlay

    // Load initial settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const title = await getSetting('showcase_title');
                const desc = await getSetting('showcase_desc');
                if (title) setPageTitle(title);
                if (desc) setPageDesc(desc);
            } catch (error) {
                console.error("Failed to load settings", error);
            } finally {
                setIsLoadingSettings(false);
            }
        };
        loadSettings();
    }, []);

    // Initialize ordered packages from props (Unique logic)
    useEffect(() => {
        const uniquePackages = packages.reduce((acc, current) => {
            const existing = acc.find(p => p.name === current.name);
            if (!existing) {
                acc.push(current);
            } else {
                if (current.id > existing.id) {
                    const index = acc.indexOf(existing);
                    acc[index] = current;
                }
            }
            return acc;
        }, [] as Product[]);
        setOrderedPackages(uniquePackages);
    }, [packages]);

    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        try {
            await upsertSetting('showcase_title', pageTitle);
            await upsertSetting('showcase_desc', pageDesc);
            toast.success("Page settings saved!", {
                className: "bg-green-500 text-white border-none",
                description: "Your showcase page has been updated."
            });
        } catch (error) {
            console.error(error);
            alert("Failed to save settings");
        } finally {
            setIsSavingSettings(false);
        }
    };

    const filteredPackages = orderedPackages.filter(pkg => {
        const hasVideo = pkg.showcase_items && pkg.showcase_items.some(item => item.type === "VIDEO");
        const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === "ALL" ||
            (filter === "HAS_VIDEO" && hasVideo) ||
            (filter === "NO_VIDEO" && !hasVideo);
        return matchesSearch && matchesFilter;
    });

    const handleEditStart = (pkg: Product) => {
        const currentVideo = pkg.showcase_items?.find(item => item.type === "VIDEO")?.media_url || "";
        setEditingId(pkg.id);
        setEditUrl(currentVideo);
    };

    const handleSave = async (pkgId: number) => {
        try {
            const result = await upsertShowcaseVideo(pkgId, editUrl);
            if (result.success) {
                setEditingId(null);
                toast.success("Video updated");
            } else {
                alert("Failed to update video: " + result.error);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        }
    };

    const isYouTube = (url: string) => {
        return url.includes("youtube.com") || url.includes("youtu.be");
    };

    // Drag and Drop Handlers
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(Number(event.active.id));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setOrderedPackages((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
            toast.success("Order updated visually", { description: "Note: Backend persistence not implemented yet." });
        }
        setActiveId(null);
    };

    const activePackage = activeId ? orderedPackages.find(p => p.id === activeId) : null;

    return (
        <div className="space-y-8">
            {/* 1. Global Page Settings & Header */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-red-500 rounded-sm"></span>
                        Showcase Page Settings
                    </h2>
                    <button
                        onClick={handleSaveSettings}
                        disabled={isSavingSettings || isLoadingSettings}
                        className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded font-bold hover:bg-zinc-200 disabled:opacity-50 transition-colors"
                    >
                        {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Settings
                    </button>
                </div>

                {isLoadingSettings ? (
                    <div className="py-8 text-center text-zinc-500">Loading settings...</div>
                ) : (
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-bold text-zinc-400 mb-1">Page Title</label>
                            <input
                                type="text"
                                value={pageTitle}
                                onChange={(e) => setPageTitle(e.target.value)}
                                placeholder="e.g. SHOWCASE 2.0"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-2 text-white focus:border-red-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-zinc-400 mb-1">Page Description</label>
                            <textarea
                                value={pageDesc}
                                onChange={(e) => setPageDesc(e.target.value)}
                                placeholder="Write a catchy description..."
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-2 text-white focus:border-red-500 outline-none h-24 resize-none"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Video Library / Search */}
            <div className="flex flex-col md:flex-row justify-between gap-4 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Showcase Library</h2>
                    <p className="text-zinc-500">Manage video assets and drag to reorder packages.</p>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search packages..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded text-sm text-white focus:border-red-500 focus:outline-none w-64"
                            />
                        </div>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded text-sm text-white focus:border-red-500 focus:outline-none"
                        >
                            <option value="ALL">All Packages</option>
                            <option value="HAS_VIDEO">Has Video</option>
                            <option value="NO_VIDEO">Missing Video</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 3. Grid with DND */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={filteredPackages.map(p => p.id)}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPackages.map(pkg => {
                            const videoItem = pkg.showcase_items?.find(item => item.type === "VIDEO");
                            const hasVideo = !!videoItem;

                            return (
                                <SortablePackageCard
                                    key={pkg.id}
                                    pkg={pkg}
                                    isEditing={editingId === pkg.id}
                                    editingId={editingId}
                                    editUrl={editUrl}
                                    setEditUrl={setEditUrl}
                                    handleSave={handleSave}
                                    setEditingId={setEditingId}
                                    handleEditStart={handleEditStart}
                                    hasVideo={hasVideo}
                                    videoItem={videoItem}
                                    isYouTube={isYouTube}
                                />
                            );
                        })}
                    </div>
                </SortableContext>
                <DragOverlay>
                    {activePackage ? (
                        <PackageCardUI
                            pkg={activePackage}
                            isEditing={false}
                            hasVideo={!!activePackage.showcase_items?.find(item => item.type === "VIDEO")}
                            videoItem={activePackage.showcase_items?.find(item => item.type === "VIDEO")}
                            isYouTube={isYouTube}
                            // Pass dummy props for unused handlers in overlay
                            editingId={null}
                            editUrl=""
                            setEditUrl={() => { }}
                            handleSave={() => { }}
                            setEditingId={() => { }}
                            handleEditStart={() => { }}
                            isDragging={true}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}

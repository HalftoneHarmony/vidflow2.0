"use client";

import { useState, useEffect } from "react";
import { Product } from "@/features/products/queries";
import { upsertShowcaseVideo } from "@/features/showcase/actions";
import { getSetting, upsertSetting } from "@/features/settings/actions";
import { Search, Save, Film, ExternalLink, PlayCircle, Loader2, GripVertical, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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
import { cn } from "@/lib/utils";


// Package Card UI Component (Pure Presentation)
function PackageCardUI({ pkg, isEditing, editingId, editUrl, setEditUrl, handleSave, setEditingId, handleEditStart, hasVideo, videoItem, isYouTube, dragAttributes, dragListeners, style, isDragging, wrapperRef, onPreview }: any) {
    return (
        <div
            ref={wrapperRef}
            style={style}
            className={cn(
                "group relative bg-zinc-900 border rounded-xl overflow-hidden transition-all duration-300",
                hasVideo ? "border-zinc-800 hover:border-zinc-700 hover:shadow-2xl hover:shadow-red-900/10" : "border-zinc-800/50 opacity-80 hover:opacity-100 hover:border-red-900/30",
                isDragging ? "shadow-2xl shadow-red-500/20 scale-105 ring-2 ring-red-500 cursor-grabbing bg-zinc-800/90 z-50" : ""
            )}
        >
            {/* Drag Handle */}
            <div
                {...dragAttributes}
                {...dragListeners}
                className="absolute top-2 left-2 z-20 p-2 text-zinc-600 hover:text-white cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-md rounded-lg"
                onPointerDown={(e) => {
                    dragListeners?.onPointerDown(e);
                }}
            >
                <GripVertical className="w-5 h-5" />
            </div>

            {/* Status Stripe */}
            <div className={`h-1 w-full transition-all duration-500 ${hasVideo ? "bg-gradient-to-r from-red-600 to-red-900" : "bg-zinc-800"}`} />

            <div className="p-4">
                <div className="flex items-start justify-between mb-4 pl-8">
                    <div>
                        <div className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1.5 mb-1 tracking-widest">
                            <span className={`w-1.5 h-1.5 rounded-full ${hasVideo ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-zinc-600"}`}></span>
                            PACKAGE
                        </div>
                        <h3 className="text-xl font-black text-white leading-tight tracking-tighter uppercase line-clamp-2 min-h-[3rem] items-center flex">
                            {pkg.name}
                        </h3>
                    </div>
                    {/* Status Icon */}
                    <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        hasVideo ? "bg-red-500/10 text-red-500" : "bg-zinc-800 text-zinc-600"
                    )}>
                        {hasVideo ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    </div>
                </div>

                {/* Video Preview / Input Area */}
                <div className="space-y-3">
                    {isEditing ? (
                        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800">
                            <label className="text-xs font-bold text-zinc-400 block mb-2 uppercase tracking-wider">Video URL</label>
                            <div className="flex gap-2">
                                <Input
                                    autoFocus
                                    type="text"
                                    value={editUrl}
                                    onChange={(e) => setEditUrl(e.target.value)}
                                    placeholder="YouTube or File URL..."
                                    className="bg-zinc-900 border-zinc-700"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSave(pkg.id);
                                        if (e.key === 'Escape') setEditingId(null);
                                    }}
                                    onPointerDown={(e) => e.stopPropagation()}
                                />
                                <Button
                                    onClick={() => handleSave(pkg.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    size="icon"
                                >
                                    <Save className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-[10px] text-zinc-600 mt-2 flex justify-between">
                                <span>Enter to save, Esc to cancel.</span>
                                <span className="text-red-900/50">Empty to delete</span>
                            </p>
                        </div>
                    ) : (
                        <div
                            onClick={() => hasVideo ? onPreview(videoItem!.media_url) : handleEditStart(pkg)}
                            className="relative aspect-video bg-zinc-950 rounded border border-zinc-800 overflow-hidden cursor-pointer group/preview"
                        >
                            {hasVideo ? (
                                <>
                                    {isYouTube(videoItem!.media_url) ? (
                                        <img
                                            src={`https://img.youtube.com/vi/${videoItem!.media_url.split('v=')[1]?.split('&')[0] || videoItem!.media_url.split('/').pop()}/mqdefault.jpg`}
                                            alt="Preview"
                                            className="w-full h-full object-cover opacity-50 group-hover/preview:opacity-100 transition-opacity duration-500 scale-100 group-hover/preview:scale-105"
                                        />
                                    ) : (
                                        <video
                                            src={videoItem!.media_url}
                                            className="w-full h-full object-cover opacity-50 group-hover/preview:opacity-100 transition-opacity duration-500"
                                        />
                                    )}

                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover/preview:scale-110 transition-transform">
                                            <PlayCircle className="w-6 h-6 text-white opacity-90" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 group-hover/preview:text-zinc-500 transition-colors bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_25%,rgba(255,255,255,0.02)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.02)_75%,rgba(255,255,255,0.02)_100%)] bg-[length:10px_10px]">
                                    <Film className="w-8 h-8 mb-2 opacity-50" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Add Video</span>
                                </div>
                            )}

                            {/* Edit Overlay Button */}
                            <div
                                className="absolute top-2 right-2 opacity-0 group-hover/preview:opacity-100 transition-opacity z-10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditStart(pkg);
                                }}
                            >
                                <span className="bg-black/80 text-white text-[10px] px-2 py-1 rounded font-bold backdrop-blur-sm border border-white/10 hover:bg-white hover:text-black transition-colors">
                                    EDIT
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Footer Info */}
                    {!isEditing && hasVideo && (
                        <div className="flex justify-between items-center mt-2 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] text-zinc-600 font-mono truncate max-w-[150px]">
                                {videoItem!.media_url}
                            </span>
                            <a
                                href={videoItem!.media_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-zinc-600 hover:text-white transition-colors"
                            >
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
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

    // Preview Modal State
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
            toast.error("Failed to save settings");
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
                toast.error("Failed to update video: " + result.error);
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
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
            toast.success("Order updated visually", { description: "You are mastering ordering!" });
        }
        setActiveId(null);
    };

    const activePackage = activeId ? orderedPackages.find(p => p.id === activeId) : null;

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50 backdrop-blur-xl">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">
                        Showcase <span className="text-zinc-600">Studio</span>
                    </h2>
                    <p className="text-zinc-400 font-medium">
                        Craft the perfect first impression.
                    </p>
                </div>

                <div className="flex gap-2 items-center">
                    <Button
                        onClick={handleSaveSettings}
                        disabled={isSavingSettings || isLoadingSettings}
                        className="bg-white text-black hover:bg-zinc-200 font-bold"
                    >
                        {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Settings
                    </Button>
                </div>
            </div>

            {/* Settings & Library Header */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Settings Column */}
                <div className="lg:col-span-1 bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <CheckCircle2 className="text-red-500 w-5 h-5" />
                        Page Details
                    </h3>
                    {isLoadingSettings ? (
                        <div className="py-8 text-center text-zinc-500">Loading...</div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Headline</label>
                                <Input
                                    type="text"
                                    value={pageTitle}
                                    onChange={(e) => setPageTitle(e.target.value)}
                                    placeholder="e.g. SHOWCASE 2.0"
                                    className="bg-zinc-950 border-zinc-800"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Description</label>
                                <Textarea
                                    value={pageDesc}
                                    onChange={(e) => setPageDesc(e.target.value)}
                                    placeholder="Write a catchy description..."
                                    className="bg-zinc-950 border-zinc-800 h-32 resize-none"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Library Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-end">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-1">Package Library</h3>
                            <p className="text-zinc-500 text-sm">Drag to reorder. Click to preview.</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <Input
                                    type="text"
                                    placeholder="Search packages..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as any)}
                                className="h-10 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-white focus:border-red-500 focus:outline-none"
                            >
                                <option value="ALL">All View</option>
                                <option value="HAS_VIDEO">With Video</option>
                                <option value="NO_VIDEO">Review Needed</option>
                            </select>
                        </div>
                    </div>

                    {/* DND Grid */}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                            onPreview={setPreviewUrl}
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
            </div>

            {/* Video Preview Modal */}
            <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
                <DialogContent className="max-w-4xl bg-black border-zinc-800 p-0 overflow-hidden">
                    <div className="aspect-video w-full bg-black">
                        {previewUrl && (
                            isYouTube(previewUrl) ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${previewUrl.split('v=')[1]?.split('&')[0] || previewUrl.split('/').pop()}?autoplay=1`}
                                    title="Video Preview"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <video controls autoPlay className="w-full h-full">
                                    <source src={previewUrl} />
                                </video>
                            )
                        )}
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}

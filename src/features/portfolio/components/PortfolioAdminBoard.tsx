"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Trash2, Edit2, ExternalLink, ImageIcon, Save, X, Eye, EyeOff } from "lucide-react";
import { deletePortfolioItem, updatePortfolioItem } from "@/features/showcase/portfolio-actions";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type PortfolioItem = {
    id: number;
    title: string;
    category: string;
    client_name: string | null;
    video_url: string | null;
    thumbnail_url: string | null;
    description: string | null;
    tags: string[] | null;
    is_public: boolean;
    created_at: string;
};

interface PortfolioAdminBoardProps {
    items: PortfolioItem[];
}

export function PortfolioAdminBoard({ items: initialItems }: PortfolioAdminBoardProps) {
    const [items, setItems] = useState<PortfolioItem[]>(initialItems);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("ALL");
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
    const router = useRouter();

    // Sync items with props
    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    // Derived state
    const categories = Array.from(new Set(items.map(i => i.category).filter(Boolean)));

    const filteredItems = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "ALL" || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // Handlers
    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this work?")) return;

        setIsDeleting(id);
        const result = await deletePortfolioItem(id);
        setIsDeleting(null);

        if (result.success) {
            setItems(prev => prev.filter(item => item.id !== id));
            toast.success("Item deleted successfully");
        } else {
            toast.error("Failed to delete item");
        }
    };

    const handleToggleVisibility = async (item: PortfolioItem) => {
        const newStatus = !item.is_public;
        // Optimistic update
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_public: newStatus } : i));

        const result = await updatePortfolioItem(item.id, { is_public: newStatus });
        if (!result.success) {
            // Revert on failure
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_public: !newStatus } : i));
            toast.error("Failed to update status");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        const result = await updatePortfolioItem(editingItem.id, {
            title: editingItem.title,
            category: editingItem.category,
            client_name: editingItem.client_name,
            video_url: editingItem.video_url,
            thumbnail_url: editingItem.thumbnail_url,
            description: editingItem.description, // Added description update
            tags: editingItem.tags // Added tags update but simplistic for now
        });

        if (result.success) {
            setItems(prev => prev.map(i => i.id === editingItem.id ? editingItem : i));
            setEditingItem(null);
            toast.success("Item updated successfully");
            router.refresh();
        } else {
            toast.error("Failed to update item");
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50 backdrop-blur-xl">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">
                        Portfolio <span className="text-zinc-600">Manager</span>
                    </h2>
                    <p className="text-zinc-400 font-medium">
                        Curate your creative works with precision.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            value={searchTerm}
                            onChange={(e: any) => setSearchTerm(e.target.value)}
                            placeholder="Search client or title..."
                            className="pl-10 bg-zinc-950 border-zinc-800 focus:border-white transition-colors"
                        />
                    </div>

                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="h-10 px-3 rounded-md bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-white transition-colors"
                    >
                        <option value="ALL">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <Link href="/admin/portfolio/new">
                        <Button className="bg-white text-black hover:bg-zinc-200 font-bold">
                            <Plus className="w-4 h-4 mr-2" /> Add Work
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item) => (
                        <motion.div
                            layout
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="group relative bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all hover:shadow-2xl hover:shadow-black/50"
                        >
                            {/* Image / Video Preview */}
                            <div className="aspect-video bg-zinc-950 relative overflow-hidden">
                                {item.thumbnail_url ? (
                                    <img
                                        src={item.thumbnail_url}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700">
                                        <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                                        <span className="text-xs font-bold uppercase tracking-widest">No Visual</span>
                                    </div>
                                )}

                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                    {item.video_url && (
                                        <a
                                            href={item.video_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform"
                                            title="View Video"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => setEditingItem(item)}
                                        className="p-3 bg-zinc-800 text-white rounded-full hover:bg-zinc-700 hover:scale-110 transition-all"
                                        title="Quick Edit"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="absolute top-3 right-3 flex gap-2">
                                    <button
                                        onClick={() => handleToggleVisibility(item)}
                                        className={`p-1.5 rounded-md backdrop-blur-md transition-colors ${item.is_public ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-zinc-900/50 text-zinc-500 hover:bg-zinc-800'}`}
                                        title={item.is_public ? "Public" : "Private"}
                                    >
                                        {item.is_public ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-400/10 px-2 py-0.5 rounded-full">
                                        {item.category}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-1 line-clamp-1 group-hover:text-blue-400 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-zinc-500 mb-4 line-clamp-1">
                                    {item.client_name || "Self-Initiated"}
                                </p>

                                <div className="pt-4 border-t border-zinc-800 flex justify-end">
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        disabled={isDeleting === item.id}
                                        className="text-xs font-bold text-zinc-600 hover:text-red-500 flex items-center gap-1 transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3" /> DELETE
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredItems.length === 0 && (
                    <div className="col-span-full py-20 text-center text-zinc-500 bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-800">
                        <p>No works found matching your criteria.</p>
                    </div>
                )}
            </motion.div>

            {/* Edit Modal */}
            <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Portfolio Item</DialogTitle>
                    </DialogHeader>

                    {editingItem && (
                        <form onSubmit={handleUpdate} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input
                                        value={editingItem.title}
                                        onChange={(e: any) => setEditingItem({ ...editingItem, title: e.target.value })}
                                        className="bg-zinc-900 border-zinc-800"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Input
                                        value={editingItem.category}
                                        onChange={(e: any) => setEditingItem({ ...editingItem, category: e.target.value })}
                                        className="bg-zinc-900 border-zinc-800"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Client (Optional)</Label>
                                    <Input
                                        value={editingItem.client_name || ""}
                                        onChange={(e: any) => setEditingItem({ ...editingItem, client_name: e.target.value })}
                                        className="bg-zinc-900 border-zinc-800"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Video URL</Label>
                                    <Input
                                        value={editingItem.video_url || ""}
                                        onChange={(e: any) => setEditingItem({ ...editingItem, video_url: e.target.value })}
                                        className="bg-zinc-900 border-zinc-800"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Thumbnail URL (Optional)</Label>
                                <Input
                                    value={editingItem.thumbnail_url || ""}
                                    onChange={(e: any) => setEditingItem({ ...editingItem, thumbnail_url: e.target.value })}
                                    className="bg-zinc-900 border-zinc-800"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={editingItem.description || ""}
                                    onChange={(e: any) => setEditingItem({ ...editingItem, description: e.target.value })}
                                    className="bg-zinc-900 border-zinc-800 h-24"
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setEditingItem(null)}>Cancel</Button>
                                <Button type="submit" className="bg-white text-black hover:bg-zinc-200">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

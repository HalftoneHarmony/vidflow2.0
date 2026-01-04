"use client";

import { useState, useEffect } from "react";
import { getSetting, upsertSetting } from "@/features/settings/actions";
import { Save, Loader2, Info } from "lucide-react";
import { toast } from "sonner";

export function AboutAdminBoard() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const fetchedTitle = await getSetting("about_title");
                const fetchedContent = await getSetting("about_content");

                if (fetchedTitle) setTitle(fetchedTitle);
                if (fetchedContent) setContent(fetchedContent);
            } catch (error) {
                console.error("Failed to load settings:", error);
                toast.error("Failed to load settings");
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await upsertSetting("about_title", title);
            await upsertSetting("about_content", content);
            toast.success("About page updated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                        <Info className="w-8 h-8 text-red-600" />
                        About Page
                    </h1>
                    <p className="text-zinc-400 mt-2">Manage the content of the public "About" page.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    SAVE CHANGES
                </button>
            </div>

            {/* Editor Card */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 backdrop-blur-sm">
                <div className="space-y-6">
                    {/* Title Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-zinc-300 uppercase tracking-wider">
                            Page Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. ABOUT VIDFLOW"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all placeholder:text-zinc-700 font-bold text-lg"
                        />
                    </div>

                    {/* Content Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-zinc-300 uppercase tracking-wider">
                            Content
                        </label>
                        <p className="text-xs text-zinc-500 mb-2">Supports basic text formatting. Newlines are preserved.</p>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your story here..."
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all placeholder:text-zinc-700 min-h-[400px] leading-relaxed resize-y font-mono text-sm"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

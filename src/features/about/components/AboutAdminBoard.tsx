"use client";

import { useState, useEffect } from "react";
import { getSettings, upsertSetting } from "@/features/settings/actions";
import { Save, Loader2, Info, Layout, BarChart, FileText, Send } from "lucide-react";
import { toast } from "sonner";

export function AboutAdminBoard() {
    const [settings, setSettings] = useState<Record<string, string>>({
        about_title: "",
        about_content: "",
        about_hero_subtitle: "",
        about_narrative_title: "",
        about_narrative_subtext: "",
        about_stats: "[]",
        about_manifesto_title: "",
        about_manifesto_items: "[]",
        about_cta_title: "",
        about_cta_desc: "",
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const keys = [
        "about_title",
        "about_content",
        "about_hero_subtitle",
        "about_narrative_title",
        "about_narrative_subtext",
        "about_stats",
        "about_manifesto_title",
        "about_manifesto_items",
        "about_cta_title",
        "about_cta_desc"
    ];

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const fetchedSettings = await getSettings(keys);

                // Pretty print JSON fields
                if (fetchedSettings.about_stats) {
                    try {
                        fetchedSettings.about_stats = JSON.stringify(JSON.parse(fetchedSettings.about_stats), null, 2);
                    } catch (e) { /* ignore parse error */ }
                }
                if (fetchedSettings.about_manifesto_items) {
                    try {
                        fetchedSettings.about_manifesto_items = JSON.stringify(JSON.parse(fetchedSettings.about_manifesto_items), null, 2);
                    } catch (e) { /* ignore parse error */ }
                }

                setSettings(prev => ({ ...prev, ...fetchedSettings }));
            } catch (error) {
                console.error("Failed to load settings:", error);
                toast.error("Failed to load settings");
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, []);

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            for (const key of keys) {
                let valueToSave = settings[key] || "";

                // Minify JSON before saving to keep DB clean if preferred, 
                // but usually better to save exactly what's in the textarea.
                // We'll save exactly what's in the textarea to preserve user formatting.
                await upsertSetting(key, valueToSave);
            }
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
        <div className="space-y-8 max-w-5xl pb-20">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 z-20 bg-black/80 backdrop-blur-md py-4 border-b border-zinc-800 -mx-8 px-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                        <Info className="w-8 h-8 text-red-600" />
                        About Page Manager
                    </h1>
                    <p className="text-zinc-500 mt-1">Configure every element of your cinematic About page.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-sm font-black hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] uppercase tracking-wider"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Everything
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Hero Section */}
                <Section title="Hero Section" icon={<Layout className="w-5 h-5" />}>
                    <div className="grid grid-cols-1 gap-6">
                        <InputField
                            label="Main Title"
                            value={settings.about_title}
                            onChange={(v) => handleChange("about_title", v)}
                            placeholder="ABOUT VIDFLOW"
                        />
                        <TextAreaField
                            label="Hero Subtitle"
                            value={settings.about_hero_subtitle}
                            onChange={(v) => handleChange("about_hero_subtitle", v)}
                            placeholder="The premier engine for high-performance visual storytelling..."
                        />
                    </div>
                </Section>

                {/* Narrative Section */}
                <Section title="Narrative Section" icon={<FileText className="w-5 h-5" />}>
                    <div className="grid grid-cols-1 gap-6">
                        <InputField
                            label="Narrative Title"
                            value={settings.about_narrative_title}
                            onChange={(v) => handleChange("about_narrative_title", v)}
                            placeholder="Built for Impact."
                        />
                        <InputField
                            label="Narrative Small Bold Subtext"
                            value={settings.about_narrative_subtext}
                            onChange={(v) => handleChange("about_narrative_subtext", v)}
                            placeholder="WE DON'T DO STORYTELLING..."
                        />
                        <TextAreaField
                            label="Main Content (The Story)"
                            value={settings.about_content}
                            onChange={(v) => handleChange("about_content", v)}
                            placeholder="VidFlow is the premier video production engine..."
                            rows={10}
                        />
                    </div>
                </Section>

                {/* Stats Section */}
                <Section title="Stats & Data" icon={<BarChart className="w-5 h-5" />}>
                    <div className="space-y-4">
                        <label className="block text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">
                            Stats (JSON Format)
                        </label>
                        <textarea
                            value={settings.about_stats}
                            onChange={(e) => handleChange("about_stats", e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 p-4 text-zinc-300 font-mono text-xs h-48 focus:border-red-600 outline-none leading-relaxed"
                            placeholder='[{"label": "Elite Productions", "value": "500+"}, ...]'
                        />
                        <p className="text-[10px] text-zinc-600">Must be a valid JSON array of objects with "label" and "value" keys.</p>
                    </div>
                </Section>

                {/* Manifesto Section */}
                <Section title="Manifesto & Items" icon={<Info className="w-5 h-5" />}>
                    <div className="grid grid-cols-1 gap-6">
                        <InputField
                            label="Manifesto Main Title"
                            value={settings.about_manifesto_title}
                            onChange={(v) => handleChange("about_manifesto_title", v)}
                            placeholder="The Code of Excellence"
                        />
                        <div className="space-y-4">
                            <label className="block text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">
                                Manifesto Items (JSON Format)
                            </label>
                            <textarea
                                value={settings.about_manifesto_items}
                                onChange={(e) => handleChange("about_manifesto_items", e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 p-4 text-zinc-300 font-mono text-xs h-64 focus:border-red-600 outline-none leading-relaxed"
                                placeholder='[{"title": "Precision", "desc": "..."}, ...]'
                            />
                            <p className="text-[10px] text-zinc-600">Must be a valid JSON array of objects with "title" and "desc" keys.</p>
                        </div>
                    </div>
                </Section>

                {/* CTA Section */}
                <Section title="Call to Action" icon={<Send className="w-5 h-5" />}>
                    <div className="grid grid-cols-1 gap-6">
                        <InputField
                            label="CTA Title"
                            value={settings.about_cta_title}
                            onChange={(v) => handleChange("about_cta_title", v)}
                            placeholder="Ready to Flow?"
                        />
                        <TextAreaField
                            label="CTA Description"
                            value={settings.about_cta_desc}
                            onChange={(v) => handleChange("about_cta_desc", v)}
                            placeholder="Join the ranks of high-performance athletes..."
                        />
                    </div>
                </Section>
            </div>
        </div>
    );
}

function Section({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="bg-zinc-900/30 border border-zinc-900 rounded-sm p-8 overflow-hidden relative">
            <div className="flex items-center gap-3 mb-8 border-b border-zinc-800 pb-4">
                <div className="text-red-600">{icon}</div>
                <h3 className="text-lg font-black text-white uppercase tracking-widest">{title}</h3>
            </div>
            {children}
        </div>
    );
}

function InputField({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
    return (
        <div className="space-y-2">
            <label className="block text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:border-red-600 outline-none transition-all font-medium"
            />
        </div>
    );
}

function TextAreaField({ label, value, onChange, placeholder, rows = 3 }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, rows?: number }) {
    return (
        <div className="space-y-2">
            <label className="block text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">{label}</label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:border-red-600 outline-none transition-all font-medium leading-relaxed"
            />
        </div>
    );
}

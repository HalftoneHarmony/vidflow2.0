"use client";

import { useState, useEffect } from "react";
import { getSettings, upsertSetting } from "@/features/settings/actions";
import { Save, Loader2, Info, Layout, BarChart, FileText, Send, Type, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { ItemListEditor, ImagePreviewInput } from "./AboutAdminHelpers";

type SectionId = 'hero' | 'narrative' | 'stats' | 'manifesto' | 'cta' | 'footer';

const SECTIONS: { id: SectionId; label: string; icon: any; description: string }[] = [
    { id: 'hero', label: 'Hero Section', icon: Layout, description: 'Main banner, title, and initial impression.' },
    { id: 'narrative', label: 'Narrative', icon: FileText, description: 'The core story, mission statement, and text content.' },
    { id: 'stats', label: 'Stats & Data', icon: BarChart, description: 'Key performance indicators and grid visualization.' },
    { id: 'manifesto', label: 'Manifesto', icon: Info, description: 'Core values, quotes, and cultural badges.' },
    { id: 'cta', label: 'Call to Action', icon: Send, description: 'Final engagement section and buttons.' },
    { id: 'footer', label: 'Footer Brand', icon: Type, description: 'Oversized branding in the footer area.' },
];

export function AboutAdminBoard() {
    const [activeTab, setActiveTab] = useState<SectionId>('hero');
    const [settings, setSettings] = useState<Record<string, string>>({
        about_title: "",
        about_content: "",
        about_hero_subtitle: "",
        about_est_date: "",
        about_hero_btn_primary: "",
        about_hero_btn_secondary: "",
        about_hero_image: "",
        about_narrative_title: "",
        about_narrative_subtext: "",
        about_bg_text: "",
        about_stats: "[]",
        about_grid_image: "",
        about_manifesto_title: "",
        about_manifesto_items: "[]",
        about_manifesto_quote: "",
        about_manifesto_badge: "",
        about_manifesto_image: "",
        about_manifesto_label: "",
        about_cta_title: "",
        about_cta_desc: "",
        about_cta_btn: "",
        about_footer_brand: ""
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const keys = [
        "about_title",
        "about_content",
        "about_hero_subtitle",
        "about_est_date",
        "about_hero_btn_primary",
        "about_hero_btn_secondary",
        "about_hero_image",
        "about_narrative_title",
        "about_narrative_subtext",
        "about_bg_text",
        "about_stats",
        "about_grid_image",
        "about_manifesto_title",
        "about_manifesto_items",
        "about_manifesto_quote",
        "about_manifesto_badge",
        "about_manifesto_image",
        "about_manifesto_label",
        "about_cta_title",
        "about_cta_desc",
        "about_cta_btn",
        "about_footer_brand"
    ];

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const fetchedSettings = await getSettings(keys);
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

    const activeSection = SECTIONS.find(s => s.id === activeTab);

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between py-6 border-b border-zinc-800 mb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                        <Info className="w-8 h-8 text-red-600" />
                        About Page Manager
                    </h1>
                    <p className="text-zinc-500 mt-1">Configure your cinematic About page.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-sm font-black hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] uppercase tracking-wider"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Changes
                </button>
            </div>

            <div className="flex flex-1 gap-8 overflow-hidden min-h-0">
                {/* Sidebar Navigation */}
                <div className="w-72 shrink-0 flex flex-col gap-2 overflow-y-auto pr-2">
                    {SECTIONS.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveTab(section.id)}
                            className={`w-full text-left p-4 rounded-sm border transition-all group relative overflow-hidden ${activeTab === section.id
                                ? "bg-zinc-900 border-red-600/50"
                                : "bg-transparent border-transparent hover:bg-zinc-900/50 hover:border-zinc-800"
                                }`}
                        >
                            {activeTab === section.id && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600" />
                            )}
                            <div className="flex items-center gap-3 mb-1">
                                <section.icon className={`w-5 h-5 ${activeTab === section.id ? "text-red-500" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                                <span className={`font-bold uppercase tracking-wide text-sm ${activeTab === section.id ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                                    {section.label}
                                </span>
                            </div>
                            <p className="text-[10px] text-zinc-600 pl-8 leading-tight group-hover:text-zinc-500 transition-colors line-clamp-2">
                                {section.description}
                            </p>
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-zinc-900/20 border border-zinc-900 rounded-sm p-8 overflow-y-auto relative custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-8 pb-20">
                        {/* Section Header */}
                        <div className="border-b border-zinc-800 pb-6 mb-8">
                            <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                                {activeSection?.icon && <activeSection.icon className="w-6 h-6 text-red-600" />}
                                {activeSection?.label}
                            </h2>
                            <p className="text-zinc-500 mt-2">{activeSection?.description}</p>
                        </div>

                        {activeTab === 'hero' && (
                            <div className="grid grid-cols-1 gap-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <InputField
                                        label="Established Date"
                                        value={settings.about_est_date}
                                        onChange={(v) => handleChange("about_est_date", v)}
                                        placeholder="Est. 2026"
                                    />
                                    <InputField
                                        label="Main Title"
                                        value={settings.about_title}
                                        onChange={(v) => handleChange("about_title", v)}
                                        placeholder="ABOUT VIDFLOW"
                                    />
                                </div>
                                <TextAreaField
                                    label="Hero Subtitle"
                                    value={settings.about_hero_subtitle}
                                    onChange={(v) => handleChange("about_hero_subtitle", v)}
                                    placeholder="The premier engine for high-performance visual storytelling..."
                                    rows={4}
                                />
                                <div className="grid grid-cols-2 gap-6">
                                    <InputField
                                        label="Primary Button Text"
                                        value={settings.about_hero_btn_primary}
                                        onChange={(v) => handleChange("about_hero_btn_primary", v)}
                                        placeholder="Explore Our Work"
                                    />
                                    <InputField
                                        label="Secondary Button Text"
                                        value={settings.about_hero_btn_secondary}
                                        onChange={(v) => handleChange("about_hero_btn_secondary", v)}
                                        placeholder="The Mission"
                                    />
                                </div>
                                <ImagePreviewInput
                                    label="Hero Background Image"
                                    value={settings.about_hero_image}
                                    onChange={(v) => handleChange("about_hero_image", v)}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        )}

                        {activeTab === 'narrative' && (
                            <div className="grid grid-cols-1 gap-6">
                                <InputField
                                    label="Narrative Title"
                                    value={settings.about_narrative_title}
                                    onChange={(v) => handleChange("about_narrative_title", v)}
                                    placeholder="Built for Impact."
                                />
                                <InputField
                                    label="Small Bold Subtext"
                                    value={settings.about_narrative_subtext}
                                    onChange={(v) => handleChange("about_narrative_subtext", v)}
                                    placeholder="WE DON'T DO STORYTELLING..."
                                />
                                <InputField
                                    label="Background Giant Text"
                                    value={settings.about_bg_text}
                                    onChange={(v) => handleChange("about_bg_text", v)}
                                    placeholder="ALPHA"
                                />
                                <TextAreaField
                                    label="Main Content (The Story)"
                                    value={settings.about_content}
                                    onChange={(v) => handleChange("about_content", v)}
                                    placeholder="VidFlow is the premier video production engine..."
                                    rows={12}
                                />
                            </div>
                        )}

                        {activeTab === 'stats' && (
                            <div className="space-y-6">
                                <ItemListEditor
                                    title="Stats Items"
                                    description="Add statistics to display in the grid section."
                                    value={settings.about_stats}
                                    onChange={(v) => handleChange("about_stats", v)}
                                    fields={[
                                        { key: "label", label: "Label", placeholder: "e.g. Total Views" },
                                        { key: "value", label: "Value", placeholder: "e.g. 1M+" }
                                    ]}
                                />
                                <div className="pt-6 border-t border-zinc-800/50">
                                    <ImagePreviewInput
                                        label="Grid Background Image"
                                        value={settings.about_grid_image}
                                        onChange={(v) => handleChange("about_grid_image", v)}
                                        placeholder="/grid.svg"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'manifesto' && (
                            <div className="grid grid-cols-1 gap-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <InputField
                                        label="Manifesto Label"
                                        value={settings.about_manifesto_label}
                                        onChange={(v) => handleChange("about_manifesto_label", v)}
                                        placeholder="Manifesto"
                                    />
                                    <InputField
                                        label="Manifesto Title"
                                        value={settings.about_manifesto_title}
                                        onChange={(v) => handleChange("about_manifesto_title", v)}
                                        placeholder="The Code of Excellence"
                                    />
                                </div>
                                <ItemListEditor
                                    title="Manifesto Points"
                                    description="List your core values or manifesto points."
                                    value={settings.about_manifesto_items}
                                    onChange={(v) => handleChange("about_manifesto_items", v)}
                                    fields={[
                                        { key: "title", label: "Title", placeholder: "e.g. Precision" },
                                        { key: "desc", label: "Description", placeholder: "Brief explanation...", type: "textarea" }
                                    ]}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-800/50">
                                    <TextAreaField
                                        label="Quote Box"
                                        value={settings.about_manifesto_quote}
                                        onChange={(v) => handleChange("about_manifesto_quote", v)}
                                        placeholder="PERFECTION ISN'T THE GOAL..."
                                        rows={4}
                                    />
                                    <TextAreaField
                                        label="Badge Text"
                                        value={settings.about_manifesto_badge}
                                        onChange={(v) => handleChange("about_manifesto_badge", v)}
                                        placeholder="ULTRA PREMIUM..."
                                        rows={4}
                                    />
                                </div>
                                <ImagePreviewInput
                                    label="Manifesto Image"
                                    value={settings.about_manifesto_image}
                                    onChange={(v) => handleChange("about_manifesto_image", v)}
                                    placeholder="https://example.com/manifesto.jpg"
                                />
                            </div>
                        )}

                        {activeTab === 'cta' && (
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
                                    rows={4}
                                />
                                <InputField
                                    label="CTA Button Text"
                                    value={settings.about_cta_btn}
                                    onChange={(v) => handleChange("about_cta_btn", v)}
                                    placeholder="Get Started"
                                />
                            </div>
                        )}

                        {activeTab === 'footer' && (
                            <div className="grid grid-cols-1 gap-6">
                                <div className="bg-zinc-950 p-6 rounded-sm border border-zinc-800">
                                    <InputField
                                        label="Giant Footer Brand Text"
                                        value={settings.about_footer_brand}
                                        onChange={(v) => handleChange("about_footer_brand", v)}
                                        placeholder="VIDFLOW"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
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
                className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:border-red-600 outline-none transition-all font-medium rounded-sm"
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
                className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:border-red-600 outline-none transition-all font-medium leading-relaxed rounded-sm"
            />
        </div>
    );
}

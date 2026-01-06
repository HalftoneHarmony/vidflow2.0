"use client";

import { useState } from "react";
import { upsertSetting } from "@/features/settings/actions";
import { toast } from "sonner";
import { Save, Loader2, Globe, Search, Share2, ShieldAlert, LayoutTemplate, Mail, Type } from "lucide-react";

interface GeneralSettingsClientProps {
    initialSettings: Record<string, string>;
}

type SectionId = 'basic' | 'seo' | 'footer' | 'system';

const SECTIONS: { id: SectionId; label: string; icon: any; description: string }[] = [
    { id: 'basic', label: 'Basic Information', icon: Globe, description: 'Core identity and contact settings.' },
    { id: 'seo', label: 'SEO Configuration', icon: Search, description: 'Search engine optimization and metadata.' },
    { id: 'footer', label: 'Footer & Social', icon: Share2, description: 'Footer content, newsletter, and social links.' },
    { id: 'system', label: 'System Status', icon: ShieldAlert, description: 'Maintenance mode and access control.' },
];

export default function GeneralSettingsClient({ initialSettings }: GeneralSettingsClientProps) {
    const [activeTab, setActiveTab] = useState<SectionId>('basic');
    const [settings, setSettings] = useState(initialSettings);
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (key: string, value: string) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const promises = Object.entries(settings).map(([key, value]) =>
                upsertSetting(key, value)
            );

            const results = await Promise.all(promises);
            const failure = results.find(r => !r.success);

            if (failure) {
                throw new Error(failure.error || "Failed to update some settings.");
            }

            toast.success("Settings saved successfully.");
        } catch (error: any) {
            toast.error("Error saving settings", {
                description: error.message
            });
        } finally {
            setIsSaving(false);
        }
    };

    const activeSection = SECTIONS.find(s => s.id === activeTab);

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between py-6 border-b border-zinc-800 mb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-[family-name:var(--font-oswald)] font-bold text-white uppercase tracking-wide flex items-center gap-3">
                        <LayoutTemplate className="w-8 h-8 text-red-600" />
                        General Settings
                    </h1>
                    <p className="text-zinc-500 mt-1">Manage global parameters for the VidFlow platform.</p>
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
                <div className="flex-1 bg-zinc-900/20 border border-zinc-900 rounded-sm p-8 overflow-y-auto custom-scrollbar">
                    <div className="max-w-3xl mx-auto space-y-8 pb-20">
                        {/* Section Header */}
                        <div className="border-b border-zinc-800 pb-6 mb-8">
                            <h2 className="text-2xl font-[family-name:var(--font-oswald)] font-bold text-white uppercase tracking-wider flex items-center gap-3">
                                {activeSection?.icon && <activeSection.icon className="w-6 h-6 text-red-600" />}
                                {activeSection?.label}
                            </h2>
                            <p className="text-zinc-500 mt-2">{activeSection?.description}</p>
                        </div>

                        {activeTab === 'basic' && (
                            <div className="grid grid-cols-1 gap-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <InputField
                                        label="Site Name"
                                        value={settings.site_name || ""}
                                        onChange={(v) => handleChange("site_name", v)}
                                        placeholder="VidFlow"
                                    />
                                    <InputField
                                        label="Logo Symbol"
                                        value={settings.site_logo_symbol || ""}
                                        onChange={(v) => handleChange("site_logo_symbol", v)}
                                        placeholder="V"
                                    />
                                </div>
                                <InputField
                                    label="Support Email"
                                    value={settings.support_email || ""}
                                    onChange={(v) => handleChange("support_email", v)}
                                    placeholder="support@vidflow.com"
                                    icon={<Mail className="w-4 h-4" />}
                                />
                            </div>
                        )}

                        {activeTab === 'seo' && (
                            <div className="grid grid-cols-1 gap-6">
                                <InputField
                                    label="Default Page Title"
                                    value={settings.seo_title || ""}
                                    onChange={(v) => handleChange("seo_title", v)}
                                    placeholder="VidFlow - Professional Video Production"
                                />
                                <InputField
                                    label="Meta Keywords"
                                    value={settings.meta_keywords || ""}
                                    onChange={(v) => handleChange("meta_keywords", v)}
                                    placeholder="video, production, bodybuilding, ..."
                                />
                                <TextAreaField
                                    label="Meta Description"
                                    value={settings.seo_description || ""}
                                    onChange={(v) => handleChange("seo_description", v)}
                                    placeholder="A brief description of your platform..."
                                    rows={4}
                                />
                            </div>
                        )}

                        {activeTab === 'footer' && (
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-6 pb-6 border-b border-zinc-800/50">
                                    <TextAreaField
                                        label="Footer Brand Description"
                                        value={settings.footer_description || ""}
                                        onChange={(v) => handleChange("footer_description", v)}
                                        placeholder="The definitive platform..."
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-6 pb-6 border-b border-zinc-800/50">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Newsletter Section</h3>
                                    <InputField
                                        label="Newsletter Title"
                                        value={settings.footer_newsletter_title || ""}
                                        onChange={(v) => handleChange("footer_newsletter_title", v)}
                                        placeholder="Stay Updated"
                                    />
                                    <TextAreaField
                                        label="Newsletter Text"
                                        value={settings.footer_newsletter_text || ""}
                                        onChange={(v) => handleChange("footer_newsletter_text", v)}
                                        placeholder="Join the elite circle..."
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Social Links</h3>
                                    <InputField
                                        label="Instagram URL"
                                        value={settings.social_instagram || ""}
                                        onChange={(v) => handleChange("social_instagram", v)}
                                        placeholder="https://instagram.com/..."
                                    />
                                    <InputField
                                        label="YouTube URL"
                                        value={settings.social_youtube || ""}
                                        onChange={(v) => handleChange("social_youtube", v)}
                                        placeholder="https://youtube.com/..."
                                    />
                                    <InputField
                                        label="Twitter/X URL"
                                        value={settings.social_twitter || ""}
                                        onChange={(v) => handleChange("social_twitter", v)}
                                        placeholder="https://twitter.com/..."
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'system' && (
                            <div className="grid grid-cols-1 gap-6">
                                <div className="bg-amber-950/20 border border-amber-900/30 p-6 rounded-sm flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="text-base font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                                            <ShieldAlert className="w-5 h-5" />
                                            Maintenance Mode
                                        </div>
                                        <p className="text-sm text-zinc-400">
                                            When enabled, only administrators can access the site.
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.maintenance_mode === "true"}
                                            onChange={(e) => handleChange("maintenance_mode", String(e.target.checked))}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function InputField({ label, value, onChange, placeholder, icon }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, icon?: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="block text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">{label}</label>
            <div className="relative">
                {icon && (
                    <div className="absolute left-4 top-3.5 text-zinc-500">
                        {icon}
                    </div>
                )}
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:border-red-600 outline-none transition-all font-medium rounded-sm ${icon ? "pl-11" : ""}`}
                />
            </div>
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

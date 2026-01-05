"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumInput } from "@/components/ui/premium-input";
import { Label } from "@/components/ui/label";
import { SaveButton } from "@/components/ui/save-button";
import { Switch } from "@/components/ui/switch";
import { upsertSetting } from "@/features/settings/actions";
import { toast } from "sonner";
import { Globe, Mail, Search, ShieldAlert, BadgeCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface GeneralSettingsClientProps {
    initialSettings: Record<string, string>;
}

export default function GeneralSettingsClient({ initialSettings }: GeneralSettingsClientProps) {
    const [settings, setSettings] = useState(initialSettings);
    const [dirty, setDirty] = useState(false);

    const handleChange = (key: string, value: string) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
        setDirty(true);
    };

    const handleSave = async () => {
        try {
            // Save all settings sequentially or parallel
            const promises = Object.entries(settings).map(([key, value]) =>
                upsertSetting(key, value)
            );

            const results = await Promise.all(promises);
            const failure = results.find(r => !r.success);

            if (failure) {
                throw new Error(failure.error || "Failed to update some settings.");
            }

            toast.success("Settings saved successfully.");
            setDirty(false);
        } catch (error: any) {
            toast.error("Error saving settings", {
                description: error.message
            });
            throw error;
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-[family-name:var(--font-oswald)] font-bold text-white uppercase tracking-wide">
                        General Settings
                    </h1>
                    <p className="text-zinc-400 mt-1">
                        Manage global parameters for the VidFlow platform.
                    </p>
                </div>
                <SaveButton
                    onSave={handleSave}
                    disabled={!dirty}
                    className="shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] bg-red-600 hover:bg-red-700 text-white font-bold tracking-wider"
                />
            </div>

            <Separator className="bg-zinc-800" />

            {/* Basic Information */}
            <Card className="bg-[#0f0f0f] border-zinc-800 shadow-xl overflow-hidden group">
                <CardHeader className="bg-zinc-900/30 border-b border-zinc-800/50">
                    <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-red-500" />
                        <CardTitle className="text-lg font-[family-name:var(--font-oswald)] tracking-wide uppercase">Basic Information</CardTitle>
                    </div>
                    <CardDescription>Core identity settings for your platform.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <PremiumInput
                                id="site_name"
                                label="Site Name (Brand Text)"
                                value={settings.site_name || ""}
                                onChange={(e) => handleChange("site_name", e.target.value)}
                                className="bg-black/50 border-zinc-700 focus:border-red-500 text-white rounded-sm"
                                placeholder="VidFlow"
                            />
                        </div>
                        <div className="space-y-2">
                            <PremiumInput
                                id="site_logo_symbol"
                                label="Logo Symbol (Square Icon)"
                                value={settings.site_logo_symbol || ""}
                                onChange={(e) => handleChange("site_logo_symbol", e.target.value)}
                                className="bg-black/50 border-zinc-700 focus:border-red-500 text-white rounded-sm"
                                placeholder="V"
                                maxLength={2}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <div className="relative">
                                <Mail className="absolute left-3 top-[2.2rem] z-10 h-4 w-4 text-zinc-500" />
                                <PremiumInput
                                    id="support_email"
                                    label="Support Email"
                                    value={settings.support_email || ""}
                                    onChange={(e) => handleChange("support_email", e.target.value)}
                                    className="pl-9 bg-black/50 border-zinc-700 focus:border-red-500 text-white rounded-sm"
                                    placeholder="support@vidflow.com"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SEO Configuration */}
            <Card className="bg-[#0f0f0f] border-zinc-800 shadow-xl overflow-hidden group">
                <CardHeader className="bg-zinc-900/30 border-b border-zinc-800/50">
                    <div className="flex items-center gap-2">
                        <Search className="w-5 h-5 text-blue-500" />
                        <CardTitle className="text-lg font-[family-name:var(--font-oswald)] tracking-wide uppercase">SEO Configuration</CardTitle>
                    </div>
                    <CardDescription>Optimize how VidFlow appears in search engines.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                    <div className="space-y-2">
                        <PremiumInput
                            id="seo_title"
                            label="Default Page Title"
                            value={settings.seo_title || ""}
                            onChange={(e) => handleChange("seo_title", e.target.value)}
                            className="bg-black/50 border-zinc-700 focus:border-blue-500 text-white rounded-sm"
                            placeholder="VidFlow - Professional Video Production"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="seo_description" className="text-zinc-300">Meta Description</Label>
                        <textarea
                            id="seo_description"
                            value={settings.seo_description || ""}
                            onChange={(e) => handleChange("seo_description", e.target.value)}
                            className="w-full min-h-[100px] px-3 py-2 bg-black/50 border border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white rounded-sm placeholder:text-zinc-500 text-sm outline-none resize-none transition-colors"
                            placeholder="A brief description of your platform for search results..."
                        />
                    </div>
                </CardContent>
            </Card>

            {/* System Status */}
            <Card className="bg-[#0f0f0f] border-zinc-800 shadow-xl overflow-hidden group">
                <CardHeader className="bg-zinc-900/30 border-b border-zinc-800/50">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-amber-500" />
                        <CardTitle className="text-lg font-[family-name:var(--font-oswald)] tracking-wide uppercase">System Status</CardTitle>
                    </div>
                    <CardDescription>Control access and site availability.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between p-4 bg-amber-950/20 border border-amber-900/30 rounded-sm">
                        <div className="space-y-1">
                            <Label htmlFor="maintenance_mode" className="text-base font-bold text-amber-500">Maintenance Mode</Label>
                            <p className="text-sm text-zinc-400">
                                When enabled, only administrators can access the site. Users will see a maintenance page.
                            </p>
                        </div>
                        <Switch
                            id="maintenance_mode"
                            checked={settings.maintenance_mode === "true"}
                            onCheckedChange={(checked) => handleChange("maintenance_mode", String(checked))}
                            className="data-[state=checked]:bg-amber-600"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Developer Info */}
            <div className="flex justify-center text-zinc-600 text-xs uppercase tracking-widest mt-12">
                <span className="flex items-center gap-2">
                    <BadgeCheck className="w-3 h-3" />
                    Secure Configuration • v2.0.0
                </span>
            </div>
        </div>
    );
}

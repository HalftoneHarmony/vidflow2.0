"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Bell,
    MessageSquare,
    Globe,
    Palette,
    Clock,
    Save,
    Loader2,
    CheckCircle,
    User,
    Shield,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateUserPreferences, type UserPreferences } from "@/features/admin/actions";
import { toast } from "sonner";
import { ChangePasswordCard } from "@/features/auth/components/ChangePasswordCard";

interface SettingsPageClientProps {
    initialPreferences: UserPreferences | null;
    userEmail: string;
}

const languages = [
    { value: "ko", label: "한국어", flag: "🇰🇷" },
    { value: "en", label: "English", flag: "🇺🇸" },
];

const themes = [
    { value: "dark", label: "다크 모드", icon: "🌙" },
    { value: "light", label: "라이트 모드", icon: "☀️" },
    { value: "system", label: "시스템 설정", icon: "💻" },
];

const timezones = [
    { value: "Asia/Seoul", label: "서울 (UTC+9)" },
    { value: "Asia/Tokyo", label: "도쿄 (UTC+9)" },
    { value: "America/New_York", label: "뉴욕 (UTC-5)" },
    { value: "America/Los_Angeles", label: "로스앤젤레스 (UTC-8)" },
    { value: "Europe/London", label: "런던 (UTC+0)" },
    { value: "Europe/Paris", label: "파리 (UTC+1)" },
];

export function SettingsPageClient({ initialPreferences, userEmail }: SettingsPageClientProps) {
    const [isPending, startTransition] = useTransition();
    const [isSaved, setIsSaved] = useState(false);

    const [preferences, setPreferences] = useState<UserPreferences>({
        user_id: initialPreferences?.user_id || "",
        email_notifications: initialPreferences?.email_notifications ?? true,
        sms_notifications: initialPreferences?.sms_notifications ?? false,
        language: initialPreferences?.language || "ko",
        timezone: initialPreferences?.timezone || "Asia/Seoul",
        theme: initialPreferences?.theme || "dark",
    });

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateUserPreferences(preferences);
            if (result.success) {
                toast.success("설정이 저장되었습니다.");
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 2000);
            } else {
                toast.error("설정 저장에 실패했습니다.");
            }
        });
    };

    const updatePreference = <K extends keyof UserPreferences>(
        key: K,
        value: UserPreferences[K]
    ) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
        setIsSaved(false);
    };

    return (
        <div className="container mx-auto px-6 py-12 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-2 mb-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                        <Settings className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-white font-[family-name:var(--font-oswald)] uppercase tracking-wide">
                            Settings
                        </h1>
                        <p className="text-zinc-500 text-sm">{userEmail}</p>
                    </div>
                </div>
                <p className="text-zinc-400 mt-2 max-w-2xl">
                    알림, 언어, 테마 등 VidFlow 계정 환경을 원하는 대로 설정하세요.
                </p>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Notifications */}
                <Card className="bg-zinc-900/30 border-zinc-800 backdrop-blur-sm overflow-hidden group hover:border-zinc-700 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="relative">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <Bell className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <CardTitle className="text-lg text-white normal-case tracking-normal">알림 설정</CardTitle>
                                <CardDescription>이메일 및 SMS 알림을 관리합니다</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="relative space-y-6">
                        {/* Email Notifications */}
                        <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-zinc-800 rounded">
                                    <Bell className="w-4 h-4 text-zinc-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">이메일 알림</p>
                                    <p className="text-xs text-zinc-500">주문 상태 및 프로모션 안내</p>
                                </div>
                            </div>
                            <Switch
                                checked={preferences.email_notifications}
                                onCheckedChange={(checked) => updatePreference("email_notifications", checked)}
                            />
                        </div>

                        {/* SMS Notifications */}
                        <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-zinc-800 rounded">
                                    <MessageSquare className="w-4 h-4 text-zinc-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">SMS 알림</p>
                                    <p className="text-xs text-zinc-500">긴급 알림 및 중요 업데이트</p>
                                </div>
                            </div>
                            <Switch
                                checked={preferences.sms_notifications}
                                onCheckedChange={(checked) => updatePreference("sms_notifications", checked)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Language & Region */}
                <Card className="bg-zinc-900/30 border-zinc-800 backdrop-blur-sm overflow-hidden group hover:border-zinc-700 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="relative">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <Globe className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <CardTitle className="text-lg text-white normal-case tracking-normal">언어 및 지역</CardTitle>
                                <CardDescription>언어와 타임존을 설정합니다</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="relative space-y-6">
                        {/* Language Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                언어
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.value}
                                        onClick={() => updatePreference("language", lang.value)}
                                        className={cn(
                                            "p-4 rounded-lg border text-left transition-all duration-200",
                                            "hover:scale-[1.02] active:scale-[0.98]",
                                            preferences.language === lang.value
                                                ? "bg-red-500/10 border-red-500/50 text-white"
                                                : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                                        )}
                                    >
                                        <span className="text-2xl mb-2 block">{lang.flag}</span>
                                        <span className="font-medium">{lang.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Timezone Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                타임존
                            </label>
                            <select
                                value={preferences.timezone}
                                onChange={(e) => updatePreference("timezone", e.target.value)}
                                className="w-full p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                            >
                                {timezones.map((tz) => (
                                    <option key={tz.value} value={tz.value} className="bg-zinc-900">
                                        {tz.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Theme */}
                <Card className="bg-zinc-900/30 border-zinc-800 backdrop-blur-sm overflow-hidden group hover:border-zinc-700 transition-colors lg:col-span-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="relative">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                <Palette className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <CardTitle className="text-lg text-white normal-case tracking-normal">외관</CardTitle>
                                <CardDescription>앱의 테마와 외관을 설정합니다</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="relative">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {themes.map((theme) => (
                                <button
                                    key={theme.value}
                                    onClick={() => updatePreference("theme", theme.value as "light" | "dark" | "system")}
                                    className={cn(
                                        "p-6 rounded-lg border text-center transition-all duration-200",
                                        "hover:scale-[1.02] active:scale-[0.98]",
                                        "flex flex-col items-center gap-3",
                                        preferences.theme === theme.value
                                            ? "bg-red-500/10 border-red-500/50 ring-1 ring-red-500/20"
                                            : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                                    )}
                                >
                                    <span className="text-4xl">{theme.icon}</span>
                                    <span className={cn(
                                        "font-medium transition-colors",
                                        preferences.theme === theme.value ? "text-white" : "text-zinc-400"
                                    )}>
                                        {theme.label}
                                    </span>
                                    {preferences.theme === theme.value && (
                                        <div className="absolute top-3 right-3">
                                            <CheckCircle className="w-5 h-5 text-red-500" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Account Info (Read-only) */}
                <Card className="bg-zinc-900/30 border-zinc-800 backdrop-blur-sm overflow-hidden lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-zinc-800 rounded-lg border border-zinc-700">
                                <User className="w-5 h-5 text-zinc-400" />
                            </div>
                            <div>
                                <CardTitle className="text-lg text-white normal-case tracking-normal">계정 정보</CardTitle>
                                <CardDescription>로그인된 계정 정보입니다</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                                <p className="text-xs text-zinc-500 mb-1">이메일</p>
                                <p className="text-white font-medium">{userEmail}</p>
                            </div>
                            <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                                <p className="text-xs text-zinc-500 mb-1">보안</p>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-emerald-500" />
                                    <p className="text-emerald-400 font-medium text-sm">보안 연결됨</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Password Change */}
                <ChangePasswordCard />
            </div>

            {/* Save Button - Sticky */}
            <div className="fixed bottom-8 right-8 z-50">
                <Button
                    onClick={handleSave}
                    disabled={isPending || isSaved}
                    size="lg"
                    className={cn(
                        "shadow-lg shadow-red-500/20 transition-all duration-300",
                        "hover:shadow-xl hover:shadow-red-500/30",
                        isSaved && "bg-emerald-600 hover:bg-emerald-600"
                    )}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            저장 중...
                        </>
                    ) : isSaved ? (
                        <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            저장됨
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5 mr-2" />
                            설정 저장
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

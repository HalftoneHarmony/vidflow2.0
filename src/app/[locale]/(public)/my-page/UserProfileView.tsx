"use client";

import { useState } from "react";
import { User, Bell, Smartphone, Palette, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { updateUserPreferences } from "@/features/users/actions";
import { useTranslations } from "next-intl";

interface UserProfileViewProps {
    profile: any;
    user: any;
    preferences: any;
}

export function UserProfileView({ profile, user, preferences }: UserProfileViewProps) {
    const t = useTranslations("MyPage");
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Initial states from preferences
    const [emailNotif, setEmailNotif] = useState(preferences?.email_notifications ?? true);
    const [smsNotif, setSmsNotif] = useState(preferences?.sms_notifications ?? true);
    const [theme, setTheme] = useState(preferences?.theme ?? "dark");

    if (!profile) return null;

    const handleSavePreferences = async () => {
        setIsSaving(true);
        setSaveSuccess(false);

        try {
            await updateUserPreferences(user.id, {
                email_notifications: emailNotif,
                sms_notifications: smsNotif,
                theme: theme
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to save preferences:", error);
            alert(t("alert_save_fail"));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* 기본 정보 */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-red-500" />
                    {t("section_basic")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-500 mb-1">
                            {t("label_name")}
                        </label>
                        <div className="text-white font-medium text-lg">
                            {profile.name}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-500 mb-1">
                            {t("label_email")}
                        </label>
                        <div className="text-white font-medium text-lg">
                            {user.email}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-500 mb-1">
                            {t("label_phone")}
                        </label>
                        <div className="text-white font-medium text-lg">
                            {profile.phone || "-"}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-500 mb-1">
                            {t("label_created")}
                        </label>
                        <div className="text-zinc-300">
                            {new Date(profile.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* 환경 설정 */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-blue-500" />
                    {t("section_env")}
                </h3>

                <div className="space-y-6">
                    {/* 알림 설정 */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">{t("section_notif")}</h4>

                        <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-zinc-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-zinc-800 rounded-lg">
                                    <Mail className="w-5 h-5 text-zinc-400" />
                                </div>
                                <div>
                                    <div className="text-white font-medium">{t("label_email_notif")}</div>
                                    <div className="text-xs text-zinc-500">{t("desc_email_notif")}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setEmailNotif(!emailNotif)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${emailNotif ? "bg-red-600" : "bg-zinc-700"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailNotif ? "translate-x-6" : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-zinc-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-zinc-800 rounded-lg">
                                    <Smartphone className="w-5 h-5 text-zinc-400" />
                                </div>
                                <div>
                                    <div className="text-white font-medium">{t("label_sms_notif")}</div>
                                    <div className="text-xs text-zinc-500">{t("desc_sms_notif")}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSmsNotif(!smsNotif)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${smsNotif ? "bg-red-600" : "bg-zinc-700"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${smsNotif ? "translate-x-6" : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* 테마 설정 */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">{t("section_theme")}</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setTheme("dark")}
                                className={`p-4 rounded-lg border flex flex-col items-center gap-3 transition-all ${theme === "dark"
                                    ? "bg-zinc-800 border-red-500/50 ring-1 ring-red-500"
                                    : "bg-zinc-800/30 border-zinc-800 hover:border-zinc-700"
                                    }`}
                            >
                                <div className="w-10 h-6 bg-black rounded border border-zinc-700 shadow-lg"></div>
                                <span className="text-sm font-medium text-white">{t("btn_dark")}</span>
                            </button>
                            <button
                                onClick={() => setTheme("light")}
                                className={`p-4 rounded-lg border flex flex-col items-center gap-3 transition-all cursor-not-allowed opacity-50 ${theme === "light"
                                    ? "bg-zinc-100 border-red-500 text-black"
                                    : "bg-zinc-800/30 border-zinc-800"
                                    }`}
                                disabled
                            >
                                <div className="w-10 h-6 bg-white rounded border border-zinc-300 shadow-lg"></div>
                                <span className="text-sm font-medium text-white">{t("btn_light")}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-between">
                    <p className="text-xs text-zinc-500">
                        {t("hint_save")}
                    </p>
                    <button
                        onClick={handleSavePreferences}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white rounded-lg font-bold transition-all shadow-lg active:scale-95"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t("btn_saving")}
                            </>
                        ) : saveSuccess ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                {t("btn_saved")}
                            </>
                        ) : (
                            t("btn_save")
                        )}
                    </button>
                </div>
            </div>

            <div className="pt-4 px-2">
                <button className="text-sm text-zinc-500 hover:text-white transition-colors underline">
                    {t("btn_change_pw")}
                </button>
            </div>
        </div>
    );
}

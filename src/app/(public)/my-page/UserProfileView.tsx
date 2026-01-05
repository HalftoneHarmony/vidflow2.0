"use client";

import { useState } from "react";
import { User, Bell, Smartphone, Palette, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { updateUserPreferences } from "@/features/users/actions";

interface UserProfileViewProps {
    profile: any;
    user: any;
    preferences: any;
}

export function UserProfileView({ profile, user, preferences }: UserProfileViewProps) {
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
            alert("설정 저장에 실패했습니다.");
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
                    기본 정보
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-500 mb-1">
                            이름
                        </label>
                        <div className="text-white font-medium text-lg">
                            {profile.name}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-500 mb-1">
                            이메일
                        </label>
                        <div className="text-white font-medium text-lg">
                            {user.email}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-500 mb-1">
                            연락처
                        </label>
                        <div className="text-white font-medium text-lg">
                            {profile.phone || "-"}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-500 mb-1">
                            계정 생성일
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
                    서비스 환경 설정
                </h3>

                <div className="space-y-6">
                    {/* 알림 설정 */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">알림 수신 설정</h4>

                        <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-zinc-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-zinc-800 rounded-lg">
                                    <Mail className="w-5 h-5 text-zinc-400" />
                                </div>
                                <div>
                                    <div className="text-white font-medium">이메일 알림</div>
                                    <div className="text-xs text-zinc-500">주문 상태 변경 및 유용한 소식을 이메일로 받습니다.</div>
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
                                    <div className="text-white font-medium">SMS 알림</div>
                                    <div className="text-xs text-zinc-500">결제 및 배송 소식을 문자 메시지로 빠르게 확인합니다.</div>
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
                        <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">테마 설정 (준비 중)</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setTheme("dark")}
                                className={`p-4 rounded-lg border flex flex-col items-center gap-3 transition-all ${theme === "dark"
                                        ? "bg-zinc-800 border-red-500/50 ring-1 ring-red-500"
                                        : "bg-zinc-800/30 border-zinc-800 hover:border-zinc-700"
                                    }`}
                            >
                                <div className="w-10 h-6 bg-black rounded border border-zinc-700 shadow-lg"></div>
                                <span className="text-sm font-medium text-white">다크 모드</span>
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
                                <span className="text-sm font-medium text-white">라이트 모드</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-between">
                    <p className="text-xs text-zinc-500">
                        * 설정 변경 후 저장 버튼을 눌러주세요.
                    </p>
                    <button
                        onClick={handleSavePreferences}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white rounded-lg font-bold transition-all shadow-lg active:scale-95"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                저장 중...
                            </>
                        ) : saveSuccess ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                저장 완료
                            </>
                        ) : (
                            "설정 저장"
                        )}
                    </button>
                </div>
            </div>

            <div className="pt-4 px-2">
                <button className="text-sm text-zinc-500 hover:text-white transition-colors underline">
                    비밀번호 변경
                </button>
            </div>
        </div>
    );
}

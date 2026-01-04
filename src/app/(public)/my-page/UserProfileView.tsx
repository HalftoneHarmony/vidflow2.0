"use client";

import { User } from "lucide-react";

interface UserProfileViewProps {
    profile: any; // Using any for simplicity as Profile type might be elsewhere, but ideally imported from types
    email: string;
}

export function UserProfileView({ profile, email }: UserProfileViewProps) {
    if (!profile) return null;

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-red-500" />
                계정 정보
            </h3>

            <div className="space-y-4">
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
                            {email}
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

            <div className="mt-8 pt-6 border-t border-zinc-800">
                <button className="text-sm text-zinc-400 hover:text-white transition-colors underline">
                    비밀번호 변경
                </button>
            </div>
        </div>
    );
}

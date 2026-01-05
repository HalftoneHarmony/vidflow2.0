"use client";

import { User } from "lucide-react";
import { motion } from "framer-motion";

interface ProfileCardProps {
    user: any;
    profile: any;
}

export function ProfileCard({ user, profile }: ProfileCardProps) {
    const name = profile?.name || user.email?.split("@")[0] || "User";
    const email = user.email || "";

    return (
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-lg relative overflow-hidden group">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl group-hover:bg-red-600/10 transition-colors duration-500" />

            <div className="flex items-center gap-6 relative z-10">
                <div className="relative">
                    <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center border-2 border-zinc-700 group-hover:border-red-500/50 transition-colors duration-300">
                        <User className="w-8 h-8 text-zinc-400 group-hover:text-white transition-colors" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-zinc-900 rounded-full" />
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                            {name}
                        </h2>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-zinc-800 text-zinc-400 rounded uppercase border border-zinc-700">
                            Agent
                        </span>
                    </div>
                    <p className="text-zinc-500 font-mono text-sm">{email}</p>

                    <div className="mt-4 flex gap-2">
                        <button className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors flex items-center gap-1">
                            EDIT PROFILE &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { GhostCardCreator } from "@/features/pipeline/components/GhostCardCreator";

interface PipelineHeaderProps {
    users: { id: string; name: string; email: string }[];
    packages: { id: number; name: string }[];
    events: { id: number; title: string }[];
}

export function PipelineHeader({ users, packages, events }: PipelineHeaderProps) {
    const [isCreatorOpen, setIsCreatorOpen] = useState(false);

    return (
        <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase font-[family-name:var(--font-oswald)] truncate">
                    PIPELINE <span className="text-red-600">ENGINE</span>
                </h1>
                <p className="text-zinc-500 text-[10px] sm:text-xs mt-1 uppercase tracking-widest font-mono truncate">
                    Systemic Workflow Control: WAITING → DELIVERED
                </p>
            </div>

            <button
                onClick={() => setIsCreatorOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 h-10 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] active:scale-95 group shrink-0"
            >
                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                REGISTER GHOST
            </button>

            <GhostCardCreator
                users={users}
                packages={packages}
                events={events}
                isOpen={isCreatorOpen}
                onOpenChange={setIsCreatorOpen}
            />
        </header>
    );
}

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, Clock, Film, Scissors, Package, Send } from "lucide-react"

export type PipelineStage = "WAITING" | "SHOOTING" | "EDITING" | "READY" | "DELIVERED"

interface StatusTimelineProps {
    currentStage: PipelineStage
    className?: string
}

const STAGES: { id: PipelineStage; label: string; icon: React.ReactNode }[] = [
    { id: "WAITING", label: "Waiting", icon: <Clock className="w-4 h-4" /> },
    { id: "SHOOTING", label: "Shooting", icon: <Film className="w-4 h-4" /> },
    { id: "EDITING", label: "Editing", icon: <Scissors className="w-4 h-4" /> },
    { id: "READY", label: "Ready", icon: <Package className="w-4 h-4" /> },
    { id: "DELIVERED", label: "Delivered", icon: <Send className="w-4 h-4" /> },
]

export function StatusTimeline({ currentStage, className }: StatusTimelineProps) {
    // Calculate current stage index properly
    const currentIndex = STAGES.findIndex((s) => s.id === currentStage)

    // Progress percentage (approximate centered position)
    const progressPercent = ((currentIndex) / (STAGES.length - 1)) * 100

    return (
        <div className={cn("w-full py-4", className)}>
            <div className="relative">
                {/* Background Line (Track) */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-800 -translate-y-1/2" />

                {/* Active Progress Line (Neon) */}
                <div
                    className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-red-900 via-red-600 to-red-500 shadow-[0_0_10px_rgba(220,38,38,0.5)] -translate-y-1/2 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                />

                {/* Stages */}
                <div className="relative flex justify-between items-center">
                    {STAGES.map((stage, index) => {
                        const isActive = index === currentIndex
                        const isCompleted = index < currentIndex
                        const isFuture = index > currentIndex

                        return (
                            <div key={stage.id} className="flex flex-col items-center gap-2 group cursor-default">
                                {/* Node Circle */}
                                <div
                                    className={cn(
                                        "relative z-10 w-10 h-10 flex items-center justify-center border-2 transition-all duration-300",
                                        // Completed: Filled Red
                                        isCompleted && "bg-zinc-900 border-red-600 text-red-500",
                                        // Active: Glowing Red/White
                                        isActive && "bg-black border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.6)] scale-110",
                                        // Future: Muted
                                        isFuture && "bg-black border-zinc-800 text-zinc-600"
                                    )}
                                >
                                    {isCompleted ? <Check className="w-5 h-5" /> : stage.icon}
                                </div>

                                {/* Label */}
                                <span
                                    className={cn(
                                        "text-xs font-bold uppercase tracking-wider transition-colors duration-300",
                                        isActive ? "text-white" : "text-zinc-600",
                                        isCompleted && "text-red-500/70"
                                    )}
                                >
                                    {stage.label}
                                </span>

                                {/* Pulse Effect for Active Stage */}
                                {isActive && (
                                    <div className="absolute top-0 w-10 h-10 bg-red-500/20 rounded-full animate-ping z-0" />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

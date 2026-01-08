"use client";

import { motion } from "framer-motion";
import { Check, Clock, Video, Film, Send } from "lucide-react";

interface OrderStatusTrackerProps {
    status: string;
}

const STAGES = [
    { id: "WAITING", label: "대기중", icon: Clock },
    { id: "EDITING", label: "편집중", icon: Film },
    { id: "READY", label: "출고대기", icon: Check },
    { id: "DELIVERED", label: "전송완료", icon: Send },
];

export function OrderStatusTracker({ status }: OrderStatusTrackerProps) {
    const currentIndex = STAGES.findIndex((s) => s.id === status);
    const activeIndex = currentIndex === -1 ? 0 : currentIndex;

    return (
        <div className="w-full py-6">
            <div className="relative">
                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-800 -translate-y-1/2 rounded-full" />

                {/* Active Progress Bar */}
                <motion.div
                    className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-red-600 to-red-500 -translate-y-1/2 rounded-full origin-left"
                    initial={{ width: "0%" }}
                    animate={{ width: `${(activeIndex / (STAGES.length - 1)) * 100}%` }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                />

                {/* Steps */}
                <div className="relative flex justify-between items-center z-10">
                    {STAGES.map((stage, index) => {
                        const isActive = index <= activeIndex;
                        const isCurrent = index === activeIndex;

                        return (
                            <div key={stage.id} className="flex flex-col items-center gap-2">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        backgroundColor: isActive ? "#EF4444" : "#18181B", // red-500 : zinc-900
                                        borderColor: isActive ? "#EF4444" : "#27272A",
                                        scale: isCurrent ? 1.2 : 1,
                                        boxShadow: isCurrent ? "0 0 20px rgba(239, 68, 68, 0.5)" : "none",
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center relative overlow-hidden
                    ${isActive ? "text-white" : "text-zinc-500"}`}
                                >
                                    <stage.icon className="w-4 h-4 z-10 relative" />

                                    {/* Pulse Effect for Current Stage */}
                                    {isCurrent && (
                                        <div className="absolute inset-0 rounded-full animate-ping bg-red-500/30" />
                                    )}
                                </motion.div>

                                <span className={`text-[10px] uppercase font-bold tracking-wider transition-colors duration-300 ${isActive ? "text-white" : "text-zinc-600"
                                    }`}>
                                    {stage.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

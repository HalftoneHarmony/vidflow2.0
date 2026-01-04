"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MotionCardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    glass?: boolean;
    hoverEffect?: boolean;
}

export function MotionCard({
    children,
    className,
    delay = 0,
    glass = false,
    hoverEffect = true,
}: MotionCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay, ease: "easeOut" }}
            whileHover={
                hoverEffect
                    ? {
                        y: -5,
                        transition: { duration: 0.2 },
                    }
                    : {}
            }
            className={cn(
                "rounded-xl border p-6 overflow-hidden relative", // Rounded-xl for modern feel, though "Heavy Metal" usually likes sharp. Let's stick to rounded-lg or xl for premium.
                // Base styles
                "bg-card text-card-foreground border-border",
                // Glassmorphism toggle
                glass && "glass-panel bg-transparent",
                // Hover effects done via CSS also possible, but motion handles transform better
                hoverEffect && "cursor-pointer hover:shadow-lg hover:border-primary/50",
                className
            )}
        >
            {/* Subtle Gradient Overlay for sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 pointer-events-none" />

            {children}
        </motion.div>
    );
}

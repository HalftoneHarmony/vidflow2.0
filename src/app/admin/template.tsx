"use client";

import { motion } from "framer-motion";

/**
 * 🎬 Admin Page Transition Template
 * 
 * Applies a smooth entry animation to ALL admin pages automatically.
 * When navigating between admin routes, this component re-mounts, triggering the animation.
 */
export default function AdminTemplate({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1] // Custom "easeOutQuint" alike for premium feel
            }}
            className="w-full h-full"
        >
            {children}
        </motion.div>
    );
}

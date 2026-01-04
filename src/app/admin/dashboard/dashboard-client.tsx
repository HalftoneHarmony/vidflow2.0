"use client";

import { motion, Variants, Transition } from "framer-motion";
import { ReactNode } from "react";

/**
 * 🎬 Dashboard Client Wrapper with Stagger Animation
 * Wraps server-rendered content with premium entry animations
 */

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.05,
        },
    },
};

const itemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 25,
    },
    visible: {
        opacity: 1,
        y: 0,
    },
};

const gridContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.07,
        },
    },
};

const mainGridVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
        },
    },
};

const cardVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.9,
        y: 20,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
    },
};

interface DashboardClientWrapperProps {
    header: ReactNode;
    statsGrid: ReactNode;
    mainContent: ReactNode;
    sideContent: ReactNode;
    banner?: ReactNode;
}

export function DashboardClientWrapper({
    header,
    statsGrid,
    mainContent,
    sideContent,
    banner
}: DashboardClientWrapperProps) {
    return (
        <motion.div
            className="space-y-8 pb-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Announcement Banner */}
            {banner && (
                <motion.div
                    variants={itemVariants}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    {banner}
                </motion.div>
            )}

            {/* Header */}
            <motion.div
                variants={itemVariants}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                {header}
            </motion.div>

            {/* Top Stats Grid */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                variants={gridContainerVariants}
            >
                {statsGrid}
            </motion.div>

            {/* Main Content Grid */}
            <motion.div
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                variants={mainGridVariants}
            >
                <motion.div
                    className="lg:col-span-2 space-y-6"
                    variants={itemVariants}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    {mainContent}
                </motion.div>
                <motion.div
                    className="space-y-6"
                    variants={itemVariants}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    {sideContent}
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

// Animated Stat Card Wrapper
export function AnimatedStatCard({ children }: { children: ReactNode }) {
    return (
        <motion.div
            variants={cardVariants}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}

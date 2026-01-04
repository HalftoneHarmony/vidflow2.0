"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

/**
 * 🎬 Stagger Animation Container
 * 
 * Wraps children with automatic stagger animations.
 * Each direct child will animate in sequence with a smooth fade + slide effect.
 */

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 20,
        filter: "blur(4px)",
    },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.5,
            ease: [0.25, 0.4, 0.25, 1], // Custom smooth easing
        },
    },
};

interface AnimatedContainerProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export function AnimatedContainer({ children, className = "", delay = 0 }: AnimatedContainerProps) {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delayChildren: delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

interface AnimatedItemProps {
    children: ReactNode;
    className?: string;
}

export function AnimatedItem({ children, className = "" }: AnimatedItemProps) {
    return (
        <motion.div variants={itemVariants} className={className}>
            {children}
        </motion.div>
    );
}

/**
 * 🎭 Pre-built Animation Wrappers for Common Patterns
 */

// For page headers
export function AnimatedHeader({ children, className = "" }: AnimatedItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// For grid layouts (cards, stats)
export function AnimatedGrid({ children, className = "" }: AnimatedContainerProps) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.06,
                        delayChildren: 0.15,
                    },
                },
            }}
            initial="hidden"
            animate="visible"
            className={className}
        >
            {children}
        </motion.div>
    );
}

// For individual grid items
export function AnimatedGridItem({ children, className = "" }: AnimatedItemProps) {
    return (
        <motion.div
            variants={{
                hidden: {
                    opacity: 0,
                    scale: 0.95,
                    y: 15,
                },
                visible: {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: {
                        duration: 0.4,
                        ease: [0.25, 0.4, 0.25, 1],
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// For sections that slide in from the side
export function AnimatedSection({ children, className = "", direction = "up" }: AnimatedItemProps & { direction?: "up" | "left" | "right" }) {
    const directionMap = {
        up: { y: 30, x: 0 },
        left: { y: 0, x: -30 },
        right: { y: 0, x: 30 },
    };

    return (
        <motion.div
            initial={{
                opacity: 0,
                ...directionMap[direction],
                filter: "blur(4px)",
            }}
            animate={{
                opacity: 1,
                y: 0,
                x: 0,
                filter: "blur(0px)",
            }}
            transition={{
                duration: 0.6,
                ease: [0.25, 0.4, 0.25, 1],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

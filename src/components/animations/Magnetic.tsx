"use client";

import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
import { useRef, ReactElement, cloneElement } from "react";

export default function Magnetic({ children }: { children: ReactElement }) {
    const ref = useRef<HTMLDivElement>(null);
    const position = { x: useMotionValue(0), y: useMotionValue(0) };

    const springOptions = { stiffness: 150, damping: 15, mass: 0.1 };
    const x = useSpring(position.x, springOptions);
    const y = useSpring(position.y, springOptions);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current!.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        position.x.set(middleX * 0.5); // Sensitivity
        position.y.set(middleY * 0.5);
    };

    const handleMouseLeave = () => {
        position.x.set(0);
        position.y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x, y }}
            className="inline-block"
        >
            {children}
        </motion.div>
    );
}

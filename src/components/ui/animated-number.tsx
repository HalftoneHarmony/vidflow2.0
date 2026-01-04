"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

interface AnimatedNumberProps {
    value: number;
    format?: (value: number) => string;
    className?: string;
    prefix?: string;
    suffix?: string;
}

export function AnimatedNumber({
    value,
    format,
    className,
    prefix = "",
    suffix = "",
}: AnimatedNumberProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        damping: 30,
        stiffness: 100,
    });
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [motionValue, isInView, value]);

    const [displayValue, setDisplayValue] = useState(prefix + "0" + suffix);

    useEffect(() => {
        return springValue.on("change", (latest) => {
            const formatted = format ? format(latest) : Math.round(latest).toLocaleString();
            setDisplayValue(`${prefix}${formatted}${suffix}`);
        });
    }, [springValue, format, prefix, suffix]);

    return <span ref={ref} className={className}>{displayValue}</span>;
}

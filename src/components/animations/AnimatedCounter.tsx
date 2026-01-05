'use client';
import { useEffect, useState } from 'react';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
}

export function AnimatedCounter({
    value,
    duration = 1000,
    prefix = '',
    suffix = ''
}: AnimatedCounterProps) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        // Prevent division by zero if end is 0
        if (end === 0) {
            setCount(0);
            return;
        }

        const incrementTime = Math.max(duration / end, 10); // Minimum 10ms per increment to avoid too frequent updates

        // If the value is large, we might want to increment by more than 1 to keep duration constant
        const step = Math.ceil(end / (duration / 10));

        const timer = setInterval(() => {
            start += step;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 10);

        return () => clearInterval(timer);
    }, [value, duration]);

    return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

'use client';

import { useEffect, useState, useRef } from 'react';

interface MoneyTickerProps {
    value: number;
    currency?: string;
    duration?: number;
}

export function MoneyTicker({
    value,
    currency = '₩',
    duration = 1500
}: MoneyTickerProps) {
    const [displayValue, setDisplayValue] = useState(0);
    const previousValue = useRef(0);

    useEffect(() => {
        const startValue = previousValue.current;
        const endValue = value;
        const startTime = performance.now();

        // If values are the same, don't animate needed, just set
        if (startValue === endValue) {
            setDisplayValue(endValue);
            return;
        }

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = startValue + (endValue - startValue) * eased;

            setDisplayValue(Math.round(current));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
        previousValue.current = value;
    }, [value, duration]);

    return (
        <span className="font-mono tabular-nums">
            {currency}{displayValue.toLocaleString()}
        </span>
    );
}

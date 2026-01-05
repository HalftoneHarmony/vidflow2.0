'use client';

interface TrendIndicatorProps {
    value: number;
    previousValue: number;
}

export function TrendIndicator({ value, previousValue }: TrendIndicatorProps) {
    const diff = value - previousValue;

    // Handle division by zero
    const percentage = previousValue !== 0
        ? ((diff / previousValue) * 100).toFixed(1)
        : diff > 0 ? '100.0' : '0.0';

    const isPositive = diff > 0;
    const isNeutral = diff === 0;

    if (isNeutral) return null;

    return (
        <span
            className={`
        inline-flex items-center gap-1 text-sm font-medium
        ${isPositive ? 'text-emerald-500' : 'text-red-500'}
        animate-fade-in
      `}
        >
            <span className={isPositive ? 'animate-bounce-up' : 'animate-bounce-down'}>
                {isPositive ? '↑' : '↓'}
            </span>
            {Math.abs(Number(percentage))}%
        </span>
    );
}

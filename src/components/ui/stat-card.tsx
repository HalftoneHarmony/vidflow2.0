import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
    label: string
    value: string | number
    icon: React.ReactNode
    trend?: "up" | "down" | "neutral"
    trendValue?: string
    description?: string
    color?: "default" | "red" | "blue" | "gold"
}

export function StatCard({
    label,
    value,
    icon,
    trend,
    trendValue,
    description,
    color = "default",
    className,
    ...props
}: StatCardProps) {
    // Color variants for the glow effect
    const glowColors = {
        default: "group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]",
        red: "group-hover:shadow-[0_0_20px_rgba(255,0,0,0.2)] group-hover:border-red-900/50",
        blue: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] group-hover:border-blue-900/50",
        gold: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] group-hover:border-amber-900/50",
    }

    const iconColors = {
        default: "text-zinc-400 group-hover:text-white",
        red: "text-red-500",
        blue: "text-blue-500",
        gold: "text-amber-500",
    }

    return (
        <Card
            className={cn(
                "group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 bg-[#0A0A0A]",
                glowColors[color],
                className
            )}
            {...props}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity scale-150 transform translate-x-2 -translate-y-2">
                {React.cloneElement(icon as React.ReactElement<any>, { className: "w-24 h-24" })}
            </div>

            <CardContent className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
                        <span className={cn(
                            "text-3xl font-bold font-[family-name:var(--font-oswald)]",
                            color === "default" ? "text-white" : iconColors[color]
                        )}>
                            {value}
                        </span>
                    </div>
                    <div className={cn(
                        "p-2 rounded-none border border-zinc-800 bg-zinc-900/50 transition-colors",
                        "group-hover:border-zinc-700 group-hover:bg-zinc-800",
                        iconColors[color]
                    )}>
                        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-5 h-5" })}
                    </div>
                </div>

                {(trend || description) && (
                    <div className="flex items-center gap-2 text-xs">
                        {trend && (
                            <span className={cn(
                                "font-medium px-1.5 py-0.5 border",
                                trend === "up" && "border-emerald-900 bg-emerald-900/20 text-emerald-500",
                                trend === "down" && "border-red-900 bg-red-900/20 text-red-500",
                                trend === "neutral" && "border-zinc-700 bg-zinc-800 text-zinc-400"
                            )}>
                                {trend === "up" && "▲"}
                                {trend === "down" && "▼"}
                                {trend === "neutral" && "−"}
                                {" "}{trendValue}
                            </span>
                        )}
                        {description && (
                            <span className="text-zinc-500 truncate">{description}</span>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

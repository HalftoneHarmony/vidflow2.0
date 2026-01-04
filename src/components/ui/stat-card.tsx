import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
    label: string
    value: string | number
    icon: React.ReactNode
    variant?: "default" | "success" | "warning" | "danger" | "gold"
    trend?: "up" | "down" | "neutral"
    trendValue?: string
    description?: string
}

export function StatCard({
    label,
    value,
    icon,
    variant = "default",
    trend,
    trendValue,
    description,
    className,
    ...props
}: StatCardProps) {
    // Color configuration
    const variants = {
        default: {
            border: "hover:border-zinc-700",
            iconBox: "text-zinc-400 group-hover:text-white bg-zinc-900 border-zinc-800",
            text: "text-white",
            glow: "group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]",
        },
        success: {
            border: "hover:border-emerald-900/50",
            iconBox: "text-emerald-500 bg-emerald-950/20 border-emerald-900/30",
            text: "text-emerald-500",
            glow: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]",
        },
        warning: {
            border: "hover:border-amber-900/50",
            iconBox: "text-amber-500 bg-amber-950/20 border-amber-900/30",
            text: "text-amber-500",
            glow: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]",
        },
        danger: {
            border: "hover:border-red-900/50",
            iconBox: "text-red-500 bg-red-950/20 border-red-900/30",
            text: "text-red-500",
            glow: "group-hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]",
        },
        gold: {
            border: "hover:border-yellow-900/50",
            iconBox: "text-yellow-500 bg-yellow-950/20 border-yellow-900/30",
            text: "text-yellow-500",
            glow: "group-hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]",
        },
    }

    const currentVariant = variants[variant]

    return (
        <Card
            className={cn(
                "group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 bg-[#0A0A0A] border-zinc-800",
                currentVariant.border,
                currentVariant.glow,
                className
            )}
            {...props}
        >
            {/* Background Icon (Large & Faded) */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity scale-150 transform translate-x-2 -translate-y-2 pointer-events-none">
                {React.cloneElement(icon as React.ReactElement<any>, { className: "w-24 h-24" })}
            </div>

            <CardContent className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
                        <span className={cn(
                            "text-3xl font-bold font-[family-name:var(--font-oswald)] tracking-tight",
                            variant === "default" ? "text-white" : currentVariant.text
                        )}>
                            {value}
                        </span>
                    </div>
                    <div className={cn(
                        "p-2 rounded-none border transition-colors",
                        currentVariant.iconBox
                    )}>
                        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-5 h-5" })}
                    </div>
                </div>

                {(trend || description) && (
                    <div className="flex items-center gap-2 text-xs">
                        {trend && (
                            <span className={cn(
                                "font-bold px-1.5 py-0.5 border flex items-center gap-0.5",
                                trend === "up" && "border-emerald-900/50 bg-emerald-950/30 text-emerald-500",
                                trend === "down" && "border-red-900/50 bg-red-950/30 text-red-500",
                                trend === "neutral" && "border-zinc-700 bg-zinc-800 text-zinc-400"
                            )}>
                                {trend === "up" && <ArrowUp className="w-3 h-3" />}
                                {trend === "down" && <ArrowDown className="w-3 h-3" />}
                                {trend === "neutral" && <Minus className="w-3 h-3" />}
                                {trendValue}
                            </span>
                        )}
                        {description && (
                            <span className="text-zinc-500 truncate font-medium">{description}</span>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Ghost } from "lucide-react" // Default icon

interface EmptyStateProps {
    title?: string
    description?: string
    icon?: React.ReactNode
    action?: React.ReactNode
    className?: string
}

export function EmptyState({
    title = "No Data Found",
    description = "There are no items to display at this time.",
    icon,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-8 text-center bg-zinc-900/20 border border-zinc-800/50 rounded-none min-h-[300px]",
            className
        )}>
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-zinc-600 border border-zinc-800">
                {icon || <Ghost className="w-8 h-8" />}
            </div>

            <h3 className="text-lg font-bold text-white mb-2 font-[family-name:var(--font-oswald)] uppercase tracking-wide">
                {title}
            </h3>

            <p className="text-zinc-500 max-w-sm mb-6 text-sm">
                {description}
            </p>

            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    )
}

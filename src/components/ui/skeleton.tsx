/**
 * 🎸 Heavy Metal Skeleton System
 * 
 * Includes basic Skeleton and specialized loading states.
 */

import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-zinc-800/50 animate-pulse rounded-none",
        className
      )}
      {...props}
    />
  )
}

function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 border border-zinc-800 bg-[#0A0A0A] space-y-4", className)}>
      <Skeleton className="h-4 w-1/3 bg-zinc-800" />
      <Skeleton className="h-8 w-1/2 bg-zinc-800" />
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-4 w-full bg-zinc-900" />
      </div>
    </div>
  )
}

function TableSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="h-10 bg-zinc-900/50 border border-zinc-800 mb-4 flex items-center px-4 gap-4">
        <Skeleton className="h-4 w-24 bg-zinc-800" />
        <Skeleton className="h-4 w-24 bg-zinc-800" />
        <Skeleton className="h-4 w-full bg-zinc-800" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 border-b border-zinc-900 flex items-center px-4 gap-4">
          <Skeleton className="h-4 w-24 bg-zinc-900" />
          <Skeleton className="h-4 w-24 bg-zinc-900" />
          <Skeleton className="h-4 w-full bg-zinc-900" />
        </div>
      ))}
    </div>
  )
}

function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 border border-zinc-800 bg-[#0A0A0A] flex flex-col items-center justify-center min-h-[300px]", className)}>
      <div className="flex items-end gap-2 h-40 w-full px-8 justify-between opacity-50">
        <Skeleton className="w-8 h-[40%] bg-zinc-800" />
        <Skeleton className="w-8 h-[70%] bg-zinc-800" />
        <Skeleton className="w-8 h-[50%] bg-zinc-800" />
        <Skeleton className="w-8 h-[90%] bg-zinc-800" />
        <Skeleton className="w-8 h-[60%] bg-zinc-800" />
        <Skeleton className="w-8 h-[80%] bg-zinc-800" />
      </div>
    </div>
  )
}

export { Skeleton, CardSkeleton, TableSkeleton, ChartSkeleton }

/**
 * 🎸 Heavy Metal Skeleton
 * 
 * Dark, brooding loading state.
 * Uses a faster, deeper pulse to indicate system activity.
 */

import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        // Heavy Metal: Darker background, Sharp corners
        "bg-zinc-800/50 animate-pulse rounded-none",
        // Additional texture/feel can be added here
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }

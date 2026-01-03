/**
 * 🎸 Heavy Metal Badge Component
 * 
 * Sharp, angular badges for status indicators.
 * Pipeline Stage Colors: Waiting(Gray), Shooting(Purple), Editing(Blue), Ready(Gold), Delivered(Red)
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  // Base: Sharp corners, uppercase, industrial look
  "inline-flex items-center justify-center border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        // Default: Zinc with subtle presence
        default:
          "border-zinc-700 bg-zinc-800 text-zinc-300",

        // Secondary: Subtle background
        secondary:
          "border-zinc-800 bg-zinc-900 text-zinc-400",

        // Destructive: Alert/Error state
        destructive:
          "border-red-800 bg-red-900/50 text-red-400",

        // Outline: Ghost with border
        outline:
          "border-zinc-600 bg-transparent text-zinc-400",

        // Success: Positive state
        success:
          "border-emerald-700 bg-emerald-900/50 text-emerald-400",

        // ======================================
        // 🏭 PIPELINE STATUS VARIANTS
        // ======================================

        // WAITING: Gray - Queued, awaiting action
        waiting:
          "border-zinc-600 bg-zinc-700 text-zinc-200",

        // SHOOTING: Purple - Active filming
        shooting:
          "border-purple-600 bg-purple-900/60 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]",

        // EDITING: Blue - In post-production
        editing:
          "border-blue-600 bg-blue-900/60 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]",

        // READY: Gold - Ready for delivery
        ready:
          "border-amber-500 bg-amber-900/60 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]",

        // DELIVERED: Red - Complete, delivered
        delivered:
          "border-red-500 bg-red-900/60 text-red-300 shadow-[0_0_10px_rgba(255,0,0,0.3)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

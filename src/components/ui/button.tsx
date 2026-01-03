/**
 * 🎸 Heavy Metal Button Component
 * 
 * Sharp edges, bold presence, commanding action.
 * "Click me if you dare" energy.
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base styles - Sharp, no rounded corners
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold uppercase tracking-wider transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
  {
    variants: {
      variant: {
        // Primary: Impact Red - The main call to action
        default:
          "bg-red-600 text-white shadow-[0_0_0_1px_rgba(255,0,0,0.3)] hover:bg-red-500 hover:shadow-[0_0_20px_rgba(255,0,0,0.4)] active:bg-red-700",

        // Destructive: Darker red with warning presence
        destructive:
          "bg-red-900 text-red-100 border border-red-800 hover:bg-red-800 hover:border-red-700",

        // Outline: Ghost with visible border
        outline:
          "border border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-600",

        // Secondary: Subtle but present
        secondary:
          "bg-zinc-800 text-zinc-100 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600",

        // Ghost: Invisible until interacted
        ghost:
          "bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-white",

        // Link: Underlined action
        link:
          "text-red-500 underline-offset-4 hover:underline hover:text-red-400 bg-transparent",

        // Success: For positive actions (delivery complete, etc.)
        success:
          "bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]",

        // Warning: For attention-needed states
        warning:
          "bg-amber-600 text-black hover:bg-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 gap-1.5 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

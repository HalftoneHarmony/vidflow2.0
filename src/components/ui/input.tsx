/**
 * 🎸 Heavy Metal Input Component
 * 
 * Sharp, no-nonsense input fields.
 * Dark background, subtle borders, red focus ring.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base: Sharp corners, dark surface
        "h-10 w-full min-w-0 border bg-zinc-900 px-4 py-2 text-sm text-zinc-100",
        // Border: Subtle zinc
        "border-zinc-700",
        // Placeholder
        "placeholder:text-zinc-500",
        // Selection
        "selection:bg-red-600 selection:text-white",
        // Transition
        "transition-all duration-200",
        // Focus: Red ring (Impact Red)
        "focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
        // Disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-950",
        // Invalid state
        "aria-invalid:border-red-800 aria-invalid:ring-red-800/20",
        // File input
        "file:text-zinc-100 file:inline-flex file:h-7 file:border-0 file:bg-zinc-800 file:px-3 file:text-sm file:font-medium file:mr-3",
        className
      )}
      {...props}
    />
  )
}

export { Input }

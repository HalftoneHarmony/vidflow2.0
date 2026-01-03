/**
 * 🎸 Heavy Metal Toaster (Sonner)
 * 
 * Dark, sharp, and highly visible notifications.
 * "System Alerts" style.
 */

"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark" // Force Dark Theme for Heavy Metal
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-5 text-emerald-500" />,
        info: <InfoIcon className="size-5 text-blue-500" />,
        warning: <TriangleAlertIcon className="size-5 text-amber-500" />,
        error: <OctagonXIcon className="size-5 text-red-500" />,
        loading: <Loader2Icon className="size-5 animate-spin text-zinc-400" />,
      }}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-[#0A0A0A] group-[.toaster]:text-zinc-100 group-[.toaster]:border-zinc-800 group-[.toaster]:shadow-xl group-[.toaster]:rounded-none group-[.toaster]:border-l-4",
          description: "group-[.toast]:text-zinc-400",
          actionButton: "group-[.toast]:bg-red-600 group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-400",
          // Variety specific borders
          error: "group-[.toaster]:border-l-red-600",
          success: "group-[.toaster]:border-l-emerald-600",
          warning: "group-[.toaster]:border-l-amber-600",
          info: "group-[.toaster]:border-l-blue-600",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

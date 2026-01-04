"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: "default" | "destructive"
    onConfirm: () => void
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
    onConfirm,
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className={cn(
                "bg-[#0A0A0A] border-zinc-800",
                variant === "destructive" && "border-red-900/50 shadow-[0_0_30px_rgba(220,38,38,0.2)]"
            )}>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 font-[family-name:var(--font-oswald)] uppercase tracking-wide text-white">
                        {variant === "destructive" && <AlertTriangle className="w-5 h-5 text-red-500" />}
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-zinc-400">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:text-white rounded-none uppercase tracking-wider text-xs">
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className={cn(
                            "rounded-none uppercase tracking-wider text-xs font-bold transition-all duration-200",
                            variant === "destructive"
                                ? "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)]"
                                : "bg-white text-black hover:bg-zinc-200"
                        )}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

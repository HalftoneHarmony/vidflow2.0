/**
 * 🎸 Heavy Metal Announcement Modal Component
 * 
 * Displays announcement details with stunning visual effects.
 * Supports different announcement types with unique styling.
 */

"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
    Info,
    AlertTriangle,
    Tag,
    Wrench,
    AlertOctagon,
    Clock,
    Pin
} from "lucide-react"

export type AnnouncementType = "info" | "warning" | "promotion" | "maintenance" | "urgent"

interface Announcement {
    id: number
    title: string
    content: string
    type: AnnouncementType
    is_pinned: boolean
    created_at: string
}

interface AnnouncementModalProps {
    announcement: Announcement | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

const typeConfig: Record<AnnouncementType, {
    icon: React.ComponentType<{ className?: string }>
    color: string
    bgColor: string
    borderColor: string
    label: string
}> = {
    info: {
        icon: Info,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
        label: "안내"
    },
    warning: {
        icon: AlertTriangle,
        color: "text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
        label: "주의"
    },
    promotion: {
        icon: Tag,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30",
        label: "프로모션"
    },
    maintenance: {
        icon: Wrench,
        color: "text-purple-400",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/30",
        label: "점검"
    },
    urgent: {
        icon: AlertOctagon,
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30",
        label: "긴급"
    }
}

export function AnnouncementModal({
    announcement,
    open,
    onOpenChange
}: AnnouncementModalProps) {
    if (!announcement) return null

    const config = typeConfig[announcement.type] || typeConfig.info
    const Icon = config.icon

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                "max-w-xl",
                config.borderColor,
                "border-l-4"
            )}>
                <DialogHeader>
                    {/* Type Badge & Pinned Status */}
                    <div className="flex items-center gap-2 mb-2">
                        <Badge
                            variant="outline"
                            className={cn(
                                "gap-1.5 px-2.5 py-1",
                                config.bgColor,
                                config.borderColor,
                                config.color
                            )}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {config.label}
                        </Badge>
                        {announcement.is_pinned && (
                            <Badge
                                variant="outline"
                                className="gap-1 px-2 py-1 bg-zinc-800/50 border-zinc-700 text-zinc-300"
                            >
                                <Pin className="w-3 h-3" />
                                고정됨
                            </Badge>
                        )}
                    </div>

                    {/* Title */}
                    <DialogTitle className={cn(
                        "text-2xl",
                        announcement.type === "urgent" && "text-red-400"
                    )}>
                        {announcement.title}
                    </DialogTitle>

                    {/* Date */}
                    <DialogDescription className="flex items-center gap-2 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(announcement.created_at)}
                    </DialogDescription>
                </DialogHeader>

                {/* Content */}
                <div className={cn(
                    "mt-4 p-4 rounded-lg",
                    "bg-zinc-900/50 border border-zinc-800",
                    "animate-in fade-in slide-in-from-bottom-2 duration-300"
                )}>
                    <div className="prose prose-invert prose-sm max-w-none">
                        {/* Render content with line breaks */}
                        {announcement.content.split('\n').map((paragraph, index) => (
                            <p key={index} className="text-zinc-300 leading-relaxed mb-3 last:mb-0">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </div>

                {/* Decorative element for urgent announcements */}
                {announcement.type === "urgent" && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-500 animate-pulse" />
                )}
            </DialogContent>
        </Dialog>
    )
}

export { type Announcement }

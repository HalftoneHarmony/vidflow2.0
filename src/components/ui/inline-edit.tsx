"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Loader2, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface InlineEditProps {
    value: string
    onSave: (newValue: string) => Promise<void>
    placeholder?: string
    className?: string
    inputClassName?: string
}

export function InlineEdit({
    value: initialValue,
    onSave,
    placeholder = "Click to edit",
    className,
    inputClassName,
}: InlineEditProps) {
    const [isEditing, setIsEditing] = React.useState(false)
    const [value, setValue] = React.useState(initialValue)
    const [isLoading, setIsLoading] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    React.useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isEditing])

    const handleSave = async () => {
        if (value === initialValue) {
            setIsEditing(false)
            return
        }

        try {
            setIsLoading(true)
            await onSave(value)
            setIsEditing(false)
        } catch (error) {
            console.error("Failed to save inline edit:", error)
            setValue(initialValue) // Revert on error
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSave()
        } else if (e.key === "Escape") {
            setValue(initialValue)
            setIsEditing(false)
        }
    }

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <Input
                    ref={inputRef}
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    disabled={isLoading}
                    className={cn("h-8 text-sm", inputClassName)}
                    placeholder={placeholder}
                />
                {isLoading && <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />}
            </div>
        )
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className={cn(
                "cursor-pointer hover:bg-zinc-800/50 px-2 py-1 -ml-2 rounded-sm border border-transparent hover:border-zinc-700 transition-colors flex items-center gap-2 group",
                className
            )}
        >
            <span className={cn("truncate", !value && "text-zinc-500 italic")}>
                {value || placeholder}
            </span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                <svg
                    className="w-3 h-3 text-zinc-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                </svg>
            </span>
        </div>
    )
}

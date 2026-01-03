"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

/**
 * 🎸 Global Error - Heavy Metal Edition
 * Concept: Critical System Failure
 */
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 text-center">
            <div className="space-y-6 max-w-lg mx-auto relative z-10 animate-fade-up">
                {/* Warning Icon */}
                <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto border border-red-900/50 animate-pulse-red">
                    <span className="text-4xl">⚠️</span>
                </div>

                <h2 className="text-4xl font-bold font-[family-name:var(--font-oswald)] uppercase tracking-wide text-red-600">
                    System Critical
                </h2>

                <div className="bg-zinc-900/50 border border-red-900/30 p-4 font-mono text-sm text-red-400 text-left overflow-auto max-h-40">
                    <p>ERROR: {error.message || "Unknown System Failure"}</p>
                    {error.digest && <p className="text-zinc-600 mt-2">Digest: {error.digest}</p>}
                </div>

                <p className="text-zinc-500">
                    치명적인 오류가 감지되었습니다. 시스템이 자동으로 복구를 시도할 수 있습니다.
                </p>

                <div className="pt-4 flex items-center justify-center gap-4">
                    <Button
                        size="lg"
                        variant="destructive"
                        onClick={() => reset()}
                        className="uppercase tracking-wider glow-red-hover"
                    >
                        Reboot System
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={() => window.location.href = '/'}
                        className="uppercase tracking-wider"
                    >
                        Emergency Exit
                    </Button>
                </div>
            </div>

            {/* Background Grid */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none z-0"></div>
        </div>
    )
}

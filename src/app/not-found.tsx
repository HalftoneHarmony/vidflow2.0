import Link from "next/link"
import { Button } from "@/components/ui/button"

/**
 * 🎸 404 Not Found - Heavy Metal Edition
 * Concept: Target Lost / Signal Lost
 */
export default function NotFound() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 text-center">
            {/* Glitch Effect Text */}
            <h1 className="text-9xl font-bold font-[family-name:var(--font-oswald)] text-transparent bg-clip-text bg-gradient-to-b from-zinc-700 to-zinc-900 select-none">
                404
            </h1>

            <div className="space-y-6 max-w-md mx-auto -mt-10 relative z-10 animate-fade-up">
                <h2 className="text-3xl font-bold font-[family-name:var(--font-oswald)] uppercase tracking-wide text-red-600">
                    Target Lost
                </h2>

                <p className="text-zinc-500 text-lg">
                    요청하신 페이지가 시스템 레이더에서 사라졌습니다.
                    <br />
                    삭제되었거나, 잘못된 좌표입니다.
                </p>

                <div className="pt-4 flex items-center justify-center gap-4">
                    <Link href="/">
                        <Button size="lg" className="uppercase tracking-wider">
                            Return to Base
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Background Grid */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none z-0"></div>
        </div>
    )
}

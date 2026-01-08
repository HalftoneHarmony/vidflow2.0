import { Hero } from "@/components/landing/Hero";

/**
 * 🎸 VidFlow Admin Login (Heavy Metal Edition)
 * 
 * The gateway for admins. Bold, dark, and uncompromising.
 */
export default function AdminLoginPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Hero />

            {/* Footer / Status Bar */}
            <footer className="relative z-10 w-full border-t border-zinc-900 bg-black/50 backdrop-blur-sm">
                <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-600 uppercase tracking-widest">
                    <div className="flex items-center gap-4">
                        <span>© 2026 VIDFLOW</span>
                        <span className="hidden md:inline text-zinc-800">|</span>
                        <span>HEAVY METAL DESIGN SYSTEM</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        <span>ALL SYSTEMS OPERATIONAL</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

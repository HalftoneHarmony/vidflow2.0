import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, User as UserIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

/**
 * 🌍 Public Layout (Responsive)
 * 
 * Desktop: Horizontal Nav
 * Mobile: Hamburger Menu (Sheet)
 */

// Navigation Items
const navItems = [
    { href: "/showcase", label: "Showcase", highlight: true },
    { href: "/about", label: "About" },
    { href: "/events", label: "Events" },
    { href: "/support", label: "Support" },
    // My Page는 로그인 여부에 따라 다르므로 여기서 제거하거나 조건부 렌더링
];

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* ==========================================
          🎸 GLOBAL NAVIGATION BAR
          ========================================== */}
            <header className="bg-[#0A0A0A] border-b border-zinc-800 sticky top-0 z-50">
                <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo Area */}
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Trigger */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <button className="md:hidden text-zinc-400 hover:text-white transition-colors">
                                    <Menu className="w-6 h-6" />
                                </button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-full sm:w-80 bg-[#0A0A0A] border-r border-zinc-800 p-0">
                                <div className="flex flex-col h-full">
                                    <div className="p-6 border-b border-zinc-800">
                                        <span className="text-xl font-bold text-white font-[family-name:var(--font-oswald)] uppercase tracking-wider">
                                            VidFlow
                                        </span>
                                    </div>
                                    <div className="flex-1 flex flex-col p-6 gap-4">
                                        {navItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`text-lg font-medium uppercase tracking-wider ${item.highlight ? "text-red-500" : "text-zinc-400 hover:text-white"}`}
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                        {user && (
                                            <Link
                                                href="/my-page"
                                                className="text-lg font-medium uppercase tracking-wider text-zinc-400 hover:text-white"
                                            >
                                                My Page
                                            </Link>
                                        )}
                                    </div>
                                    <div className="p-6 border-t border-zinc-800 flex flex-col gap-3">
                                        {user ? (
                                            <form action={signOut}>
                                                <Button type="submit" variant="ghost" className="w-full justify-start gap-2 text-zinc-400 hover:text-red-500 hover:bg-zinc-800">
                                                    <LogOut className="w-4 h-4" />
                                                    LOGOUT
                                                </Button>
                                            </form>
                                        ) : (
                                            <>
                                                <Link href="/login" className="w-full py-3 text-center border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors uppercase tracking-wider text-sm">
                                                    Login
                                                </Link>
                                                <Link href="/join" className="w-full py-3 text-center bg-red-600 text-white hover:bg-red-500 transition-colors uppercase tracking-wider text-sm font-bold">
                                                    Sign Up
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-red-600 flex items-center justify-center group-hover:bg-red-500 transition-colors">
                                <span className="text-white font-bold text-xl font-[family-name:var(--font-oswald)]">V</span>
                            </div>
                            <span className="text-xl font-bold text-white font-[family-name:var(--font-oswald)] uppercase tracking-wider hidden sm:block">
                                VidFlow
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                  px-4 py-2 text-sm font-medium uppercase tracking-wider transition-all duration-200
                  ${item.highlight
                                        ? "text-red-500 hover:text-red-400 border-b-2 border-red-500"
                                        : "text-zinc-400 hover:text-white border-b-2 border-transparent hover:border-zinc-600"
                                    }
                `}
                            >
                                {item.label}
                            </Link>
                        ))}
                        {user && (
                            <Link
                                href="/my-page"
                                className="px-4 py-2 text-sm font-medium uppercase tracking-wider text-zinc-400 hover:text-white border-b-2 border-transparent hover:border-zinc-600 transition-all duration-200"
                            >
                                My Page
                            </Link>
                        )}
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-zinc-500 font-mono">
                                    {user.email?.split("@")[0]}
                                </span>
                                <form action={signOut}>
                                    <Button type="submit" variant="ghost" className="h-9 px-3 text-zinc-400 hover:text-red-500 hover:bg-zinc-800">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        LOGOUT
                                    </Button>
                                </form>
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors uppercase tracking-wider"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/join"
                                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium uppercase tracking-wider hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            {/* ==========================================
          🎬 MAIN CONTENT
          ========================================== */}
            <main className="flex-1">
                {children}
            </main>

            {/* ==========================================
          🎸 FOOTER - Heavy Metal Style
          ========================================== */}
            <footer className="bg-[#0A0A0A] border-t border-zinc-800">
                <div className="container mx-auto px-6 py-12">
                    {/* Footer Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Brand Column */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-red-600 flex items-center justify-center">
                                    <span className="text-white font-bold text-xl font-[family-name:var(--font-oswald)]">V</span>
                                </div>
                                <span className="text-xl font-bold text-white font-[family-name:var(--font-oswald)] uppercase tracking-wider">
                                    VidFlow
                                </span>
                            </div>
                            <p className="text-zinc-500 text-sm max-w-md mb-4 leading-relaxed">
                                보디빌딩 영상 프로덕션 엔진.<br />
                                <span className="text-zinc-400">Zero-Omission, Maximum Impact.</span>
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-white font-[family-name:var(--font-oswald)] uppercase tracking-wider text-sm mb-4 border-b border-red-900/30 pb-2 inline-block">
                                Quick Links
                            </h4>
                            <ul className="space-y-2">
                                {navItems.map(item => (
                                    <li key={item.href}>
                                        <Link href={item.href} className="text-zinc-500 hover:text-red-500 text-sm transition-colors">
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className="text-white font-[family-name:var(--font-oswald)] uppercase tracking-wider text-sm mb-4 border-b border-red-900/30 pb-2 inline-block">
                                Support
                            </h4>
                            <ul className="space-y-2">
                                <li><Link href="/support" className="text-zinc-500 hover:text-white text-sm transition-colors">FAQ</Link></li>
                                <li><Link href="/support" className="text-zinc-500 hover:text-white text-sm transition-colors">Privacy</Link></li>
                                <li><Link href="/support" className="text-zinc-500 hover:text-white text-sm transition-colors">Terms</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Copyright Bar */}
                    <div className="border-t border-zinc-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between text-xs">
                        <p className="text-zinc-600 uppercase tracking-widest text-center md:text-left">
                            © 2026 VidFlow. All rights reserved.
                        </p>
                        <p className="text-zinc-700 uppercase tracking-widest mt-4 md:mt-0 text-center md:text-right">
                            Engineered by <span className="text-red-800 font-bold">Venom</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

import Link from "next/link";

/**
 * 🌍 Public Layout
 * 고객/일반 사용자 영역 (쇼케이스, 이벤트, 마이페이지)
 * Heavy Metal Theme: Deep Black + Impact Red
 * 
 * Features:
 * - Full-width Global Navigation Bar
 * - Responsive Footer with Links
 * - Sharp Edges Design Language
 */

// Navigation Items
const navItems = [
    { href: "/showcase", label: "Showcase", highlight: true },
    { href: "/events", label: "Events" },
    { href: "/my-page", label: "My Page" },
];

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* ==========================================
          🎸 GLOBAL NAVIGATION BAR
          ========================================== */}
            <header className="bg-[#0A0A0A] border-b border-zinc-800 sticky top-0 z-50">
                <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        {/* Logo Mark */}
                        <div className="w-10 h-10 bg-red-600 flex items-center justify-center group-hover:bg-red-500 transition-colors">
                            <span className="text-white font-bold text-xl font-[family-name:var(--font-oswald)]">V</span>
                        </div>
                        {/* Logo Text */}
                        <span className="text-xl font-bold text-white font-[family-name:var(--font-oswald)] uppercase tracking-wider">
                            VidFlow
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-1">
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
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/login"
                            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors uppercase tracking-wider"
                        >
                            Login
                        </Link>
                        <Link
                            href="/join"
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium uppercase tracking-wider hover:bg-red-500 transition-colors"
                        >
                            Sign Up
                        </Link>
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
                            <p className="text-zinc-500 text-sm max-w-md mb-4">
                                보디빌딩 대회 영상 프로덕션의 전 과정을 관리하는 통합 비즈니스 엔진.
                                Zero-Omission(누락 제로) & Profit-Centric(순수익 중심) 철학.
                            </p>
                            <div className="flex items-center gap-4">
                                <a href="#" className="text-zinc-600 hover:text-white transition-colors">
                                    📧 Contact
                                </a>
                                <a href="#" className="text-zinc-600 hover:text-white transition-colors">
                                    📱 Instagram
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-white font-[family-name:var(--font-oswald)] uppercase tracking-wider text-sm mb-4">
                                Quick Links
                            </h4>
                            <ul className="space-y-2">
                                <li>
                                    <Link href="/showcase" className="text-zinc-500 hover:text-white text-sm transition-colors">
                                        Showcase
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/events" className="text-zinc-500 hover:text-white text-sm transition-colors">
                                        Upcoming Events
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/my-page" className="text-zinc-500 hover:text-white text-sm transition-colors">
                                        My Orders
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className="text-white font-[family-name:var(--font-oswald)] uppercase tracking-wider text-sm mb-4">
                                Support
                            </h4>
                            <ul className="space-y-2">
                                <li>
                                    <a href="#" className="text-zinc-500 hover:text-white text-sm transition-colors">
                                        FAQ
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-zinc-500 hover:text-white text-sm transition-colors">
                                        Privacy Policy
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-zinc-500 hover:text-white text-sm transition-colors">
                                        Terms of Service
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Copyright Bar */}
                    <div className="border-t border-zinc-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
                        <p className="text-zinc-600 text-xs uppercase tracking-widest">
                            © 2026 VidFlow. All rights reserved.
                        </p>
                        <p className="text-zinc-700 text-xs uppercase tracking-widest mt-4 md:mt-0">
                            Powered by <span className="text-red-600">Heavy Metal</span> Design System
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

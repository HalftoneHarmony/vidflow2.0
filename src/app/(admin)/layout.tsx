import Link from "next/link";

/**
 * 🛠 Admin Layout
 * 관리자 영역 (대시보드, 파이프라인, 재무, 상품, 사용자 관리)
 * Heavy Metal Theme: Deep Black + Impact Red
 * 
 * Features:
 * - Fixed Sidebar with Navigation
 * - Top Bar with Admin Status
 * - Sharp Edges, No Rounded Corners
 */

// Navigation Items
const navItems = [
    { href: "/dashboard", icon: "📊", label: "Dashboard", description: "수익 분석 및 KPI" },
    { href: "/pipeline", icon: "🏭", label: "Pipeline", description: "칸반 보드" },
    { href: "/finance", icon: "💰", label: "Finance", description: "매출/지출 관리" },
    { href: "/products", icon: "📦", label: "Products", description: "패키지 관리" },
    { href: "/users", icon: "👥", label: "Users", description: "사용자 관리" },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* ==========================================
          🎸 SIDEBAR - Heavy Metal Navigation
          ========================================== */}
            <aside className="w-64 bg-[#0A0A0A] border-r border-zinc-800 flex flex-col fixed h-screen">
                {/* Logo Section */}
                <div className="p-6 border-b border-zinc-800">
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        {/* Logo Mark */}
                        <div className="w-10 h-10 bg-red-600 flex items-center justify-center group-hover:bg-red-500 transition-colors">
                            <span className="text-white font-bold text-xl font-[family-name:var(--font-oswald)]">V</span>
                        </div>
                        {/* Logo Text */}
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-white font-[family-name:var(--font-oswald)] uppercase tracking-wider">
                                VidFlow
                            </span>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                                Admin Control
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800/50 border-l-2 border-transparent hover:border-red-500 transition-all duration-200 group"
                        >
                            <span className="text-lg">{item.icon}</span>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium font-[family-name:var(--font-oswald)] uppercase tracking-wide">
                                    {item.label}
                                </span>
                                <span className="text-[10px] text-zinc-600 group-hover:text-zinc-500">
                                    {item.description}
                                </span>
                            </div>
                        </Link>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-zinc-800">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 bg-zinc-800 flex items-center justify-center">
                            <span className="text-zinc-400 text-sm">👤</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-zinc-300">Admin</span>
                            <span className="text-[10px] text-zinc-600">시스템 관리자</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ==========================================
          🎬 MAIN CONTENT AREA
          ========================================== */}
            <div className="flex-1 flex flex-col ml-64">
                {/* Top Bar */}
                <header className="h-16 bg-[#0A0A0A] border-b border-zinc-800 flex items-center justify-between px-6 sticky top-0 z-40">
                    {/* Left: Page Context */}
                    <div className="flex items-center gap-4">
                        <span className="text-zinc-500 font-[family-name:var(--font-oswald)] uppercase tracking-wider text-sm">
                            Admin Control Center
                        </span>
                    </div>

                    {/* Right: Status & Actions */}
                    <div className="flex items-center gap-4">
                        {/* System Status */}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800">
                            <span className="w-2 h-2 bg-green-500 animate-pulse"></span>
                            <span className="text-xs text-zinc-400 uppercase tracking-wider">
                                System Online
                            </span>
                        </div>

                        {/* Notifications */}
                        <button className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                            🔔
                        </button>

                        {/* Profile */}
                        <button className="w-10 h-10 bg-red-600/20 border border-red-600/30 flex items-center justify-center hover:bg-red-600/30 transition-colors">
                            <span className="text-red-500 font-bold text-sm">A</span>
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-6 bg-gradient-to-b from-black to-[#0A0A0A]">
                    {children}
                </main>
            </div>
        </div>
    );
}

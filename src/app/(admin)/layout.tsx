/**
 * 🛠 Admin Layout
 * 관리자 영역 (대시보드, 파이프라인, 재무, 상품, 사용자 관리)
 * Sidebar + Topbar 레이아웃
 */
export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-zinc-950 text-white flex">
            {/* TODO: Sidebar */}
            <aside className="w-64 bg-black border-r border-zinc-800 p-4">
                <div className="text-xl font-bold text-red-500 mb-8">VidFlow Admin</div>
                <nav className="space-y-2">
                    <a href="/dashboard" className="block px-4 py-2 hover:bg-zinc-800 rounded">📊 Dashboard</a>
                    <a href="/pipeline" className="block px-4 py-2 hover:bg-zinc-800 rounded">🏭 Pipeline</a>
                    <a href="/finance" className="block px-4 py-2 hover:bg-zinc-800 rounded">💰 Finance</a>
                    <a href="/products" className="block px-4 py-2 hover:bg-zinc-800 rounded">📦 Products</a>
                    <a href="/users" className="block px-4 py-2 hover:bg-zinc-800 rounded">👥 Users</a>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* TODO: Topbar */}
                <header className="h-16 border-b border-zinc-800 flex items-center px-6">
                    <span className="text-zinc-400">Admin Control Center</span>
                </header>

                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

/**
 * 🌍 Public Layout
 * 고객/일반 사용자 영역 (쇼케이스, 이벤트, 마이페이지)
 * GNB(메뉴), Footer 포함
 */
export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black text-white">
            {/* TODO: Global Navigation Bar */}
            <header className="border-b border-zinc-800">
                <nav className="container mx-auto px-4 py-4">
                    <span className="text-xl font-bold text-red-500">VidFlow</span>
                </nav>
            </header>

            <main>{children}</main>

            {/* TODO: Footer */}
            <footer className="border-t border-zinc-800 py-8 text-center text-zinc-500">
                © 2026 VidFlow. All rights reserved.
            </footer>
        </div>
    );
}

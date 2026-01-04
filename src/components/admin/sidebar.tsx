"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart3, Grip, Wallet, Package as PackageIcon, Users, Truck } from "lucide-react";

/**
 * 🎸 Admin Sidebar Component
 * Reusable for Desktop (Fixed) and Mobile (Sheet)
 */

// Navigation Items with Icons
const navItems = [
    { href: "/dashboard", icon: BarChart3, label: "Dashboard", description: "수익 분석 및 KPI" },
    { href: "/pipeline", icon: Grip, label: "Pipeline", description: "칸반 보드" },
    { href: "/delivery", icon: Truck, label: "Delivery", description: "전송 관리" },
    { href: "/finance", icon: Wallet, label: "Finance", description: "매출/지출 관리" },
    { href: "/products", icon: PackageIcon, label: "Products", description: "패키지 관리" },
    { href: "/users", icon: Users, label: "Users", description: "사용자 관리" },
];

export function AdminSidebar({ className }: { className?: string }) {
    const pathname = usePathname();

    return (
        <div className={cn("flex flex-col h-full bg-[#0A0A0A] border-r border-zinc-800", className)}>
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
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 border-l-2 transition-all duration-200 group",
                                isActive
                                    ? "text-white bg-zinc-800/50 border-red-500"
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/30 border-transparent hover:border-red-500/50"
                            )}
                        >
                            <span className={cn("text-lg", isActive ? "text-red-500" : "text-zinc-500 group-hover:text-red-400")}>
                                <item.icon className="w-5 h-5" />
                            </span>
                            <div className="flex flex-col">
                                <span className={cn(
                                    "text-sm font-medium font-[family-name:var(--font-oswald)] uppercase tracking-wide",
                                    isActive ? "text-white" : "text-zinc-400 group-hover:text-white"
                                )}>
                                    {item.label}
                                </span>
                                <span className="text-[10px] text-zinc-600 group-hover:text-zinc-500">
                                    {item.description}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-zinc-800">
                <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900/30 border border-zinc-800/50">
                    <div className="w-8 h-8 bg-zinc-800 flex items-center justify-center border border-zinc-700">
                        <span className="text-zinc-400 text-sm">👤</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-zinc-300 font-bold">Admin</span>
                        <span className="text-[10px] text-zinc-500">System Operator</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
    BarChart3,
    Grip,
    Package as PackageIcon,
    Users,
    Truck,
    LogOut,
    Calendar,
    Film,
    Info,
    TrendingUp,
    MessageSquare,
    ScrollText,
    Megaphone,
    Settings,
    ChevronDown,
    Lightbulb,
    ShoppingCart,
    Boxes,
    HeadphonesIcon,
    Wrench
} from "lucide-react";
import { signOut } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

/**
 * 🎸 Admin Sidebar Component (Refactored with Groups)
 * 5 핵심 그룹으로 재구성됨
 * 
 * 1. Insight - Dashboard, Analytics
 * 2. Fulfillment - Pipeline, Delivery
 * 3. Inventory - Events, Products, Showcase
 * 4. CRM - Users, Contacts
 * 5. System - Announcements, About, Settings, Logs
 * 
 * @author Vulcan (The Forge Master)
 */

// ==========================================
// Types
// ==========================================

type NavItem = {
    href: string;
    icon: any;
    label: string;
    description: string;
};

type NavGroup = {
    id: string;
    label: string;
    icon: any;
    color: string;
    items: NavItem[];
};

// ==========================================
// Navigation Structure
// ==========================================

const navGroups: NavGroup[] = [
    {
        id: "insight",
        label: "Insight",
        icon: Lightbulb,
        color: "emerald",
        items: [
            { href: "/admin/dashboard", icon: BarChart3, label: "Dashboard", description: "KPI 및 현황" },
            { href: "/admin/analytics", icon: TrendingUp, label: "Analytics", description: "통합 데이터 분석" },
        ],
    },
    {
        id: "fulfillment",
        label: "Fulfillment",
        icon: ShoppingCart,
        color: "blue",
        items: [
            { href: "/admin/pipeline", icon: Grip, label: "Pipeline", description: "칸반 보드" },
            { href: "/admin/delivery", icon: Truck, label: "Delivery", description: "전송 관리" },
        ],
    },
    {
        id: "inventory",
        label: "Inventory",
        icon: Boxes,
        color: "amber",
        items: [
            { href: "/admin/events", icon: Calendar, label: "Events", description: "대회 관리" },
            { href: "/admin/products", icon: PackageIcon, label: "Products", description: "패키지 관리" },
            { href: "/admin/showcase", icon: Film, label: "Showcase", description: "쇼케이스 관리" },
        ],
    },
    {
        id: "crm",
        label: "CRM",
        icon: HeadphonesIcon,
        color: "violet",
        items: [
            { href: "/admin/crm", icon: TrendingUp, label: "Marketing", description: "업셀링 & 세그먼트" },
            { href: "/admin/users", icon: Users, label: "Users", description: "사용자 관리" },
            { href: "/admin/contacts", icon: MessageSquare, label: "Contacts", description: "문의 관리" },
        ],
    },
    {
        id: "system",
        label: "System",
        icon: Wrench,
        color: "zinc",
        items: [
            { href: "/admin/announcements", icon: Megaphone, label: "Announcements", description: "공지사항" },
            { href: "/admin/about", icon: Info, label: "About", description: "소개 페이지" },
            { href: "/admin/settings/general", icon: Settings, label: "Settings", description: "일반 설정" },
            { href: "/admin/logs", icon: ScrollText, label: "Logs", description: "활동 로그" },
        ],
    },
];

// ==========================================
// Color Mapping
// ==========================================

const colorMap: Record<string, { text: string; bg: string; border: string; hover: string }> = {
    emerald: {
        text: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        hover: "hover:bg-emerald-500/5",
    },
    blue: {
        text: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        hover: "hover:bg-blue-500/5",
    },
    amber: {
        text: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        hover: "hover:bg-amber-500/5",
    },
    violet: {
        text: "text-violet-500",
        bg: "bg-violet-500/10",
        border: "border-violet-500/30",
        hover: "hover:bg-violet-500/5",
    },
    zinc: {
        text: "text-zinc-400",
        bg: "bg-zinc-500/10",
        border: "border-zinc-500/30",
        hover: "hover:bg-zinc-500/5",
    },
};

// ==========================================
// Sidebar Props
// ==========================================

interface AdminSidebarProps {
    className?: string;
    userName?: string;
    userRole?: string;
    siteName?: string;
    siteLogo?: string;
}

// ==========================================
// Main Component
// ==========================================

export function AdminSidebar({ className, userName, userRole, siteName = "VidFlow", siteLogo = "V" }: AdminSidebarProps) {
    const pathname = usePathname();

    // Find which group is active based on current path
    const getActiveGroup = () => {
        for (const group of navGroups) {
            if (group.items.some(item => pathname.startsWith(item.href))) {
                return group.id;
            }
        }
        return "insight"; // Default
    };

    // Track open groups (can have multiple open)
    const [openGroups, setOpenGroups] = useState<Set<string>>(new Set([getActiveGroup()]));

    // Auto-open group when navigating
    useEffect(() => {
        const activeGroup = getActiveGroup();
        if (!openGroups.has(activeGroup)) {
            setOpenGroups(prev => new Set([...prev, activeGroup]));
        }
    }, [pathname]);

    const toggleGroup = (groupId: string) => {
        setOpenGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupId)) {
                newSet.delete(groupId);
            } else {
                newSet.add(groupId);
            }
            return newSet;
        });
    };

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <div className={cn("flex flex-col h-full bg-[#050505] border-r border-zinc-800", className)}>
            {/* Logo Section */}
            <div className="p-6 border-b border-zinc-800/50 bg-black/20">
                <Link href="/admin/dashboard" className="flex items-center gap-3 group">
                    {/* Logo Mark */}
                    <div className="w-10 h-10 bg-red-600 flex items-center justify-center group-hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                        <span className="text-white font-bold text-xl font-[family-name:var(--font-oswald)]">{siteLogo}</span>
                    </div>
                    {/* Logo Text */}
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-white font-[family-name:var(--font-oswald)] uppercase tracking-wider group-hover:text-red-500 transition-colors">
                            {siteName}
                        </span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                            Admin Control
                        </span>
                    </div>
                </Link>
            </div>

            {/* Navigation Groups */}
            <nav className="flex-1 p-3 space-y-2 overflow-y-auto custom-scrollbar">
                {navGroups.map((group) => {
                    const isOpen = openGroups.has(group.id);
                    const hasActiveItem = group.items.some(item => pathname.startsWith(item.href));
                    const colors = colorMap[group.color];
                    const GroupIcon = group.icon;

                    return (
                        <div key={group.id} className="space-y-1">
                            {/* Group Header */}
                            <button
                                onClick={() => toggleGroup(group.id)}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200",
                                    "border border-transparent",
                                    hasActiveItem ? `${colors.bg} ${colors.border}` : `hover:bg-zinc-900/50 hover:border-zinc-800`,
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-7 h-7 rounded-md flex items-center justify-center transition-colors",
                                        hasActiveItem ? colors.bg : "bg-zinc-800/50"
                                    )}>
                                        <GroupIcon className={cn(
                                            "w-4 h-4 transition-colors",
                                            hasActiveItem ? colors.text : "text-zinc-500"
                                        )} />
                                    </div>
                                    <span className={cn(
                                        "text-xs font-bold uppercase tracking-widest transition-colors",
                                        hasActiveItem ? "text-white" : "text-zinc-500"
                                    )}>
                                        {group.label}
                                    </span>
                                </div>
                                <ChevronDown className={cn(
                                    "w-4 h-4 text-zinc-600 transition-transform duration-200",
                                    isOpen && "rotate-180"
                                )} />
                            </button>

                            {/* Group Items */}
                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pl-4 space-y-0.5 pt-1">
                                            {group.items.map((item) => {
                                                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                                                const ItemIcon = item.icon;

                                                return (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        className={cn(
                                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg border-l-2 transition-all duration-200 group/item",
                                                            isActive
                                                                ? "text-white bg-gradient-to-r from-red-900/20 to-transparent border-red-500"
                                                                : "text-zinc-400 hover:text-white hover:bg-zinc-800/30 border-transparent hover:border-red-500/30"
                                                        )}
                                                    >
                                                        <ItemIcon className={cn(
                                                            "w-4 h-4 transition-all duration-200",
                                                            isActive ? "text-red-500" : "text-zinc-600 group-hover/item:text-red-400"
                                                        )} />
                                                        <div className="flex flex-col">
                                                            <span className={cn(
                                                                "text-sm font-medium font-[family-name:var(--font-oswald)] uppercase tracking-wide",
                                                                isActive ? "text-white" : "text-zinc-400 group-hover/item:text-white"
                                                            )}>
                                                                {item.label}
                                                            </span>
                                                            <span className="text-[10px] text-zinc-600 group-hover/item:text-zinc-500">
                                                                {item.description}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </nav>

            {/* Sidebar Footer - User Profile & Logout */}
            <div className="p-4 border-t border-zinc-800/50 bg-black/20 space-y-3">
                {/* User Info */}
                <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm rounded-lg">
                    <div className="w-8 h-8 bg-red-600/20 flex items-center justify-center border border-red-900/50 rounded-md">
                        <span className="text-red-500 text-sm font-bold">
                            {userName?.charAt(0).toUpperCase() || "A"}
                        </span>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm text-zinc-300 font-bold truncate">
                            {userName || "Admin"}
                        </span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                            {userRole || "ADMIN"}
                        </span>
                    </div>
                </div>

                {/* Logout Button */}
                <form action={handleLogout}>
                    <Button
                        type="submit"
                        variant="ghost"
                        className="w-full justify-start gap-2 text-zinc-500 hover:text-red-500 hover:bg-red-950/10 border border-transparent hover:border-red-900/50 transition-all uppercase tracking-wider text-xs font-bold rounded-lg"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}

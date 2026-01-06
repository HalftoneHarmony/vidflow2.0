"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Menu, LogOut, X, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut } from "@/features/auth/actions";
import { User } from "@supabase/supabase-js";

interface NavbarProps {
    user: User | null;
    siteName: string;
    siteLogo: string;
}

const navItems = [
    { href: "/showcase", label: "Showcase", highlight: true },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/about", label: "About" },
    { href: "/events", label: "Events" },
    { href: "/support", label: "Support" },
];

export function Navbar({ user, siteName, siteLogo }: NavbarProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { scrollY } = useScroll();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Scroll progress line
    const scrollProgress = useTransform(scrollY, [0, 100], ["0%", "100%"]);

    return (
        <>
            <motion.header
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/0",
                    isScrolled ? "bg-black/80 backdrop-blur-md border-white/10 py-2 h-16" : "bg-transparent py-6 h-24"
                )}
            >
                <div className="container mx-auto px-6 h-full flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="relative z-50 group flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600 flex items-center justify-center transform group-hover:rotate-45 transition-transform duration-300">
                            <span className="text-white font-black text-xl font-[family-name:var(--font-oswald)] -rotate-0 group-hover:-rotate-45 transition-transform duration-300">
                                {siteLogo}
                            </span>
                        </div>
                        <span className={cn(
                            "text-2xl font-black font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors duration-300",
                            isScrolled ? "text-white" : "text-white"
                        )}>
                            {siteName}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="relative group py-2"
                                >
                                    <span className={cn(
                                        "text-sm font-bold uppercase tracking-[0.15em] transition-colors duration-300",
                                        isActive ? "text-red-500" : "text-zinc-400 group-hover:text-white",
                                        item.highlight && !isActive && "text-white"
                                    )}>
                                        {item.label}
                                    </span>
                                    <span className={cn(
                                        "absolute bottom-0 left-0 w-full h-[2px] bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right group-hover:origin-left",
                                        isActive && "scale-x-100"
                                    )} />
                                </Link>
                            );
                        })}

                        {user && (
                            <Link href="/my-page" className="relative group py-2">
                                <span className={cn(
                                    "text-sm font-bold uppercase tracking-[0.15em] transition-colors duration-300",
                                    pathname === "/my-page" ? "text-red-500" : "text-zinc-400 group-hover:text-white"
                                )}>
                                    My Page
                                </span>
                                <span className={cn(
                                    "absolute bottom-0 left-0 w-full h-[2px] bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right group-hover:origin-left",
                                    pathname === "/my-page" && "scale-x-100"
                                )} />
                            </Link>
                        )}
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-6">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-zinc-500 font-mono tracking-widest uppercase">
                                    {user.email?.split("@")[0]}
                                </span>
                                <form action={signOut}>
                                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-red-500 hover:bg-zinc-900 uppercase tracking-wider text-xs font-bold">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Exit
                                    </Button>
                                </form>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/login"
                                    className="text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                                >
                                    Login
                                </Link>
                                <Link href="/join">
                                    <Button
                                        size="sm"
                                        className="bg-red-600 hover:bg-red-700 text-white border-0 font-bold uppercase tracking-widest px-6 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all"
                                    >
                                        Join Us
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden relative z-50 p-2 text-white"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: "100%" }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-0 z-40 bg-zinc-950 flex flex-col pt-32 px-8 md:hidden"
                        >
                            <nav className="flex flex-col gap-8">
                                {navItems.map((item, i) => (
                                    <motion.div
                                        key={item.href}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + i * 0.05 }}
                                    >
                                        <Link
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="text-4xl font-black uppercase tracking-tight text-white hover:text-red-600 transition-colors"
                                        >
                                            {item.label}
                                        </Link>
                                    </motion.div>
                                ))}
                                {user && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <Link
                                            href="/my-page"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="text-4xl font-black uppercase tracking-tight text-white hover:text-red-600 transition-colors"
                                        >
                                            My Page
                                        </Link>
                                    </motion.div>
                                )}
                            </nav>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="mt-12 pt-12 border-t border-zinc-900 flex flex-col gap-4"
                            >
                                {user ? (
                                    <form action={signOut}>
                                        <Button variant="outline" className="w-full justify-center text-lg h-12 border-zinc-800 text-zinc-400 hover:text-red-500 hover:border-red-500 uppercase tracking-widest font-bold bg-transparent">
                                            Log Out
                                        </Button>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button variant="outline" className="w-full text-lg h-12 border-zinc-800 text-white hover:bg-zinc-900 uppercase tracking-widest font-bold bg-transparent">
                                                Login
                                            </Button>
                                        </Link>
                                        <Link href="/join" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button className="w-full text-lg h-12 bg-red-600 hover:bg-red-700 text-white border-0 uppercase tracking-widest font-bold">
                                                Join
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>
        </>
    );
}

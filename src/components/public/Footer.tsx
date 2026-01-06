"use client";

import Link from "next/link";
import { useState } from "react";
import { MoveRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface FooterProps {
    siteName: string;
    siteLogo: string;
    footerDesc?: string;
    newsletterTitle?: string;
    newsletterText?: string;
    socials?: {
        instagram?: string;
        youtube?: string;
        twitter?: string;
    };
}

export function Footer({
    siteName,
    siteLogo,
    footerDesc = "The definitive platform for bodybuilding cinematography. Built for impact. Designed for domination.",
    newsletterTitle = "Stay Updated",
    newsletterText = "Join the elite circle. Get updates on new features and exclusive events.",
    socials
}: FooterProps) {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        // Simulate API call
        setTimeout(() => {
            setStatus("success");
            setEmail("");
        }, 1500);
    };

    return (
        <footer className="bg-[#050505] border-t border-zinc-900 pt-20 pb-10 overflow-hidden relative">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-900/50 to-transparent" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
                    {/* Brand Column */}
                    <div className="md:col-span-5">
                        <Link href="/" className="flex items-center gap-3 mb-8 group w-fit">
                            <div className="w-12 h-12 bg-red-600 flex items-center justify-center group-hover:bg-red-500 transition-colors">
                                <span className="text-white font-black text-2xl font-[family-name:var(--font-oswald)]">{siteLogo}</span>
                            </div>
                            <span className="text-3xl font-black text-white font-[family-name:var(--font-oswald)] uppercase tracking-wider">
                                {siteName}
                            </span>
                        </Link>
                        <p className="text-zinc-500 max-w-sm mb-8 leading-relaxed font-light text-lg">
                            {footerDesc}
                        </p>

                        <div className="flex gap-4">
                            {socials?.instagram && (
                                <a href={socials.instagram} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-red-600 uppercase text-xs font-bold tracking-widest border border-zinc-800 px-4 py-2 hover:border-red-600/50 transition-all">
                                    Instagram
                                </a>
                            )}
                            {socials?.youtube && (
                                <a href={socials.youtube} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-red-600 uppercase text-xs font-bold tracking-widest border border-zinc-800 px-4 py-2 hover:border-red-600/50 transition-all">
                                    Youtube
                                </a>
                            )}
                            {socials?.twitter && (
                                <a href={socials.twitter} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-red-600 uppercase text-xs font-bold tracking-widest border border-zinc-800 px-4 py-2 hover:border-red-600/50 transition-all">
                                    Twitter
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="md:col-span-3">
                        <h4 className="text-white font-black uppercase tracking-widest text-sm mb-8 text-red-600">
                            Platform
                        </h4>
                        <ul className="space-y-4">
                            {[
                                { label: 'Showcase', href: '/showcase' },
                                { label: 'Events', href: '/events' },
                                { label: 'About Us', href: '/about' },
                                { label: 'Contact', href: '/support' }
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link href={item.href} className="text-zinc-500 hover:text-white transition-colors uppercase tracking-wider text-sm font-medium flex items-center gap-2 group">
                                        <span className="w-0 group-hover:w-2 h-[1px] bg-red-600 transition-all duration-300" />
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div className="md:col-span-4">
                        <h4 className="text-white font-black uppercase tracking-widest text-sm mb-8 text-red-600">
                            {newsletterTitle}
                        </h4>
                        <p className="text-zinc-500 text-sm mb-6">
                            {newsletterText}
                        </p>

                        <form onSubmit={handleSubmit} className="relative">
                            <div className="relative group">
                                <input
                                    type="email"
                                    required
                                    placeholder="ENTER YOUR EMAIL"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={status === "success"}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-6 py-4 uppercase tracking-widest text-xs focus:outline-none focus:border-red-600 transition-colors placeholder:text-zinc-700"
                                />
                                <button
                                    type="submit"
                                    disabled={status !== "idle"}
                                    className="absolute right-2 top-2 bottom-2 aspect-square bg-zinc-800 hover:bg-red-600 text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed group-hover:bg-zinc-700 group-focus-within:bg-red-600"
                                >
                                    {status === "success" ? (
                                        <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                        <MoveRight className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {status === "success" && (
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute -bottom-8 left-0 text-green-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                                >
                                    <CheckCircle2 className="w-3 h-3" /> Successfully Subscribed
                                </motion.p>
                            )}
                        </form>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-zinc-600 text-[10px] uppercase tracking-[0.2em]">
                        © {new Date().getFullYear()} {siteName}. All Rights Reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="text-zinc-600 hover:text-white text-[10px] uppercase tracking-[0.2em] transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-zinc-600 hover:text-white text-[10px] uppercase tracking-[0.2em] transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>

            {/* Massive Watermark */}
            <div className="absolute -bottom-20 -right-20 pointer-events-none opacity-[0.02] select-none">
                <span className="text-[20rem] font-black uppercase leading-none text-white whitespace-nowrap">
                    HEAVY METAL
                </span>
            </div>
        </footer>
    );
}

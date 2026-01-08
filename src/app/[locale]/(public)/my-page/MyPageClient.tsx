"use client";

import { useState, useEffect } from "react";
import { User, ShoppingBag, MessageSquare, LogOut, ChevronRight } from "lucide-react";
import { OrderHistoryList } from "./OrderHistoryList";
import { UserProfileView } from "./UserProfileView";
import { InquiryHistoryList } from "./InquiryHistoryList";
import { DashboardStats } from "@/features/user/components/DashboardStats";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

interface MyPageClientProps {
    user: any;
    profile: any;
    orders: any[];
    inquiries: any[];
    preferences: any;
}

type Tab = "orders" | "profile" | "inquiries";

// Typing Effect Component
function TypewriterEffect({ text }: { text: string }) {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayedText((prev) => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, 50); // Speed of typing
        return () => clearInterval(timer);
    }, [text]);

    return <span>{displayedText}</span>;
}

export function MyPageClient({ user, profile, orders, inquiries, preferences }: MyPageClientProps) {
    const t = useTranslations("MyPage");
    const [activeTab, setActiveTab] = useState<Tab>("orders");
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    const userName = profile?.name || user.email?.split("@")[0];

    return (
        <div className="min-h-screen bg-black">
            <div className="container mx-auto px-4 py-16">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 relative z-10">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter"
                        >
                            {t("header")}
                        </motion.h1>
                        <p className="text-zinc-400 text-lg flex items-center gap-2 h-8">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            <span>{t("welcome")}</span>
                            <span className="text-white font-bold">
                                <TypewriterEffect text={userName} />
                            </span>
                            <span>{t("user_suffix")}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSignOut}
                            className="group flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 hover:bg-zinc-900 transition-all text-sm"
                        >
                            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            {t("btn_logout")}
                        </button>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <DashboardStats orderCount={orders.length} inquiryCount={inquiries.length} />

                {/* Tabs */}
                <div className="flex items-center gap-2 border-b border-zinc-800 mb-8 overflow-x-auto no-scrollbar">
                    {[
                        { id: "orders", label: t("tab_orders"), icon: ShoppingBag },
                        { id: "inquiries", label: t("tab_inquiries"), icon: MessageSquare },
                        { id: "profile", label: t("tab_profile"), icon: User },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`relative flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all whitespace-nowrap overflow-hidden group ${activeTab === tab.id ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                                }`}
                        >
                            <span className={`absolute inset-x-0 bottom-0 h-[2px] bg-red-600 transition-transform duration-300 ${activeTab === tab.id ? "scale-x-100" : "scale-x-0 group-hover:scale-x-50"
                                }`} />
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-red-500" : "text-zinc-600"}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === "orders" && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                            <span className="w-1.5 h-6 bg-red-500 rounded-sm"></span>
                                            {t("section_orders")}
                                        </h2>
                                    </div>
                                    <OrderHistoryList orders={orders} />
                                </div>
                            )}

                            {activeTab === "inquiries" && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                            <span className="w-1.5 h-6 bg-red-500 rounded-sm"></span>
                                            {t("section_inquiries")}
                                        </h2>
                                        <button
                                            onClick={() => router.push("/support")}
                                            className="text-sm font-bold text-zinc-500 hover:text-white flex items-center gap-1 transition-colors"
                                        >
                                            {t("btn_new_inquiry")} <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <InquiryHistoryList inquiries={inquiries} />
                                </div>
                            )}

                            {activeTab === "profile" && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                            <span className="w-1.5 h-6 bg-red-500 rounded-sm"></span>
                                            {t("section_profile")}
                                        </h2>
                                    </div>
                                    <UserProfileView profile={profile} user={user} preferences={preferences} />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

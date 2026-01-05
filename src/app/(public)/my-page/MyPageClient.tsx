"use client";

import { useState } from "react";
import { User, ShoppingBag, MessageSquare, LogOut } from "lucide-react";
import { OrderHistoryList } from "./OrderHistoryList";
import { UserProfileView } from "./UserProfileView";
import { InquiryHistoryList } from "./InquiryHistoryList";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface MyPageClientProps {
    user: any;
    profile: any;
    orders: any[];
    inquiries: any[];
    preferences: any;
}

type Tab = "orders" | "profile" | "inquiries";

export function MyPageClient({ user, profile, orders, inquiries, preferences }: MyPageClientProps) {
    const [activeTab, setActiveTab] = useState<Tab>("orders");
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-black">
            <div className="container mx-auto px-4 py-16">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">MY PAGE</h1>
                        <p className="text-zinc-500">
                            환영합니다, <span className="text-white font-bold">{profile?.name || user.email?.split("@")[0]}</span>님.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-4 py-2 rounded border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors text-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            로그아웃
                        </button>
                    </div>
                </div>

                {/* Dashboard Stats (Optional Summary) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4">
                        <div className="text-sm text-zinc-500 mb-1">총 주문</div>
                        <div className="text-2xl font-black text-white">{orders.length}</div>
                    </div>
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4">
                        <div className="text-sm text-zinc-500 mb-1">문의 내역</div>
                        <div className="text-2xl font-black text-white">{inquiries.length}</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 border-b border-zinc-800 mb-8 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === "orders"
                            ? "border-red-500 text-white"
                            : "border-transparent text-zinc-500 hover:text-zinc-300"
                            }`}
                    >
                        <ShoppingBag className="w-4 h-4" />
                        주문 내역
                    </button>
                    <button
                        onClick={() => setActiveTab("inquiries")}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === "inquiries"
                            ? "border-red-500 text-white"
                            : "border-transparent text-zinc-500 hover:text-zinc-300"
                            }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        문의 내역
                    </button>
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === "profile"
                            ? "border-red-500 text-white"
                            : "border-transparent text-zinc-500 hover:text-zinc-300"
                            }`}
                    >
                        <User className="w-4 h-4" />
                        계정 정보
                    </button>
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                    {activeTab === "orders" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-red-500 rounded-sm"></span>
                                주문 내역
                            </h2>
                            <OrderHistoryList orders={orders} />
                        </div>
                    )}

                    {activeTab === "inquiries" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-red-500 rounded-sm"></span>
                                문의 내역
                            </h2>
                            <InquiryHistoryList inquiries={inquiries} />
                        </div>
                    )}

                    {activeTab === "profile" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-red-500 rounded-sm"></span>
                                계정 정보
                            </h2>
                            <UserProfileView profile={profile} user={user} preferences={preferences} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

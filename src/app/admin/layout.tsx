import { AdminSidebar } from "@/components/admin/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * 🛠 Admin Layout (Responsive)
 * 
 * Desktop: Fixed Sidebar
 * Mobile: Hidden Sidebar + Hamburger Menu (Sheet)
 */
export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    // Auth Check
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        redirect("/login");
    }

    // Profile Fetch
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    // Role Check (Optional: Middleware handles this, but doube check is good)
    if (profile?.role === "USER") {
        redirect("/my-page");
    }

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Desktop Sidebar (Hidden on Mobile) */}
            <aside className="hidden md:flex w-64 fixed h-screen z-50">
                <AdminSidebar
                    className="w-full"
                    userName={profile?.name || user.email?.split("@")[0]}
                    userRole={profile?.role}
                />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
                {/* Header */}
                <header className="h-16 bg-[#0A0A0A] border-b border-zinc-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 bg-opacity-90 backdrop-blur-md">
                    {/* Left: Mobile Menu Trigger & Context */}
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Trigger */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <button className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors">
                                    <Menu className="w-6 h-6" />
                                </button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-80 border-r border-zinc-800 bg-[#0A0A0A]">
                                <AdminSidebar
                                    userName={profile?.name || user.email?.split("@")[0]}
                                    userRole={profile?.role}
                                />
                            </SheetContent>
                        </Sheet>

                        {/* Page Title / Context */}
                        <span className="text-zinc-500 font-[family-name:var(--font-oswald)] uppercase tracking-wider text-sm hidden sm:block">
                            Admin Control Center
                        </span>
                        <span className="text-white font-[family-name:var(--font-oswald)] uppercase tracking-wider text-lg sm:hidden">
                            VidFlow
                        </span>
                    </div>

                    {/* Right: Status & Actions */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* System Status (Desktop Only) */}
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800">
                            <span className="w-2 h-2 bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                            <span className="text-xs text-zinc-400 uppercase tracking-wider">
                                System Online
                            </span>
                        </div>

                        {/* Notifications */}
                        <button className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors rounded-sm">
                            🔔
                        </button>

                        {/* Profile Avatar (Mini) */}
                        <div className="w-10 h-10 bg-red-600/20 border border-red-600/30 flex items-center justify-center text-red-500 font-bold text-sm">
                            {profile?.name ? profile.name.charAt(0).toUpperCase() : "A"}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-4 md:p-6 bg-gradient-to-b from-black to-[#0A0A0A] overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}

import { createClient } from "@/lib/supabase/server";
import { ShowcaseGallery } from "./ShowcaseGallery";
import { getPortfolioItems } from "@/features/showcase/queries";

export const metadata = {
    title: "Portfolio | VIDFLOW",
    description: "Explore our diverse portfolio of commercial, documentary, and creative video productions.",
};

export default async function PortfolioPage() {
    const items = await getPortfolioItems();

    // Get unique categories and sort them
    const rawCategories = items?.map((item) => item.category || "General") || [];
    const categories = ["All", ...Array.from(new Set(rawCategories)).sort()];

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white/20">
            {/* Hero Section */}
            <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden border-b border-zinc-900">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(50,50,50,0.4)_0%,rgba(0,0,0,1)_100%)] z-10" />
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=3270&auto=format&fit=crop')] bg-cover bg-center" />

                <div className="relative z-20 text-center px-4 max-w-5xl mx-auto space-y-6">
                    <div className="inline-block px-3 py-1 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-full text-xs font-medium tracking-widest text-zinc-400 mb-4 uppercase">
                        Beyond the Stage
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600 font-[family-name:var(--font-oswald)]">
                        CREATIVE WORKS
                    </h1>
                    <p className="text-lg md:text-2xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
                        High-impact commercials, documentaries, and brand stories crafted with the same intensity as our competition coverage.
                    </p>
                </div>
            </section>

            {/* Gallery Section */}
            <section className="container mx-auto px-4 py-20">
                <ShowcaseGallery items={items || []} categories={categories} />
            </section>
        </main>
    );
}

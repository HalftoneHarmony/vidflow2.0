import { createClient } from "@/lib/supabase/server";
import { ShowcaseGallery } from "./portfolio/ShowcaseGallery";
import { getPortfolioItems } from "@/features/showcase/queries";

export const metadata = {
    title: "VidFlow | Creative Production",
    description: "Explore our diverse portfolio of commercial, documentary, and creative video productions.",
};

export default async function HomePage() {
    const items = await getPortfolioItems();

    // Get unique categories and sort them
    const rawCategories = items?.map((item) => item.category || "General") || [];
    const categories = ["All", ...Array.from(new Set(rawCategories)).sort()];

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white/20">


            {/* Gallery Section */}
            <ShowcaseGallery items={items || []} categories={categories} />
        </main>
    );
}

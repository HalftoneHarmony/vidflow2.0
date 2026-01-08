import { createClient } from "@/lib/supabase/server";
import { ShowcaseGallery } from "./portfolio/ShowcaseGallery";
import { getPortfolioItems } from "@/features/showcase/queries";

import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: "Portfolio" });
    return {
        title: t("meta_title"),
        description: t("meta_description"),
    };
}

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

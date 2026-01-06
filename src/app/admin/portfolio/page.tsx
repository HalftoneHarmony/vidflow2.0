import { createClient } from "@/lib/supabase/server";
import { PortfolioAdminBoard } from "@/features/portfolio/components/PortfolioAdminBoard";

export const dynamic = "force-dynamic";

export default async function AdminWorksPage() {
    const supabase = await createClient();

    // Fetch items from portfolio_items
    const { data: works, error } = await supabase
        .from("portfolio_items")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching portfolio items:", error);
        return <div className="p-8 text-red-500">Error loading portfolio items.</div>;
    }

    return (
        <div className="p-8 min-h-screen bg-black text-white">
            <PortfolioAdminBoard items={works || []} />
        </div>
    );
}

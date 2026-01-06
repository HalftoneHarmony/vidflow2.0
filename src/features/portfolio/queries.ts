
import { createClient } from "@/lib/supabase/server";

export interface PortfolioItem {
    id: number;
    title: string;
    category: string;
    client_name: string | null;
    video_url: string;
    thumbnail_url: string | null;
    description: string | null;
    tags: string[] | null;
    is_public: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("is_public", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching portfolio items:", error);
        return [];
    }

    return data as PortfolioItem[];
}

export async function getPortfolioItemsByCategory(categories: string[]): Promise<PortfolioItem[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("is_public", true)
        .in("category", categories)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching portfolio items by category:", error);
        return [];
    }

    return data as PortfolioItem[];
}

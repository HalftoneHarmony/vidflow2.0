"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Create a new Portfolio Item (Creative Work)
 * Uses 'portfolio_items' table
 */
export async function createPortfolioItem(prevState: any, formData: FormData) {
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const client_name = formData.get("client_name") as string;
    const video_url = formData.get("video_url") as string;
    const thumbnail_url = formData.get("thumbnail_url") as string;
    const description = formData.get("description") as string;
    const tagsRaw = formData.get("tags") as string;

    const tags = tagsRaw && tagsRaw.trim() !== ""
        ? tagsRaw.split(",").map(t => t.trim())
        : [];

    const supabase = await createClient();

    try {
        const { error } = await supabase.from("portfolio_items").insert({
            title,
            category: category || "General",
            client_name: client_name || null,
            video_url: video_url,
            thumbnail_url: thumbnail_url || null,
            description: description || null,
            tags: tags,
            is_public: true
        });

        if (error) {
            console.error("DB Insert Error:", error);
            throw error;
        }

        revalidatePath("/portfolio");
        revalidatePath("/showcase");
        revalidatePath("/admin/portfolio");
        return { success: true, message: "Portfolio item created successfully!" };
    } catch (e: any) {
        return { success: false, message: e.message || "Failed to create item" };
    }
}

/**
 * Delete a Portfolio Item
 */
export async function deletePortfolioItem(id: number) {
    const supabase = await createClient();

    try {
        const { error } = await supabase
            .from("portfolio_items")
            .delete()
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/portfolio");
        revalidatePath("/showcase");
        revalidatePath("/admin/portfolio");
        return { success: true };
    } catch (error: any) {
        console.error("Delete Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Update a Portfolio Item
 */
export async function updatePortfolioItem(id: number, data: any) {
    const supabase = await createClient();

    try {
        const { error } = await supabase
            .from("portfolio_items")
            .update(data)
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/portfolio");
        revalidatePath("/showcase");
        revalidatePath("/admin/portfolio");
        return { success: true };
    } catch (error: any) {
        console.error("Update Error:", error);
        return { success: false, error: error.message };
    }
}

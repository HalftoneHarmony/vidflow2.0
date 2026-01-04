"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Update or Insert Showcase Video for a Package
 */
export async function upsertShowcaseVideo(packageId: number, mediaUrl: string) {
    const supabase = await createClient();

    try {
        if (!mediaUrl || mediaUrl.trim() === "") {
            // If URL is empty, delete existing video items for this package
            const { error } = await supabase
                .from("showcase_items")
                .delete()
                .eq("package_id", packageId)
                .eq("type", "VIDEO");

            if (error) throw error;

            revalidatePath("/admin/products");
            revalidatePath("/showcase");
            return { success: true };
        }

        // Check if item exists
        const { data: existingItems, error: fetchError } = await supabase
            .from("showcase_items")
            .select("id")
            .eq("package_id", packageId)
            .eq("type", "VIDEO");

        if (fetchError) throw fetchError;

        if (existingItems && existingItems.length > 0) {
            // Update the first existing video
            const { error } = await supabase
                .from("showcase_items")
                .update({
                    media_url: mediaUrl,
                    is_best_cut: true
                })
                .eq("id", existingItems[0].id);

            if (error) throw error;
        } else {
            // Insert new video
            const { error } = await supabase
                .from("showcase_items")
                .insert({
                    package_id: packageId,
                    type: "VIDEO",
                    media_url: mediaUrl,
                    is_best_cut: true
                });

            if (error) throw error;
        }

        revalidatePath("/admin/products");
        revalidatePath("/showcase");
        return { success: true };

    } catch (error: any) {
        console.error("[Showcase] Upsert Video Error:", error);
        return { success: false, error: error.message || "Failed to save video URL" };
    }
}

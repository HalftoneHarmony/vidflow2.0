"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function upsertSetting(key: string, value: string) {
    const supabase = await createClient();

    // Check admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    try {
        const { error } = await supabase.rpc('upsert_setting', {
            setting_key: key,
            setting_value: value
        });

        if (error) throw error;



        revalidatePath("/", "layout");
        return { success: true };
    } catch (e: any) {
        console.error("Failed to upsert setting:", e);
        return { success: false, error: e.message };
    }
}

export async function getSetting(key: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("general_settings")
        .select("value")
        .eq("key", key)
        .single();

    if (error) return null;
    return data.value;
}

export async function getSettings(keys: string[]) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("general_settings")
        .select("key, value")
        .in("key", keys);

    if (error) {
        console.error("Error fetching settings:", error);
        return {};
    }

    const settings: Record<string, string> = {};
    data?.forEach((item) => {
        settings[item.key] = item.value;
    });
    return settings;
}

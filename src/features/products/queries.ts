/**
 * 📦 Products Queries
 * 패키지 관리용 조회 쿼리
 */
import { createClient } from "@/lib/supabase/server";

export type Product = {
    id: number;
    event_id: number;
    name: string;
    price: number;
    description: string | null;
    composition: string[];
    is_sold_out: boolean;
    events?: {
        title: string;
        event_date: string;
    };
    showcase_items?: {
        id: number;
        type: "VIDEO" | "IMAGE";
        media_url: string;
        is_best_cut: boolean;
    }[];
};

/**
 * 모든 패키지 조회 (이벤트 정보 포함)
 */
export async function getAllPackages(): Promise<Product[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("packages")
        .select(`
            *,
            events (
                title,
                event_date
            ),
            showcase_items (
                id,
                type,
                media_url,
                is_best_cut
            )
        `)
        .order("id", { ascending: false });

    if (error) {
        console.error("[Products] Failed to fetch packages:", error);
        throw new Error(error.message);
    }

    // @ts-ignore: Supabase types complexity handling
    return data || [];
}

/**
 * 특정 패키지 조회
 */
export async function getPackageById(id: number): Promise<Product | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("packages")
        .select(`
            *,
            events (
                title,
                event_date
            )
        `)
        .eq("id", id)
        .single();

    if (error) {
        console.error(`[Products] Failed to fetch package ${id}:`, error);
        return null;
    }

    return data;
}

/**
 * 모든 이벤트 조회 (패키지 생성용)
 */
export async function getAllEvents() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("events")
        .select("id, title, event_date")
        .order("event_date", { ascending: false });

    if (error) {
        console.error("[Products] Failed to fetch events:", error);
        return [];
    }

    return data || [];
}

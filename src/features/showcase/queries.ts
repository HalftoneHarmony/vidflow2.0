/**
 * 🛒 Showcase Queries
 * 패키지 및 쇼케이스 미디어 조회
 *
 * @author Dealer (The Salesman)
 */

import { createClient } from "@/lib/supabase/server";

/**
 * 패키지 타입 정의
 */
export type Package = {
    id: number;
    event_id: number;
    name: string;
    price: number;
    description: string | null;
    composition: string[];
    specs: Record<string, string> | null;
    is_sold_out: boolean;
};

/**
 * 쇼케이스 아이템 타입 정의
 */
export type ShowcaseItem = {
    id: number;
    package_id: number;
    type: "VIDEO" | "IMAGE";
    media_url: string;
    thumbnail_url: string | null;
    is_best_cut: boolean;
};

/**
 * 패키지 + 쇼케이스 정보를 합친 타입
 */
export type PackageWithShowcase = Package & {
    showcase_items: ShowcaseItem[];
};

/**
 * 이벤트별 패키지 및 쇼케이스 미디어 조회
 *
 * @param eventId - 이벤트 ID
 * @returns 패키지 목록 (쇼케이스 미디어 포함)
 */
export async function getPackagesWithShowcase(
    eventId: number
): Promise<PackageWithShowcase[]> {
    const supabase = await createClient();

    // 1. 해당 이벤트의 패키지 목록 조회
    const { data: packages, error: packagesError } = await supabase
        .from("packages")
        .select("*")
        .eq("event_id", eventId)
        .order("price", { ascending: true });

    if (packagesError) {
        console.error("[Dealer] Failed to fetch packages:", packagesError);
        return [];
    }

    if (!packages || packages.length === 0) {
        return [];
    }

    const packageIds = packages.map((pkg) => pkg.id);

    // 2. 해당 패키지들의 쇼케이스 아이템 조회
    const { data: showcaseItems, error: showcaseError } = await supabase
        .from("showcase_items")
        .select("*")
        .in("package_id", packageIds)
        .order("is_best_cut", { ascending: false });

    if (showcaseError) {
        console.error("[Dealer] Failed to fetch showcase items:", showcaseError);
    }

    // 3. 패키지와 쇼케이스 아이템 조합
    const packagesWithShowcase: PackageWithShowcase[] = packages.map((pkg) => ({
        id: pkg.id,
        event_id: pkg.event_id,
        name: pkg.name,
        price: pkg.price,
        description: pkg.description,
        composition: (pkg.composition as string[]) || [],
        specs: pkg.specs as Record<string, string> | null,
        is_sold_out: pkg.is_sold_out,
        showcase_items:
            showcaseItems?.filter((item) => item.package_id === pkg.id).map((item) => ({
                id: item.id,
                package_id: item.package_id,
                type: item.type as "VIDEO" | "IMAGE",
                media_url: item.media_url,
                thumbnail_url: item.thumbnail_url,
                is_best_cut: item.is_best_cut,
            })) || [],
    }));

    return packagesWithShowcase;
}

/**
 * 패키지별 쇼케이스 미디어 조회
 *
 * @param packageId - 패키지 ID
 * @returns 쇼케이스 아이템 목록
 */
export async function getShowcaseItems(packageId: number): Promise<ShowcaseItem[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("showcase_items")
        .select("*")
        .eq("package_id", packageId)
        .order("is_best_cut", { ascending: false });

    if (error) {
        console.error("[Dealer] Failed to fetch showcase items:", error);
        return [];
    }

    return (
        data?.map((item) => ({
            id: item.id,
            package_id: item.package_id,
            type: item.type as "VIDEO" | "IMAGE",
            media_url: item.media_url,
            thumbnail_url: item.thumbnail_url,
            is_best_cut: item.is_best_cut,
        })) || []
    );
}

/**
 * 이벤트 정보 조회
 *
 * @param eventId - 이벤트 ID
 * @returns 이벤트 정보
 */
export type Event = {
    id: number;
    title: string;
    event_date: string;
    location: string | null;
    is_active: boolean;
    thumbnail_url: string | null;
    disciplines: string[];
    created_at: string;
};

export async function getEvent(eventId: number): Promise<Event | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

    if (error) {
        console.error("[Dealer] Failed to fetch event:", error);
        return null;
    }

    return data as Event;
}

/**
 * 활성화된 이벤트 목록 조회
 *
 * @returns 활성 이벤트 목록
 */
export async function getActiveEvents(): Promise<Event[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .order("event_date", { ascending: false });

    if (error) {
        console.error("[Dealer] Failed to fetch active events:", error);
        return [];
    }

    return (data as Event[]) || [];
}

import { createClient } from "@/lib/supabase/server";

/**
 * 📅 Event Queries for Admin
 * 관리자용 이벤트 데이터 조회
 */

export type AdminEvent = {
    id: number;
    title: string;
    event_date: string;
    location: string;
    is_active: boolean;
    thumbnail_url: string;
    created_at: string;
    package_count: number;
};

export async function getAdminEvents(): Promise<AdminEvent[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("events")
        .select(`
            *,
            packages:packages(count)
        `)
        .order("event_date", { ascending: false });

    if (error) {
        console.error("[Vulcan] getAdminEvents error:", error);
        return [];
    }

    return data.map((event: any) => ({
        ...event,
        package_count: event.packages?.[0]?.count || 0,
    }));
}

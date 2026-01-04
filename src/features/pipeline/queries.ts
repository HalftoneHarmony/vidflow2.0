
import { Database } from "@/lib/supabase/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

export type PipelineStage = "WAITING" | "EDITING" | "READY" | "DELIVERED";

export type PipelineCardWithDetails = Omit<Database["public"]["Tables"]["pipeline_cards"]["Row"], "stage"> & {
    stage: PipelineStage;
    order_node: Database["public"]["Tables"]["orders"]["Row"] & {
        user_node: { name: string; email: string };
        package_node: { name: string };
        event_node: { title: string; event_date: string };
    };
    worker_node: { name: string; email: string; commission_rate: number } | null;
    deliverables: Database["public"]["Tables"]["deliverables"]["Row"][];
};

/**
 * 모든 파이프라인 카드 목록 조회 (서버/클라이언트 모두 대응 가능하도록 supabase instance를 받음)
 */
export async function getAllPipelineCards(supabase: SupabaseClient<Database>): Promise<PipelineCardWithDetails[]> {
    const { data, error } = await supabase
        .from("pipeline_cards")
        .select(`
            *,
            order_node:orders!inner (
                *,
                user_node:profiles!inner (name, email),
                package_node:packages!inner (name),
                event_node:events!inner (title, event_date)
            ),
            worker_node:profiles (name, email, commission_rate),
            deliverables (*)
        `)
        .order("id", { ascending: false });

    if (error) {
        console.error("Error fetching pipeline cards:", error);
        throw error;
    }

    return data as any as PipelineCardWithDetails[];
}

/**
 * 특정 이벤트의 파이프라인 카드 목록 조회
 */
export async function getPipelineCardsByEvent(supabase: SupabaseClient<Database>, eventId: number): Promise<PipelineCardWithDetails[]> {
    const { data, error } = await supabase
        .from("pipeline_cards")
        .select(`
            *,
            order_node:orders!inner (
                *,
                user_node:profiles!inner (name, email),
                package_node:packages!inner (name),
                event_node:events!inner (title, event_date)
            ),
            worker_node:profiles (name, email, commission_rate),
            deliverables (*)
        `)
        .eq("order_node.event_id", eventId)
        .order("id", { ascending: false });

    if (error) {
        console.error("Error fetching event pipeline cards:", error);
        throw error;
    }

    return data as any as PipelineCardWithDetails[];
}

/**
 * 활성 사용자(선수) 목록 조회 (Ghost Card용)
 */
export async function getProfiles(supabase: SupabaseClient<Database>) {
    const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email")
        .eq("role", "PARTICIPANT")
        .order("name");

    if (error) throw error;
    return data;
}

/**
 * 작업자(에디터) 목록 조회 (Task 할당용)
 */
export async function getEditors(supabase: SupabaseClient<Database>) {
    const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email, commission_rate")
        .in("role", ["EDITOR", "ADMIN"])
        .order("name");

    if (error) throw error;
    return data;
}

/**
 * 활성 패키지 목록 조회 (Ghost Card용)
 */
export async function getPackages(supabase: SupabaseClient<Database>) {
    const { data, error } = await supabase
        .from("packages")
        .select("id, name, price")
        .order("name");

    if (error) throw error;
    return data;
}

/**
 * 활성 이벤트 목록 조회 (Ghost Card용)
 */
export async function getEvents(supabase: SupabaseClient<Database>) {
    const { data, error } = await supabase
        .from("events")
        .select("id, title")
        .order("event_date", { ascending: false });

    if (error) throw error;
    return data;
}

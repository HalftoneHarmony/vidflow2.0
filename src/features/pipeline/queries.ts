
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/database.types";

export type PipelineStage = Database["public"]["Tables"]["pipeline_cards"]["Row"]["stage"];

export type PipelineCardWithDetails = Database["public"]["Tables"]["pipeline_cards"]["Row"] & {
    order: Database["public"]["Tables"]["orders"]["Row"] & {
        user: { name: string; email: string };
        package: { name: string };
    };
    assignee: { name: string; email: string } | null;
    deliverables: Database["public"]["Tables"]["deliverables"]["Row"][];
};

/**
 * 특정 이벤트의 파이프라인 카드 전체 목록 조회
 */
export async function getPipelineCards(eventId: number): Promise<PipelineCardWithDetails[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("pipeline_cards")
        .select(`
            *,
            order:orders!inner (
                *,
                user:profiles!inner (name, email),
                package:packages!inner (name)
            ),
            assignee:profiles (name, email),
            deliverables (*)
        `)
        .eq("order.event_id", eventId)
        .order("usage", { foreignTable: "order", ascending: false }); // order by logic needs check, but sorting by ID or Date is safer usually

    if (error) {
        console.error("Error fetching pipeline cards:", error);
        throw error;
    }

    // Supabase의 조인 결과 타입을 맞추기 위해 캐스팅이 필요할 수 있습니다.
    // 여기서는 런타임 데이터 구조가 맞다고 가정하고 반환합니다.
    return data as any as PipelineCardWithDetails[];
}

/**
 * 특정 스테이지의 카드 목록 조회 (이벤트 무관)
 */
export async function getCardsByStage(stage: PipelineStage): Promise<PipelineCardWithDetails[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("pipeline_cards")
        .select(`
            *,
            order:orders!inner (
                *,
                user:profiles!inner (name, email),
                package:packages!inner (name)
            ),
            assignee:profiles (name, email),
            deliverables (*)
        `)
        .eq("stage", stage);

    if (error) {
        console.error(`Error fetching cards for stage ${stage}:`, error);
        throw error;
    }

    return data as any as PipelineCardWithDetails[];
}

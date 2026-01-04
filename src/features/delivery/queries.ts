/**
 * 🛡️ Delivery Queries
 * Agent 6: Sentinel (The Guardian)
 * 산출물(Deliverables) 조회 함수
 */

import { createClient } from "@/lib/supabase/server";

// ===== TYPES =====

export type DeliverableType = "MAIN_VIDEO" | "SHORTS" | "PHOTO_ZIP" | "HIGHLIGHT" | "RAW";

export type LinkStatus = "UNCHECKED" | "VALID" | "INVALID";

export type Deliverable = {
    id: number;
    card_id: number;
    type: DeliverableType;
    external_link_url: string | null;
    link_status: LinkStatus;
    link_last_checked_at: string | null;
    is_downloaded: boolean;
    first_downloaded_at: string | null;
    created_at: string;
};

export type DeliverableWithDetails = Deliverable & {
    card?: {
        id: number;
        stage: string;
        order?: {
            id: number;
            user_id: string;
            event?: {
                id: number;
                title: string;
            };
            package?: {
                id: number;
                name: string;
            };
        };
    };
};

// ===== QUERIES =====

/**
 * 📦 카드별 산출물 조회
 * Task 4: 특정 파이프라인 카드에 연결된 모든 산출물 반환
 */
export async function getDeliverablesByCard(cardId: number): Promise<Deliverable[]> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("deliverables")
            .select("*")
            .eq("card_id", cardId)
            .order("created_at", { ascending: true });

        if (error) {
            console.error(`[Sentinel] getDeliverablesByCard error:`, error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error(`[Sentinel] Unexpected error in getDeliverablesByCard:`, error);
        return [];
    }
}

/**
 * 👤 사용자별 산출물 조회 (마이페이지용)
 * Task 4: 특정 사용자의 모든 주문에 연결된 산출물 반환
 */
export async function getDeliverablesByUser(userId: string): Promise<DeliverableWithDetails[]> {
    try {
        const supabase = await createClient();

        // 복잡한 조인: deliverables -> pipeline_cards -> orders -> events/packages
        const { data, error } = await supabase
            .from("deliverables")
            .select(`
                *,
                card:pipeline_cards!inner (
                    id,
                    stage,
                    order:orders!inner (
                        id,
                        user_id,
                        event:events (
                            id,
                            title
                        ),
                        package:packages (
                            id,
                            name
                        )
                    )
                )
            `)
            .eq("card.order.user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error(`[Sentinel] getDeliverablesByUser error:`, error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error(`[Sentinel] Unexpected error in getDeliverablesByUser:`, error);
        return [];
    }
}

/**
 * 🔍 산출물 단일 조회
 * 다운로드 페이지에서 특정 산출물 정보 필요시 사용
 */
export async function getDeliverableById(deliverableId: number): Promise<DeliverableWithDetails | null> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("deliverables")
            .select(`
                *,
                card:pipeline_cards (
                    id,
                    stage,
                    order:orders (
                        id,
                        user_id,
                        event:events (
                            id,
                            title
                        ),
                        package:packages (
                            id,
                            name
                        )
                    )
                )
            `)
            .eq("id", deliverableId)
            .single();

        if (error) {
            console.error(`[Sentinel] getDeliverableById error:`, error);
            return null;
        }

        return data;
    } catch (error) {
        console.error(`[Sentinel] Unexpected error in getDeliverableById:`, error);
        return null;
    }
}

/**
 * ⚠️ 미전송 산출물 조회 (관리자용)
 * 링크가 없거나 INVALID인 산출물 조회
 */
export async function getPendingDeliverables(eventId?: number): Promise<DeliverableWithDetails[]> {
    try {
        const supabase = await createClient();

        let query = supabase
            .from("deliverables")
            .select(`
                *,
                card:pipeline_cards!inner (
                    id,
                    stage,
                    order:orders!inner (
                        id,
                        user_id,
                        event_id,
                        event:events (
                            id,
                            title
                        ),
                        package:packages (
                            id,
                            name
                        )
                    )
                )
            `)
            .or("external_link_url.is.null,link_status.eq.INVALID");

        // 특정 이벤트 필터링
        if (eventId) {
            query = query.eq("card.order.event_id", eventId);
        }

        const { data, error } = await query.order("created_at", { ascending: true });

        if (error) {
            console.error(`[Sentinel] getPendingDeliverables error:`, error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error(`[Sentinel] Unexpected error in getPendingDeliverables:`, error);
        return [];
    }
}

/**
 * 📋 전체 산출물 조회 (관리자 대시보드용)
 */
export async function getAllDeliverables(): Promise<DeliverableWithDetails[]> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("deliverables")
            .select(`
                *,
                card:pipeline_cards!inner (
                    id,
                    stage,
                    order:orders!inner (
                        id,
                        user_id,
                        event:events (
                            id,
                            title
                        ),
                        package:packages (
                            id,
                            name
                        ),
                        user:profiles!inner (
                            name,
                            email
                        )
                    )
                )
            `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error(`[Sentinel] getAllDeliverables error:`, error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error(`[Sentinel] Unexpected error in getAllDeliverables:`, error);
        return [];
    }
}

/**
 * 📊 산출물 통계 조회
 * 대시보드용 전송 현황 요약
 */
export async function getDeliveryStats(eventId?: number): Promise<{
    total: number;
    pending: number;
    valid: number;
    invalid: number;
    downloaded: number;
}> {
    try {
        const supabase = await createClient();

        let baseQuery = supabase.from("deliverables").select("id, link_status, is_downloaded, card:pipeline_cards!inner(order:orders!inner(event_id))");

        if (eventId) {
            baseQuery = baseQuery.eq("card.order.event_id", eventId);
        }

        const { data, error } = await baseQuery;

        if (error || !data) {
            console.error(`[Sentinel] getDeliveryStats error:`, error);
            return { total: 0, pending: 0, valid: 0, invalid: 0, downloaded: 0 };
        }

        return {
            total: data.length,
            pending: data.filter(d => d.link_status === "UNCHECKED" || !d.link_status).length,
            valid: data.filter(d => d.link_status === "VALID").length,
            invalid: data.filter(d => d.link_status === "INVALID").length,
            downloaded: data.filter(d => d.is_downloaded).length,
        };
    } catch (error) {
        console.error(`[Sentinel] Unexpected error in getDeliveryStats:`, error);
        return { total: 0, pending: 0, valid: 0, invalid: 0, downloaded: 0 };
    }
}

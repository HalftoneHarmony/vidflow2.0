"use server";

/**
 * 🛒 Order Server Actions
 * 주문 생성 및 관리 - Zod 검증 포함
 *
 * @author Dealer (The Salesman)
 */

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { PORTONE_CONFIG, PortOnePaymentResponse } from "@/lib/portone";

/**
 * 주문 생성 입력 스키마 (Zod)
 */
const CreateOrderSchema = z.object({
    userId: z.string().uuid("유효하지 않은 사용자 ID입니다."),
    eventId: z.number().int().positive("이벤트 ID는 양수여야 합니다."),
    packageId: z.number().int().positive("패키지 ID는 양수여야 합니다."),
    paymentId: z.string().min(1, "결제 ID는 필수입니다."),
    amount: z.number().int().positive("결제 금액은 양수여야 합니다."),
    discipline: z.string().optional(),
    athleteNumber: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

/**
 * 주문 생성 결과 타입
 */
export type CreateOrderResult = {
    success: boolean;
    orderId?: number;
    error?: string;
};

/**
 * 주문 생성 Server Action
 *
 * 트랜잭션으로 처리:
 * 1. Orders 테이블에 주문 생성
 * 2. Pipeline_cards 테이블에 작업 카드 생성
 * 3. Deliverables 테이블에 산출물 목록 생성 (패키지 composition 기반)
 *
 * @param input - 주문 생성 입력 데이터
 * @returns 생성 결과
 */
export async function createOrder(
    input: CreateOrderInput
): Promise<CreateOrderResult> {
    // 1. Zod 검증
    const validation = CreateOrderSchema.safeParse(input);

    if (!validation.success) {
        const firstError = validation.error.issues[0];
        console.error("[Dealer] Order validation failed:", firstError);
        return {
            success: false,
            error: firstError.message,
        };
    }

    const { userId, eventId, packageId, paymentId, amount, discipline, athleteNumber } = validation.data;

    try {
        const supabase = await createClient();

        // 2. 패키지 정보 조회 (composition 확인용)
        const { data: packageData, error: packageError } = await supabase
            .from("packages")
            .select("composition, is_sold_out")
            .eq("id", packageId)
            .single();

        if (packageError || !packageData) {
            console.error("[Dealer] Package not found:", packageError);
            return {
                success: false,
                error: "패키지를 찾을 수 없습니다.",
            };
        }

        if (packageData.is_sold_out) {
            return {
                success: false,
                error: "해당 패키지는 품절되었습니다.",
            };
        }

        // 3. 주문 생성 (Orders 테이블)
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                user_id: userId,
                event_id: eventId,
                package_id: packageId,
                payment_id: paymentId,
                amount: amount,
                status: "PAID",
                discipline: discipline || null,
                athlete_number: athleteNumber || null,
            })
            .select("id")
            .single();

        if (orderError || !order) {
            console.error("[Dealer] Order creation failed:", orderError);
            return {
                success: false,
                error: "주문 생성에 실패했습니다.",
            };
        }

        const orderId = order.id;

        // 4. 파이프라인 카드 생성 (Pipeline_cards 테이블)
        const { data: pipelineCard, error: pipelineError } = await supabase
            .from("pipeline_cards")
            .insert({
                order_id: orderId,
                stage: "WAITING",
                stage_entered_at: new Date().toISOString(),
            })
            .select("id")
            .single();

        if (pipelineError || !pipelineCard) {
            console.error("[Dealer] Pipeline card creation failed:", pipelineError);
            // 롤백: 주문 삭제
            await supabase.from("orders").delete().eq("id", orderId);
            return {
                success: false,
                error: "작업 카드 생성에 실패했습니다.",
            };
        }

        const cardId = pipelineCard.id;

        // 5. 산출물 목록 생성 (Deliverables 테이블)
        const composition = (packageData.composition as string[]) || [];

        if (composition.length > 0) {
            const deliverables = composition.map((type) => ({
                card_id: cardId,
                type: type,
                link_status: "UNCHECKED" as const,
            }));

            const { error: deliverablesError } = await supabase
                .from("deliverables")
                .insert(deliverables);

            if (deliverablesError) {
                console.error("[Dealer] Deliverables creation failed:", deliverablesError);
                // 롤백: 파이프라인 카드 및 주문 삭제
                await supabase.from("pipeline_cards").delete().eq("id", cardId);
                await supabase.from("orders").delete().eq("id", orderId);
                return {
                    success: false,
                    error: "산출물 목록 생성에 실패했습니다.",
                };
            }
        }

        console.log(
            `[Dealer] ✅ Order created successfully: Order #${orderId}, Card #${cardId}, ${composition.length} deliverables`
        );

        return {
            success: true,
            orderId: orderId,
        };
    } catch (error) {
        console.error("[Dealer] Unexpected error during order creation:", error);
        return {
            success: false,
            error: "주문 처리 중 오류가 발생했습니다.",
        };
    }
}

/**
 * PortOne 결제 검증 및 주문 생성 (Server Action)
 * 클라이언트 및 Webhook에서 공통으로 사용
 */
export async function verifyAndCreateOrder(
    paymentId: string,
    userId: string,
    eventId: number,
    packageId: number,
    expectedAmount: number,
    discipline?: string,
    athleteNumber?: string
): Promise<{ success: boolean; message: string; orderId?: number }> {
    try {
        console.log(`[Dealer] Verifying payment: ${paymentId}`);

        // 1. Secret 유무 확인
        if (!PORTONE_CONFIG.API_SECRET) {
            console.error("[Dealer] Missing PORTONE_API_SECRET");
            return { success: false, message: "서버 설정 오류: API Secret이 없습니다." };
        }

        // 2. PortOne API 호출 (결제 조회)
        // V2 API: Authorization 헤더에 'PortOne <Secret>' 사용
        const verifyRes = await fetch(`${PORTONE_CONFIG.API_BASE_URL}/payments/${paymentId}`, {
            headers: {
                "Authorization": `PortOne ${PORTONE_CONFIG.API_SECRET}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!verifyRes.ok) {
            const errorBody = await verifyRes.json().catch(() => ({}));
            console.error("[Dealer] PortOne Verify API Error:", verifyRes.status, errorBody);
            return { success: false, message: "결제 검증 API 호출 실패" };
        }

        const paymentData: PortOnePaymentResponse = await verifyRes.json();

        // 3. 데이터 검증
        if (paymentData.status !== "PAID") {
            console.warn(`[Dealer] Invalid Payment Status: ${paymentData.status}`);
            return { success: false, message: `결제 상태가 유효하지 않습니다. (${paymentData.status})` };
        }

        // 금액 검증 (부동소수점 주의하지 않아도 되는 정수 - KRW)
        if (paymentData.amount.paid !== expectedAmount) {
            console.warn(`[Dealer] Amount Mismatch: Expected ${expectedAmount}, Got ${paymentData.amount.paid}`);
            return { success: false, message: "결제 금액이 일치하지 않습니다." };
        }

        // 4. 주문 생성 (트랜잭션)
        const result = await createOrder({
            userId,
            eventId,
            packageId,
            paymentId,
            amount: paymentData.amount.paid,
            discipline,
            athleteNumber
        });

        if (!result.success) {
            if (result.error?.toLowerCase().includes("duplicate") || result.error?.toLowerCase().includes("unique")) {
                console.log("[Dealer] Payment verified but order already exists (Idempotency).");
                return { success: true, message: "이미 처리된 주문입니다. (중복)" };
            }

            return { success: false, message: result.error || "주문 생성 실패" };
        }

        return { success: true, message: "주문이 완료되었습니다.", orderId: result.orderId };

    } catch (e) {
        console.error("[Dealer] Verification Exception:", e);
        return { success: false, message: "결제 처리 중 서버 에러가 발생했습니다." };
    }
}

/**
 * 주문 상태 조회
 */
export type OrderStatus = {
    orderId: number;
    status: "PENDING" | "PAID" | "REFUNDED";
    stage: "WAITING" | "SHOOTING" | "EDITING" | "READY" | "DELIVERED";
    createdAt: string;
};

export async function getOrderStatus(orderId: number): Promise<OrderStatus | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("orders")
        .select(
            `
      id,
      status,
      created_at,
      pipeline_cards!inner(stage)
    `
        )
        .eq("id", orderId)
        .single();

    if (error || !data) {
        console.error("[Dealer] Failed to fetch order status:", error);
        return null;
    }

    // pipeline_cards는 배열로 반환될 수 있음
    const pipelineCard = Array.isArray(data.pipeline_cards)
        ? data.pipeline_cards[0]
        : data.pipeline_cards;

    return {
        orderId: data.id,
        status: data.status as OrderStatus["status"],
        stage: pipelineCard?.stage as OrderStatus["stage"],
        createdAt: data.created_at,
    };
}

/**
 * 사용자의 주문 목록 조회
 */
export async function getUserOrders(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("orders")
        .select(
            `
      id,
      amount,
      status,
      created_at,
      events(title, event_date),
      packages(name),
      pipeline_cards(stage)
    `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[Dealer] Failed to fetch user orders:", error);
        return [];
    }

    return data || [];
}

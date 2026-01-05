import { NextResponse } from "next/server";
import { verifyAndCreateOrder } from "@/features/orders/actions";
import { PORTONE_CONFIG } from "@/lib/portone";

/**
 * ⚡ PortOne Webhook Handler
 * 결제 완료 시 자동으로 Pipeline Card 생성
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("[Webhook] Received:", JSON.stringify(body));

        // PortOne V2 Payload: { type: "PAYMENT_STATUS_CHANGED", data: { paymentId: "..." } }
        const paymentId = body.data?.paymentId || body.paymentId;

        if (!paymentId) {
            console.warn("[Webhook] No paymentId found in payload");
            return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
        }

        // 1. 주문 메타데이터(userId, packageId)를 알기 위해 결제 조회 및 검증
        if (!PORTONE_CONFIG.API_SECRET) {
            console.error("[Webhook] Missing PORTONE_API_SECRET");
            return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
        }

        // PortOne Payment 조회
        const verifyRes = await fetch(`${PORTONE_CONFIG.API_BASE_URL}/payments/${paymentId}`, {
            headers: {
                "Authorization": `PortOne ${PORTONE_CONFIG.API_SECRET}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!verifyRes.ok) {
            console.error("[Webhook] Payment lookup failed:", verifyRes.status);
            return NextResponse.json({ error: "Payment lookup failed" }, { status: 500 });
        }

        const paymentData = await verifyRes.json();

        // 2. Custom Data 파싱 (주문 정보)
        let customData = {};

        try {
            if (typeof paymentData.customData === "string") {
                customData = JSON.parse(paymentData.customData);
            } else if (typeof paymentData.customData === "object") {
                customData = paymentData.customData;
            }
        } catch (e) {
            console.error("[Webhook] Failed to parse customData:", e);
        }

        const { userId, eventId, packageId, discipline, athleteNumber } = customData as any;

        if (!userId || !eventId || !packageId) {
            console.error("[Webhook] Missing required metadata in customData:", customData);
            return NextResponse.json({ error: "Missing order metadata in payment" }, { status: 400 });
        }

        // 3. 주문 생성 및 검증 Action 호출
        const result = await verifyAndCreateOrder(
            paymentId,
            userId,
            Number(eventId),
            Number(packageId),
            paymentData.amount.paid,
            discipline || undefined,
            athleteNumber || undefined
        );

        if (!result.success) {
            // 중복 주문 처리
            if (result.message.includes("이미 처리된") || result.message.includes("중복")) {
                console.log("[Webhook] Order already exists.");
                return NextResponse.json({ success: true, message: "Already processed" });
            }
            console.error("[Webhook] verifyAndCreateOrder failed:", result.message);
            return NextResponse.json({ error: result.message }, { status: 500 });
        }

        console.log("[Webhook] Order Processing Completed Successfully.");
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PortOne Webhook error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

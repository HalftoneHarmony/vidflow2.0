import { NextResponse } from "next/server";

/**
 * ⚡ PortOne Webhook Handler
 * 결제 완료 시 자동으로 Pipeline Card 생성
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // TODO: PortOne 결제 검증
        // TODO: 트랜잭션으로 Orders + Pipeline Cards + Deliverables 생성

        console.log("PortOne Webhook received:", body);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PortOne Webhook error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

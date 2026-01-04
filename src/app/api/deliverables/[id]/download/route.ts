import { NextRequest, NextResponse } from "next/server";
import { recordDownload } from "@/features/delivery/actions";
import { getDeliverableById } from "@/features/delivery/queries";

/**
 * 🔒 Deliverable Redirect API
 * Agent 6: Sentinel (The Guardian)
 * 외부 링크 직접 노출을 방지하고 다운로드 기록 후 리다이렉트 처리
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const deliverableId = parseInt(id);

    if (isNaN(deliverableId)) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    try {
        // 1. 산출물 및 링크 조회
        const deliverable = await getDeliverableById(deliverableId);

        if (!deliverable || !deliverable.external_link_url) {
            return NextResponse.json({ error: "Deliverable not found or link missing" }, { status: 404 });
        }

        // 2. 다운로드 기록 (The Sentinel Audit)
        // recordDownload는 비동기로 실행되지만, 결과에 상관없이 리다이렉트는 수행함
        // 하지만 기록의 정확도를 위해 await 처리
        await recordDownload(deliverableId);

        // 3. 외부 링크로 보안 리다이렉트
        return NextResponse.redirect(deliverable.external_link_url);

    } catch (error) {
        console.error(`[Sentinel] Redirect API error:`, error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

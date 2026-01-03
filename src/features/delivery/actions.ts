"use server";

/**
 * 📦 Delivery Server Actions
 * 외부 링크 전송 및 검증
 */

export async function submitExternalLink(deliverableId: number, linkUrl: string) {
    // TODO: HEAD 요청으로 링크 유효성 검증
    // TODO: link_status 업데이트
    console.log(`Deliverable ${deliverableId}: ${linkUrl}`);
}

export async function verifyLink(deliverableId: number) {
    // TODO: 링크 건전성 재검증
    console.log(`Verifying link for deliverable ${deliverableId}`);
}

export async function recordDownload(deliverableId: number) {
    // TODO: first_downloaded_at 기록 (수령 증빙)
    console.log(`Download recorded for deliverable ${deliverableId}`);
}

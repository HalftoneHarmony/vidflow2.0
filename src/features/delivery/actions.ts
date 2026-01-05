"use server";

/**
 * 🛡️ Delivery Server Actions
 * Agent 6: Sentinel (The Guardian)
 * 외부 링크 전송 및 검증 - 링크 부패 차단 & 수령 증명
 */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendEmail, buildVideoReadyEmail } from "@/lib/email/resend";

// ===== TYPES =====

export type LinkStatus = "UNCHECKED" | "VALID" | "INVALID";

export type LinkValidationResult = {
    isValid: boolean;
    status: LinkStatus;
    httpCode?: number;
    errorMessage?: string;
};

export type SubmitLinkResult = {
    success: boolean;
    message: string;
    linkStatus?: LinkStatus;
};

export type RecordDownloadResult = {
    success: boolean;
    message: string;
    firstDownloadedAt?: string;
    isFirstDownload: boolean;
};

// ===== LINK VALIDATION =====

/**
 * 🔍 HEAD 요청으로 외부 링크 유효성 검증
 * - 200 OK: VALID
 * - 403/404: INVALID (저장 거부)
 * - 기타 오류: UNCHECKED
 */
async function validateExternalLink(linkUrl: string): Promise<LinkValidationResult> {
    try {
        // URL 형식 검증
        const url = new URL(linkUrl);

        // 허용된 도메인만 체크 (Google Drive, Dropbox, OneDrive 등)
        const allowedDomains = [
            "drive.google.com",
            "docs.google.com",
            "dropbox.com",
            "www.dropbox.com",
            "onedrive.live.com",
            "1drv.ms",
        ];

        const isAllowedDomain = allowedDomains.some(domain =>
            url.hostname === domain || url.hostname.endsWith(`.${domain}`)
        );

        if (!isAllowedDomain) {
            // 허용되지 않은 도메인도 일단 검증은 시도
            console.warn(`[Sentinel] Unknown domain: ${url.hostname}`);
        }

        // HEAD 요청으로 링크 유효성 검증
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

        const response = await fetch(linkUrl, {
            method: "HEAD",
            signal: controller.signal,
            headers: {
                "User-Agent": "VidFlow-Link-Validator/1.0",
            },
        });

        clearTimeout(timeoutId);

        // HTTP 상태 코드 분석
        if (response.ok) {
            // 200-299: 유효한 링크
            return {
                isValid: true,
                status: "VALID",
                httpCode: response.status,
            };
        }

        // 403: 권한 없음 (공유 설정 안 됨)
        // 404: 파일 없음 (삭제됨)
        if (response.status === 403 || response.status === 404) {
            return {
                isValid: false,
                status: "INVALID",
                httpCode: response.status,
                errorMessage: response.status === 403
                    ? "접근 권한이 없습니다. 공유 설정을 확인하세요."
                    : "파일을 찾을 수 없습니다. 링크가 삭제되었거나 잘못되었습니다.",
            };
        }

        // 기타 상태 코드: 일단 VALID로 처리 (일부 서비스는 HEAD 미지원)
        return {
            isValid: true,
            status: "VALID",
            httpCode: response.status,
        };

    } catch (error) {
        // 네트워크 오류 또는 타임아웃
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";

        // AbortError는 타임아웃
        if (errorMessage.includes("abort")) {
            return {
                isValid: false,
                status: "INVALID",
                errorMessage: "요청 시간이 초과되었습니다. 링크를 확인하세요.",
            };
        }

        return {
            isValid: false,
            status: "UNCHECKED",
            errorMessage: `링크 검증 실패: ${errorMessage}`,
        };
    }
}

// ===== SERVER ACTIONS =====

/**
 * 📤 외부 링크 제출 및 검증
 * Task 1: HEAD 요청으로 링크 유효성 검증
 * - 200 OK: link_status = 'VALID'
 * - 403/404: link_status = 'INVALID', 저장 거부
 * - link_last_checked_at 업데이트
 * - 🎉 성공시 고객에게 이메일 알림 발송
 */
export async function submitExternalLink(
    deliverableId: number,
    linkUrl: string
): Promise<SubmitLinkResult> {
    try {
        const supabase = await createClient();

        // Step 1: 링크 유효성 검증 (The Link Rot Firewall)
        const validation = await validateExternalLink(linkUrl);

        // Step 2: INVALID 링크는 저장 거부
        if (validation.status === "INVALID") {
            console.error(`[Sentinel] ❌ Link rejected for deliverable ${deliverableId}: ${validation.errorMessage}`);

            return {
                success: false,
                message: validation.errorMessage || "유효하지 않은 링크입니다.",
                linkStatus: "INVALID",
            };
        }

        // Step 3: VALID 링크는 DB에 저장
        const { error } = await supabase
            .from("deliverables")
            .update({
                external_link_url: linkUrl,
                link_status: validation.status,
                link_last_checked_at: new Date().toISOString(),
            })
            .eq("id", deliverableId);

        if (error) {
            console.error(`[Sentinel] DB update error for deliverable ${deliverableId}:`, error);
            return {
                success: false,
                message: "링크 저장에 실패했습니다.",
            };
        }

        console.log(`[Sentinel] ✅ Link saved for deliverable ${deliverableId}: ${validation.status}`);

        // Step 4: 고객에게 이메일 알림 발송 🎉
        try {
            // deliverable -> card -> order -> user 정보 가져오기
            const { data: deliverableData } = await supabase
                .from("deliverables")
                .select(`
                    type,
                    card:pipeline_cards!inner (
                        order:orders!inner (
                            id,
                            package:packages ( name ),
                            user:profiles!inner ( name, email )
                        )
                    )
                `)
                .eq("id", deliverableId)
                .single();

            // Supabase join 결과 처리 (배열일 수 있음)
            const card = Array.isArray(deliverableData?.card)
                ? deliverableData.card[0]
                : deliverableData?.card;
            const order = Array.isArray(card?.order)
                ? card.order[0]
                : card?.order;
            const user = Array.isArray(order?.user)
                ? order.user[0]
                : order?.user;
            const pkg = Array.isArray(order?.package)
                ? order.package[0]
                : order?.package;

            if (user?.email) {
                const customerEmail = user.email;
                const customerName = user.name || "고객";
                const packageName = pkg?.name || "영상 패키지";
                const deliverableType = deliverableData?.type || "MAIN_VIDEO";
                const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
                const downloadPageUrl = `${siteUrl}/my-page`;

                const emailContent = buildVideoReadyEmail({
                    customerName,
                    packageName,
                    deliverableType,
                    downloadPageUrl,
                });

                const emailResult = await sendEmail({
                    to: customerEmail,
                    ...emailContent,
                });

                if (emailResult.success) {
                    console.log(`[Sentinel] 📧 Email sent to ${customerEmail}`);
                } else {
                    console.warn(`[Sentinel] ⚠️ Email failed: ${emailResult.error}`);
                }
            }
        } catch (emailError) {
            // 이메일 발송 실패해도 링크 저장은 성공으로 처리
            console.error(`[Sentinel] Email notification error:`, emailError);
        }

        revalidatePath("/admin/pipeline"); // UI 갱신 (트리거)
        revalidatePath("/my-page"); // 고객 페이지도 갱신

        return {
            success: true,
            message: "링크가 성공적으로 저장되었습니다.",
            linkStatus: validation.status,
        };

    } catch (error) {
        console.error(`[Sentinel] Unexpected error in submitExternalLink:`, error);
        return {
            success: false,
            message: "예상치 못한 오류가 발생했습니다.",
        };
    }
}

/**
 * 🔄 링크 건전성 재검증
 * 주기적으로 또는 수동으로 기존 링크의 유효성을 재검사
 */
export async function verifyLink(deliverableId: number): Promise<LinkValidationResult> {
    try {
        const supabase = await createClient();

        // 기존 링크 조회
        const { data: deliverable, error: fetchError } = await supabase
            .from("deliverables")
            .select("external_link_url")
            .eq("id", deliverableId)
            .single();

        if (fetchError || !deliverable?.external_link_url) {
            return {
                isValid: false,
                status: "UNCHECKED",
                errorMessage: "산출물 또는 링크를 찾을 수 없습니다.",
            };
        }

        // 링크 재검증
        const validation = await validateExternalLink(deliverable.external_link_url);

        // DB 상태 업데이트
        await supabase
            .from("deliverables")
            .update({
                link_status: validation.status,
                link_last_checked_at: new Date().toISOString(),
            })
            .eq("id", deliverableId);

        console.log(`[Sentinel] 🔄 Link re-verified for deliverable ${deliverableId}: ${validation.status}`);

        return validation;

    } catch (error) {
        console.error(`[Sentinel] Verify link error:`, error);
        return {
            isValid: false,
            status: "UNCHECKED",
            errorMessage: "링크 검증 중 오류가 발생했습니다.",
        };
    }
}

/**
 * 📥 다운로드 기록
 * Task 2: 고객 다운로드 클릭 시
 * - is_downloaded = true
 * - first_downloaded_at 기록 (최초 1회만)
 */
export async function recordDownload(deliverableId: number): Promise<RecordDownloadResult> {
    try {
        const supabase = await createClient();

        // 현재 상태 확인
        const { data: deliverable, error: fetchError } = await supabase
            .from("deliverables")
            .select("is_downloaded, first_downloaded_at, external_link_url")
            .eq("id", deliverableId)
            .single();

        if (fetchError || !deliverable) {
            console.error(`[Sentinel] Deliverable not found: ${deliverableId}`);
            return {
                success: false,
                message: "산출물을 찾을 수 없습니다.",
                isFirstDownload: false,
            };
        }

        // 링크가 없으면 다운로드 기록 거부
        if (!deliverable.external_link_url) {
            return {
                success: false,
                message: "다운로드할 링크가 없습니다.",
                isFirstDownload: false,
            };
        }

        const now = new Date().toISOString();
        const isFirstDownload = !deliverable.first_downloaded_at;

        // 최초 다운로드시에만 first_downloaded_at 기록
        const updateData: { is_downloaded: boolean; first_downloaded_at?: string } = {
            is_downloaded: true,
        };

        if (isFirstDownload) {
            updateData.first_downloaded_at = now;
        }

        const { error: updateError } = await supabase
            .from("deliverables")
            .update(updateData)
            .eq("id", deliverableId);

        if (updateError) {
            console.error(`[Sentinel] Download record error:`, updateError);
            return {
                success: false,
                message: "다운로드 기록에 실패했습니다.",
                isFirstDownload: false,
            };
        }

        console.log(
            `[Sentinel] 📥 Download recorded for deliverable ${deliverableId}`,
            isFirstDownload ? "(FIRST DOWNLOAD)" : "(RE-DOWNLOAD)"
        );

        return {
            success: true,
            message: isFirstDownload ? "다운로드가 기록되었습니다." : "재다운로드가 기록되었습니다.",
            firstDownloadedAt: isFirstDownload ? now : deliverable.first_downloaded_at,
            isFirstDownload,
        };

    } catch (error) {
        console.error(`[Sentinel] Unexpected error in recordDownload:`, error);
        return {
            success: false,
            message: "예상치 못한 오류가 발생했습니다.",
            isFirstDownload: false,
        };
    }
}

/**
 * 🔒 Stage Gate 검증 - DELIVERED 전환 전 모든 링크 확인
 * Gear 에이전트와 협업: 파이프라인의 문지기 역할
 */
export async function validateDeliveryReady(cardId: number): Promise<{
    isReady: boolean;
    missingLinks: number[];
    invalidLinks: number[];
}> {
    try {
        const supabase = await createClient();

        // 해당 카드의 모든 산출물 조회
        const { data: deliverables, error } = await supabase
            .from("deliverables")
            .select("id, external_link_url, link_status, type")
            .eq("card_id", cardId);

        if (error || !deliverables) {
            return {
                isReady: false,
                missingLinks: [],
                invalidLinks: [],
            };
        }

        const missingLinks: number[] = [];
        const invalidLinks: number[] = [];

        for (const d of deliverables) {
            if (!d.external_link_url) {
                missingLinks.push(d.id);
            } else if (d.link_status === "INVALID") {
                invalidLinks.push(d.id);
            }
        }

        const isReady = missingLinks.length === 0 && invalidLinks.length === 0;

        if (!isReady) {
            console.warn(
                `[Sentinel] ⚠️ Card ${cardId} not ready for delivery:`,
                `Missing: ${missingLinks.length}, Invalid: ${invalidLinks.length}`
            );
        }

        return {
            isReady,
            missingLinks,
            invalidLinks,
        };

    } catch (error) {
        console.error(`[Sentinel] Validate delivery ready error:`, error);
        return {
            isReady: false,
            missingLinks: [],
            invalidLinks: [],
        };
    }
}

/**
 * 📧 Email Service - Resend
 * 외부 이메일 발송 서비스
 * 
 * @author Antigravity
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_API_URL = "https://api.resend.com/emails";

// 발신자 이메일 (Resend에서 인증된 도메인 필요, 없으면 기본값 사용)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "VidFlow <onboarding@resend.dev>";

export type SendEmailParams = {
    to: string;
    subject: string;
    html: string;
};

export type SendEmailResult = {
    success: boolean;
    messageId?: string;
    error?: string;
};

/**
 * 📤 이메일 발송
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    if (!RESEND_API_KEY) {
        console.error("[Email] RESEND_API_KEY not configured");
        return {
            success: false,
            error: "이메일 발송 설정이 되어있지 않습니다.",
        };
    }

    try {
        const response = await fetch(RESEND_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: [params.to],
                subject: params.subject,
                html: params.html,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("[Email] Resend API error:", data);
            return {
                success: false,
                error: data.message || "이메일 발송에 실패했습니다.",
            };
        }

        console.log(`[Email] ✅ Email sent to ${params.to}, ID: ${data.id}`);
        return {
            success: true,
            messageId: data.id,
        };
    } catch (error) {
        console.error("[Email] Unexpected error:", error);
        return {
            success: false,
            error: "이메일 발송 중 오류가 발생했습니다.",
        };
    }
}

/**
 * 🎬 영상 완성 알림 이메일 템플릿
 */
export function buildVideoReadyEmail(params: {
    customerName: string;
    packageName: string;
    deliverableType: string;
    downloadPageUrl: string;
}): { subject: string; html: string } {
    const subject = `🎬 [VidFlow] ${params.customerName}님, 영상이 완성되었습니다!`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>영상 완성 알림</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #dc2626; font-size: 32px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 2px;">
                VidFlow
            </h1>
            <p style="color: #71717a; font-size: 12px; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px;">
                Production Engine
            </p>
        </div>

        <!-- Main Content -->
        <div style="background: linear-gradient(145deg, #18181b, #1f1f23); border: 1px solid #27272a; border-radius: 16px; padding: 40px; text-align: center;">
            <div style="font-size: 64px; margin-bottom: 24px;">🎬</div>
            
            <h2 style="color: #ffffff; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">
                영상이 완성되었습니다!
            </h2>
            
            <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                안녕하세요, <strong style="color: #ffffff;">${params.customerName}</strong>님!<br>
                주문하신 영상 작업이 완료되어 안내드립니다.
            </p>

            <!-- Order Details -->
            <div style="background: #0a0a0a; border: 1px solid #27272a; border-radius: 12px; padding: 24px; margin-bottom: 32px; text-align: left;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                    <span style="color: #71717a; font-size: 14px;">패키지</span>
                    <span style="color: #ffffff; font-size: 14px; font-weight: 500;">${params.packageName}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #71717a; font-size: 14px;">산출물</span>
                    <span style="color: #dc2626; font-size: 14px; font-weight: 500;">${params.deliverableType}</span>
                </div>
            </div>

            <!-- CTA Button -->
            <a href="${params.downloadPageUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #dc2626, #b91c1c); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 20px rgba(220, 38, 38, 0.3);">
                지금 확인하기
            </a>

            <p style="color: #52525b; font-size: 12px; margin-top: 24px;">
                마이페이지에서 영상을 다운로드하실 수 있습니다.
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px;">
            <p style="color: #3f3f46; font-size: 12px; margin: 0;">
                본 메일은 VidFlow 서비스에서 자동 발송되었습니다.
            </p>
            <p style="color: #3f3f46; font-size: 12px; margin: 8px 0 0 0;">
                © 2026 VidFlow. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    `.trim();

    return { subject, html };
}

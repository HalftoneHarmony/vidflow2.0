/**
 * 🔌 PortOne Utility Config
 * PortOne V2 관련 설정 및 타입
 */

export const PORTONE_CONFIG = {
    STORE_ID: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
    CHANNEL_KEY: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
    API_SECRET: process.env.PORTONE_API_SECRET!,
    API_BASE_URL: "https://api.portone.io",
};

/**
 * PortOne 결제 요청 파라미터 타입 (V2)
 */
export type PaymentRequest = {
    storeId: string;
    channelKey: string;
    paymentId: string;
    orderName: string;
    totalAmount: number;
    currency: "KRW";
    payMethod: "CARD"; // 간단하게 카드 결제만 예시
    customer: {
        fullName?: string;
        phoneNumber?: string;
        email?: string;
        id?: string;
    };
    redirectUrl?: string;
};

/**
 * PortOne 결제 조회 응답 타입 (일부)
 */
export type PortOnePaymentResponse = {
    status: "PAID" | "PENDING" | "FAILED" | "CANCELLED" | "PARTIAL_CANCELLED";
    id: string; // paymentId
    transactionId: string;
    amount: {
        total: number;
        paid: number;
    };
    method?: {
        card?: {
            approveNo: string;
            cardName: string;
        }
    }
    // 필요한 필드 추가 가능
};

/**
 * PortOne API 에러 타입
 */
export type PortOneError = {
    code: string;
    message: string;
};

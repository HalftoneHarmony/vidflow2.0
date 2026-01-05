/**
 * 🤖 AI Adapter
 * LLM 모델 교체 가능한 어댑터 패턴
 * 현재 지원: Google Gemini, Mock
 * 
 * @author Agent 9 - AI Integration
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// ============================================
// Types
// ============================================

export interface AIMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface AIAdapter {
    chat(messages: AIMessage[]): Promise<string>;
}

// ============================================
// Gemini Adapter
// ============================================

export class GeminiAdapter implements AIAdapter {
    private client: GoogleGenerativeAI;
    private model: string;

    constructor(apiKey: string, model: string = "gemini-1.5-flash") {
        this.client = new GoogleGenerativeAI(apiKey);
        this.model = model;
    }

    async chat(messages: AIMessage[]): Promise<string> {
        try {
            const model = this.client.getGenerativeModel({ model: this.model });

            // Gemini는 system message를 첫 user message로 통합해야 함
            const systemMessage = messages.find(m => m.role === "system");
            const conversationMessages = messages.filter(m => m.role !== "system");

            // 대화 형식으로 변환
            const prompt = conversationMessages
                .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
                .join("\n\n");

            const fullPrompt = systemMessage
                ? `[System Instructions]\n${systemMessage.content}\n\n${prompt}`
                : prompt;

            const result = await model.generateContent(fullPrompt);
            const response = await result.response;

            return response.text();
        } catch (error) {
            console.error("[AI Adapter] Gemini API Error:", error);
            throw new Error("AI 응답 생성에 실패했습니다.");
        }
    }
}

// ============================================
// Mock Adapter (개발/테스트용)
// ============================================

export class MockAIAdapter implements AIAdapter {
    async chat(messages: AIMessage[]): Promise<string> {
        // 마지막 사용자 메시지 기반으로 간단한 응답 생성
        const lastUserMessage = messages.filter(m => m.role === "user").pop();

        if (!lastUserMessage) {
            return "안녕하세요! 무엇을 도와드릴까요?";
        }

        const content = lastUserMessage.content.toLowerCase();

        // 간단한 키워드 기반 응답
        if (content.includes("안녕") || content.includes("hello")) {
            return "안녕하세요! VidFlow AI 어시스턴트입니다. 무엇을 도와드릴까요?";
        }
        if (content.includes("도움") || content.includes("help")) {
            return "이벤트 관리, 주문 조회, 파이프라인 상태 등에 대해 물어보실 수 있습니다.";
        }

        return "[Mock AI] 현재 AI 서비스가 개발 모드로 실행 중입니다. 실제 서비스에서는 GOOGLE_AI_API_KEY를 설정해주세요.";
    }
}

// ============================================
// Factory Function
// ============================================

/**
 * 환경변수에 따라 적절한 AI Adapter를 반환합니다.
 * 
 * @returns AIAdapter 인스턴스
 */
export function getAIAdapter(): AIAdapter {
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (apiKey) {
        console.log("[AI Adapter] Gemini 모드로 시작");
        return new GeminiAdapter(apiKey);
    }

    console.warn("[AI Adapter] GOOGLE_AI_API_KEY가 설정되지 않음 - Mock 모드로 실행");
    return new MockAIAdapter();
}

/**
 * 특정 모델을 지정하여 AI Adapter를 생성합니다.
 */
export function createAIAdapter(
    provider: "gemini" | "mock",
    options?: { apiKey?: string; model?: string }
): AIAdapter {
    switch (provider) {
        case "gemini":
            const key = options?.apiKey || process.env.GOOGLE_AI_API_KEY;
            if (!key) {
                throw new Error("Gemini API Key가 필요합니다.");
            }
            return new GeminiAdapter(key, options?.model);

        case "mock":
        default:
            return new MockAIAdapter();
    }
}

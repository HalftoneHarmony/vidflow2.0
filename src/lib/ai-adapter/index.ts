/**
 * 🤖 AI Adapter
 * LLM 모델 교체 가능한 어댑터 패턴
 * OpenAI / Gemini 등 교체 가능
 */

export interface AIMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface AIAdapter {
    chat(messages: AIMessage[]): Promise<string>;
}

// TODO: 실제 AI 클라이언트 구현
export class MockAIAdapter implements AIAdapter {
    async chat(messages: AIMessage[]): Promise<string> {
        console.log("AI Chat:", messages);
        return "This is a mock AI response.";
    }
}

export function getAIAdapter(): AIAdapter {
    // TODO: 환경변수에 따라 OpenAI / Gemini 선택
    return new MockAIAdapter();
}

/**
 * 🏗️ Pipeline Configuration
 * 파이프라인 단계 관련 설정
 * 
 * DB(pipeline_stages 테이블)에서 동적 로드
 */

import { createClient } from "@/lib/supabase/server";

// ============================================
// Types
// ============================================

export type PipelineStageConfig = {
    id: number;
    code: string;
    title: string;
    color: string;
    sort_order: number;
    is_active: boolean;
    is_terminal: boolean;
};

// 기본 단계 (DB 조회 실패 시 폴백)
export const DEFAULT_STAGES: PipelineStageConfig[] = [
    { id: 1, code: "WAITING", title: "Waiting", color: "zinc", sort_order: 1, is_active: true, is_terminal: false },
    { id: 2, code: "EDITING", title: "Editing", color: "blue", sort_order: 2, is_active: true, is_terminal: false },
    { id: 3, code: "READY", title: "Ready", color: "purple", sort_order: 3, is_active: true, is_terminal: false },
    { id: 4, code: "DELIVERED", title: "Delivered", color: "green", sort_order: 4, is_active: true, is_terminal: true },
];

// ============================================
// Cache
// ============================================

let cachedStages: PipelineStageConfig[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5분

// ============================================
// Functions
// ============================================

/**
 * DB에서 활성화된 파이프라인 단계 목록을 조회합니다.
 * 캐시를 사용하여 DB 호출을 최소화합니다.
 */
export async function getPipelineStages(): Promise<PipelineStageConfig[]> {
    const now = Date.now();

    // 캐시가 유효한 경우
    if (cachedStages && (now - cacheTimestamp) < CACHE_TTL_MS) {
        return cachedStages;
    }

    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("pipeline_stages")
            .select("*")
            .eq("is_active", true)
            .order("sort_order", { ascending: true });

        if (error) {
            console.error("[Pipeline Config] DB 조회 실패, 기본값 사용:", error);
            cachedStages = DEFAULT_STAGES;
        } else {
            cachedStages = (data as PipelineStageConfig[]).map(stage => ({
                ...stage,
                color: (stage.code === 'READY' && (stage.color === 'emerald' || stage.color === 'zinc')) ? 'purple' : stage.color
            }));
        }

        cacheTimestamp = now;
        return cachedStages;
    } catch (error) {
        console.error("[Pipeline Config] 예외 발생, 기본값 사용:", error);
        return DEFAULT_STAGES;
    }
}

/**
 * 단계 코드로 단계 정보를 조회합니다.
 */
export async function getStageByCode(code: string): Promise<PipelineStageConfig | undefined> {
    const stages = await getPipelineStages();
    return stages.find(s => s.code === code);
}

/**
 * 최종 단계(DELIVERED 등)를 조회합니다.
 */
export async function getTerminalStage(): Promise<PipelineStageConfig | undefined> {
    const stages = await getPipelineStages();
    return stages.find(s => s.is_terminal);
}

/**
 * 캐시를 강제로 초기화합니다. (설정 변경 후 사용)
 */
export function invalidateStagesCache(): void {
    cachedStages = null;
    cacheTimestamp = 0;
}

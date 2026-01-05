/**
 * 💰 Finance Configuration
 * 재무 관련 공통 설정값
 * 
 * 추후 DB(general_settings)에서 로드하도록 확장 가능
 */

/**
 * 지출 카테고리 옵션
 */
export const EXPENSE_CATEGORY_OPTIONS = [
    "ALL",      // 필터용 - 실제 저장시에는 사용하지 않음
    "LABOR",    // 인건비
    "FOOD",     // 식비
    "TRAVEL",   // 이동비
    "EQUIPMENT",// 장비비
    "ETC"       // 기타
] as const;

export type ExpenseCategory = Exclude<typeof EXPENSE_CATEGORY_OPTIONS[number], "ALL">;

/**
 * 카테고리별 색상 설정
 */
export const EXPENSE_CATEGORY_COLORS: Record<string, string> = {
    LABOR: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    FOOD: "bg-green-500/20 text-green-400 border-green-500/50",
    TRAVEL: "bg-amber-500/20 text-amber-400 border-amber-500/50",
    EQUIPMENT: "bg-purple-500/20 text-purple-400 border-purple-500/50",
    ETC: "bg-zinc-500/20 text-zinc-400 border-zinc-500/50",
};

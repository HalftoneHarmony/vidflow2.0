/**
 * 📦 Products Configuration
 * 패키지/상품 관련 공통 설정값
 * 
 * 추후 DB(general_settings)에서 로드하도록 확장 가능
 */

/**
 * 패키지 구성 요소 옵션
 * 현재는 하드코딩이지만, 추후 DB에서 동적 로드 예정
 */
export const COMPOSITION_OPTIONS = [
    "VIDEO",
    "PHOTO",
    "HIGHLIGHT",
    "RAW",
    "REELS",
    "DRONE",
    "INTERVIEW"
] as const;

export type CompositionType = typeof COMPOSITION_OPTIONS[number];

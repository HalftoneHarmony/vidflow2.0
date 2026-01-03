import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 🧱 Utility Functions
 * 도메인에 종속되지 않는 순수 함수들
 */

/**
 * Tailwind CSS 클래스 병합 유틸리티
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * 금액을 원화 형식으로 포맷팅
 */
export function formatWon(amount: number): string {
    return new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "KRW",
    }).format(amount);
}

/**
 * 날짜를 한국어 형식으로 포맷팅
 */
export function formatDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(d);
}

/**
 * 상대 시간 포맷팅 (예: 3일 전)
 */
export function formatRelativeTime(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "오늘";
    if (diffDays === 1) return "어제";
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    return formatDate(d);
}

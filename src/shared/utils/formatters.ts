import { format, formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"

/**
 * 📅 Date & Currency Formatters
 * Heavy Metal Standard: Localized for Korea (ko-KR)
 */

// Example: 2026년 1월 4일 (토)
export function formatDate(date: Date | string | number | null | undefined): string {
    if (!date) return "-"
    try {
        const d = new Date(date)
        return format(d, "yyyy년 M월 d일 (EEE)", { locale: ko })
    } catch (e) {
        return "-"
    }
}

// Example: 2026.01.04 19:47
export function formatDateTime(date: Date | string | number | null | undefined): string {
    if (!date) return "-"
    try {
        const d = new Date(date)
        return format(d, "yyyy.MM.dd HH:mm", { locale: ko })
    } catch (e) {
        return "-"
    }
}

// Example: 3일 전, 방금 전
export function formatRelative(date: Date | string | number | null | undefined): string {
    if (!date) return "-"
    try {
        const d = new Date(date)
        return formatDistanceToNow(d, { addSuffix: true, locale: ko })
    } catch (e) {
        return "-"
    }
}

// Example: ₩1,234,567
export function formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return "-"
    return new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "KRW",
    }).format(amount)
}

// Example: 1,234 (Simple Number)
export function formatNumber(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return "-"
    return new Intl.NumberFormat("ko-KR").format(amount)
}

// Format utilities - centralized formatting functions

/**
 * Format price with Vietnamese locale
 */
export const formatPrice = (price: number, currency: string = "VND") => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
    }).format(price)
}

/**
 * Format duration in short format: "1h 30m" or "30m"
 */
export const formatDurationShort = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
        return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
}

/**
 * Format duration in long format: "1:30:00" or "30:00"
 */
export const formatDurationLong = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
}

/**
 * Format duration in Vietnamese text: "1 giờ 30 phút"
 */
export const formatDurationVietnamese = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const parts: string[] = []
    if (hours > 0) parts.push(`${hours} giờ`)
    if (minutes > 0) parts.push(`${minutes} phút`)
    return parts.join(" ") || "0 phút"
}

/**
 * Format number with thousand separators
 */
export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("vi-VN").format(num)
}

/**
 * Format percentage
 */
export const formatPercent = (value: number, decimals: number = 0): string => {
    return `${value.toFixed(decimals)}%`
}

/**
 * Format an ISO datetime as a Vietnamese relative time, e.g. "5 phút trước".
 */
export const formatRelativeTime = (iso: string): string => {
    const then = new Date(iso).getTime()
    if (Number.isNaN(then)) return ""
    const diffSec = Math.round((Date.now() - then) / 1000)
    if (diffSec < 60) return "Vừa xong"
    const diffMin = Math.round(diffSec / 60)
    if (diffMin < 60) return `${diffMin} phút trước`
    const diffHour = Math.round(diffMin / 60)
    if (diffHour < 24) return `${diffHour} giờ trước`
    const diffDay = Math.round(diffHour / 24)
    if (diffDay < 30) return `${diffDay} ngày trước`
    return new Date(iso).toLocaleDateString("vi-VN")
}

/**
 * Format an ISO datetime as Vietnamese date + time, e.g. "14:30, 16/06/2026".
 */
export const formatDateTime = (iso: string): string => {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ""
    return d.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    })
}

/**
 * Format an ISO date as a Vietnamese date, e.g. "16/06/2026".
 */
export const formatDate = (iso: string): string => {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ""
    return d.toLocaleDateString("vi-VN")
}

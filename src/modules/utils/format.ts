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

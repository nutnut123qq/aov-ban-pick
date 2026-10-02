/**
 * Hàm thống kê an toàn cho cỡ mẫu nhỏ — nền cho thống kê WR/PR/BR của draft.
 * Theo `.claude/design/05-statistics.md`: không bao giờ trả tỉ lệ "trần" mà không kèm
 * cỡ mẫu + khoảng tin cậy. Các hàm ở đây thuần tuý (pure), không phụ thuộc dữ liệu AOV.
 * Được gia cố chống triệt để Divide-by-Zero, NaN và giá trị âm bất thường.
 */

/** Mức tin cậy suy ra từ cỡ mẫu — để mã màu trên UI. */
export type ConfidenceLevel = "low" | "medium" | "high"

/** Ngưỡng cỡ mẫu phân loại độ tin cậy (n < medium = thấp; ≥ high = cao). */
export const SAMPLE_THRESHOLDS = { medium: 10, high: 30 } as const

/** z cho khoảng tin cậy 95%. */
export const Z_95 = 1.959963984540054

/** Khoảng \[low, high\] của một tỉ lệ, các giá trị 0..1. */
export interface RateInterval {
    /** Cận dưới (0..1). */
    low: number
    /** Cận trên (0..1). */
    high: number
}

/**
 * Phân loại độ tin cậy theo cỡ mẫu.
 * @param n - cỡ mẫu (số lần quan sát)
 * @returns "low" nếu n < 10 hoặc không hợp lệ, "medium" nếu 10..29, "high" nếu ≥ 30
 */
export const confidenceFromSample = (n: number): ConfidenceLevel => {
    if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) return "low"
    if (n >= SAMPLE_THRESHOLDS.high) return "high"
    if (n >= SAMPLE_THRESHOLDS.medium) return "medium"
    return "low"
}

/**
 * Khoảng tin cậy Wilson cho tỉ lệ nhị thức — ổn định hơn xấp xỉ normal ở cỡ mẫu nhỏ.
 * Tự động chặn các lỗi chia cho 0, số âm, NaN, Infinity.
 *
 * @param successes - số lần "thành công" (vd số trận thắng)
 * @param total - tổng số lần quan sát (n)
 * @param z - điểm z (mặc định 95%)
 * @returns khoảng [low, high] trong [0,1]; trả {0,0} nếu n ≤ 0 hoặc dữ liệu không hợp lệ
 */
export const wilsonInterval = (
    successes: number,
    total: number,
    z: number = Z_95,
): RateInterval => {
    if (
        typeof successes !== "number" ||
        typeof total !== "number" ||
        !Number.isFinite(successes) ||
        !Number.isFinite(total) ||
        total <= 0 ||
        successes < 0
    ) {
        return { low: 0, high: 0 }
    }

    const safeSuccesses = Math.min(total, Math.max(0, successes))
    const p = safeSuccesses / total
    const safeZ = typeof z === "number" && Number.isFinite(z) && z > 0 ? z : Z_95
    const z2 = safeZ * safeZ
    const denom = 1 + z2 / total

    if (!Number.isFinite(denom) || denom <= 0) return { low: 0, high: 0 }

    const center = (p + z2 / (2 * total)) / denom
    const variance = (p * (1 - p)) / total + z2 / (4 * total * total)
    const margin = (safeZ / denom) * Math.sqrt(Math.max(0, variance))

    const low = Math.max(0, Math.min(1, center - margin))
    const high = Math.max(0, Math.min(1, center + margin))

    return {
        low: Number.isFinite(low) ? low : 0,
        high: Number.isFinite(high) ? high : 0,
    }
}

/**
 * Tỉ lệ thắng làm mượt kiểu Beta-Binomial (empirical Bayes).
 * Kéo tướng ít trận về mức trung bình toàn meta thay vì nhảy lên 0%/100%.
 *
 * `WR_smoothed = (successes + α) / (total + α + β)` với `α = mean·k`, `β = (1-mean)·k`.
 *
 * @param successes - số trận thắng
 * @param total - số trận (n)
 * @param priorMean - WR trung bình toàn meta dùng làm prior (thường ~0.5)
 * @param priorStrength - "số trận ảo" của prior (α+β); càng lớn càng kéo mạnh về prior
 * @returns WR đã làm mượt trong [0,1]
 */
export const bayesSmoothedRate = (
    successes: number,
    total: number,
    priorMean: number = 0.5,
    priorStrength: number = 10,
): number => {
    const safePriorMean =
        typeof priorMean === "number" && Number.isFinite(priorMean)
            ? Math.max(0, Math.min(1, priorMean))
            : 0.5

    const safePriorStrength =
        typeof priorStrength === "number" && Number.isFinite(priorStrength) && priorStrength >= 0
            ? priorStrength
            : 10

    if (
        typeof successes !== "number" ||
        typeof total !== "number" ||
        !Number.isFinite(successes) ||
        !Number.isFinite(total) ||
        total < 0 ||
        successes < 0
    ) {
        return safePriorMean
    }

    const safeSuccesses = Math.min(total, Math.max(0, successes))
    const alpha = safePriorMean * safePriorStrength
    const beta = (1 - safePriorMean) * safePriorStrength
    const denom = total + alpha + beta

    if (!Number.isFinite(denom) || denom <= 0) return safePriorMean

    const rate = (safeSuccesses + alpha) / denom
    return Number.isFinite(rate) ? Math.max(0, Math.min(1, rate)) : safePriorMean
}


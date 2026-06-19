/**
 * Hàm thống kê an toàn cho cỡ mẫu nhỏ — nền cho thống kê WR/PR/BR của draft.
 * Theo `.claude/design/05-statistics.md`: không bao giờ trả tỉ lệ "trần" mà không kèm
 * cỡ mẫu + khoảng tin cậy. Các hàm ở đây thuần tuý (pure), không phụ thuộc dữ liệu AOV.
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
 * @returns "low" nếu n < 10, "medium" nếu 10..29, "high" nếu ≥ 30
 */
export const confidenceFromSample = (n: number): ConfidenceLevel => {
    if (n >= SAMPLE_THRESHOLDS.high) return "high"
    if (n >= SAMPLE_THRESHOLDS.medium) return "medium"
    return "low"
}

/**
 * Khoảng tin cậy Wilson cho tỉ lệ nhị thức — ổn định hơn xấp xỉ normal ở cỡ mẫu nhỏ.
 * @param successes - số lần "thành công" (vd số trận thắng)
 * @param total - tổng số lần quan sát (n)
 * @param z - điểm z (mặc định 95%)
 * @returns khoảng [low, high] trong [0,1]; trả {0,0} nếu n ≤ 0
 */
export const wilsonInterval = (
    successes: number,
    total: number,
    z: number = Z_95,
): RateInterval => {
    if (total <= 0) return { low: 0, high: 0 }
    const p = successes / total
    const z2 = z * z
    const denom = 1 + z2 / total
    const center = (p + z2 / (2 * total)) / denom
    const margin =
        (z / denom) * Math.sqrt((p * (1 - p)) / total + z2 / (4 * total * total))
    return {
        low: Math.max(0, center - margin),
        high: Math.min(1, center + margin),
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
    priorMean: number,
    priorStrength: number,
): number => {
    const alpha = priorMean * priorStrength
    const beta = (1 - priorMean) * priorStrength
    return (successes + alpha) / (total + alpha + beta)
}

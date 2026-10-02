/**
 * Định dạng giây thành "12′34″".
 * Làm tròn tổng giây TRƯỚC khi tách phút/giây — tránh hiển thị ":60"
 * khi giây lẻ làm tròn lên (vd 719.6s → 12′00″ chứ không phải 11′60″).
 * Input không hữu hạn/âm → kẹp về 0.
 */
export const formatSec = (sec: number): string => {
    const total = Number.isFinite(sec) && sec > 0 ? Math.round(sec) : 0
    const m = Math.floor(total / 60)
    const s = total - m * 60
    return `${m}′${String(s).padStart(2, "0")}″`
}

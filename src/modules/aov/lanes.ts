import type { Lane } from "@/modules/types"

/**
 * Nhãn lane tiếng Việt (thuật ngữ chính thức ĐTDV).
 * Trùng giá trị với `src/features/draft-input/sequence.ts` — giữ đồng bộ khi sửa.
 */
export const LANE_LABELS: Record<Lane, string> = {
    ta_than: "Tà thần",
    rung: "Rừng",
    giua: "Giữa",
    rong_xa: "Rồng (xạ thủ)",
    rong_ho_tro: "Hỗ trợ",
}

/** Lane dạng option {value,label} để render dropdown lọc. */
export const LANE_OPTIONS: Array<{ value: Lane; label: string }> = (
    Object.keys(LANE_LABELS) as Array<Lane>
).map((value) => ({ value, label: LANE_LABELS[value] }))

import type { Lane } from "@/modules/types"

/** Một ô draft đã điền: index trong DRAFT_SEQUENCE + hero + lane. */
export interface DraftSlot {
    /** index trong DRAFT_SEQUENCE (0..17). */
    index: number
    /** `hero_id` (slug); null = ô trống. */
    heroId: string | null
    /** lane đã gán; null cho ban hoặc pick chưa gán lane. */
    lane: Lane | null
}

/** Index slot hợp lệ trong DRAFT_SEQUENCE (0..17). */
const MAX_SLOT_INDEX = 17

const VALID_LANES: ReadonlySet<string> = new Set<Lane>([
    "ta_than",
    "rung",
    "giua",
    "rong_xa",
    "rong_ho_tro",
])

/**
 * Encode trạng thái draft thành chuỗi compact gắn vào query param `d`.
 * Format: `idx:hero:lane,idx:hero:lane,...` — chỉ ô có heroId mới ghi.
 * heroId là slug `[a-z0-9-]` nên chuỗi kết quả URL-safe, không cần encode thêm.
 * @returns "" khi không có ô nào được điền.
 */
export const encodeDraft = (slots: Array<DraftSlot>): string => {
    const tokens: Array<string> = []
    for (const s of slots ?? []) {
        if (!s || !s.heroId) continue
        tokens.push(s.lane ? `${s.index}:${s.heroId}:${s.lane}` : `${s.index}:${s.heroId}`)
    }
    return tokens.join(",")
}

/**
 * Decode chuỗi `d` từ URL về danh sách slot. Input lỗi/unknown → bỏ qua ô đó,
 * không throw. Index ngoài 0..17 bị bỏ; lane không hợp lệ → giữ pick, lane=null.
 * Trùng index → token sau ghi đè token trước. Kết quả sort theo index tăng dần.
 */
export const decodeDraft = (raw: string | null | undefined): Array<DraftSlot> => {
    if (!raw || typeof raw !== "string") return []
    const byIndex = new Map<number, DraftSlot>()
    for (const token of raw.split(",")) {
        const parts = token.split(":")
        if (parts.length < 2 || parts.length > 3) continue
        if (!/^\d+$/.test(parts[0])) continue
        const index = Number(parts[0])
        if (index > MAX_SLOT_INDEX) continue
        const heroId = parts[1]
        if (!heroId) continue
        const lanePart = parts[2]
        const lane = lanePart && VALID_LANES.has(lanePart) ? (lanePart as Lane) : null
        byIndex.set(index, { index, heroId, lane })
    }
    return [...byIndex.values()].sort((a, b) => a.index - b.index)
}

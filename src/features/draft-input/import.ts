import { DRAFT_SEQUENCE, LANES } from "./sequence"
import type { DraftMeta, FilledStep, Lane } from "./types"

const VALID_LANES = new Set<string>(LANES.map((l) => l.value))
const VALID_FORMATS = new Set<string>(["BO1", "BO3", "BO5", "BO7"])

/** Kết quả đọc ngược từ JSON export về state của form. */
export interface ImportedDraft {
    /** Meta series/ván suy ra từ JSON. */
    meta: DraftMeta
    /** 18 ô hero/lane theo đúng thứ tự `DRAFT_SEQUENCE`. */
    filled: Array<FilledStep>
}

/** "team_saigon_buffalo" → "saigon buffalo" — người dùng tự sửa lại tên hiển thị. */
const teamNameFromId = (id: unknown): string =>
    typeof id === "string" ? id.replace(/^team_/, "").replace(/_/g, " ") : ""

/** Giá trị lane hợp lệ, còn lại trả null để form báo thiếu. */
const asLane = (value: unknown): Lane | null =>
    typeof value === "string" && VALID_LANES.has(value) ? (value as Lane) : null

const asRecord = (v: unknown): Record<string, unknown> | null =>
    v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null

/**
 * Parse JSON export (object Series hoặc mảng Series) ngược về meta + filled
 * để điền lại form — dùng cho luồng "ảnh → Devin sinh JSON → user import kiểm tra".
 * Chỉ lấy **ván đầu tiên** trong `matches[]`. Ném `Error` tiếng Việt nếu sai dạng.
 */
export const parseImport = (raw: string): ImportedDraft => {
    let data: unknown
    try {
        data = JSON.parse(raw)
    } catch {
        throw new Error("JSON không hợp lệ — kiểm tra lại nội dung đã dán.")
    }

    const series = asRecord(Array.isArray(data) ? data[0] : data)
    if (!series) throw new Error("JSON không phải object Series.")

    const match = Array.isArray(series.matches) ? asRecord(series.matches[0]) : null
    if (!match) throw new Error("Series không có matches[] — đúng file export chưa?")

    const actions = match.draft_actions
    if (!Array.isArray(actions)) throw new Error("Ván thiếu draft_actions[].")

    const filled = DRAFT_SEQUENCE.map((step): FilledStep => {
        const a = asRecord(actions[step.index])
        return {
            heroId: typeof a?.hero_id === "string" ? a.hero_id : null,
            lane: step.action === "pick" ? asLane(a?.lane_position) : null,
        }
    })

    const blueId = match.team_blue_id ?? series.team_blue_id
    const redId = match.team_red_id ?? series.team_red_id
    const winnerId = match.winner_team_id
    const winner: DraftMeta["winner"] =
        winnerId === blueId ? "blue" : winnerId === redId ? "red" : ""

    const meta: DraftMeta = {
        tournamentName: typeof series.tournament_name === "string" ? series.tournament_name : "",
        patchId: typeof series.patch_id === "string" ? series.patch_id : "",
        format: VALID_FORMATS.has(series.format as string)
            ? (series.format as DraftMeta["format"])
            : "BO3",
        playedAt: typeof series.played_at === "string" ? series.played_at : "",
        vanNumber: typeof match.van_number === "number" ? match.van_number : 1,
        teamBlueName: teamNameFromId(blueId),
        teamRedName: teamNameFromId(redId),
        winner,
        durationSeconds: typeof match.duration_seconds === "number" ? match.duration_seconds : 0,
        isBlindPick: match.is_blind_pick === true,
    }

    return { meta, filled }
}

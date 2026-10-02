import type { Lane } from "@/modules/types"
import { clamp01, type PickCell, type Tally } from "./assist"

/** Kết quả chấm điểm đội hình. */
export interface CompScore {
    /** Xác suất bên Xanh thắng, 0..1. */
    probBlue: number
    /** Đóng góp từ WR lane của từng pick (−1..1, dương = lợi Xanh). */
    laneEdge: number
    /** Đóng góp từ synergy nội đội (−1..1). */
    synergyEdge: number
    /** Đóng góp từ kèo đối đầu chéo (−1..1). */
    matchupEdge: number
}

/** Một pick tham gia chấm điểm: tướng + lane đã gán. */
export interface CompPick {
    /** `hero_id` (slug). */
    heroId: string
    /** Lane của pick này. */
    lane: Lane
}

/**
 * Chấm điểm đội hình sau/đang draft, dựa trên Tally đã có.
 * Công thức heuristic: probBlue = sigmoid tổng hợp 3 tín hiệu
 * (lane WR, synergy nội đội, matchup chéo), mỗi thành phần chuẩn hoá −1..1.
 * @returns null nếu dữ liệu quá ít để chấm.
 */
export const scoreDraft = (
    blue: Array<CompPick>,
    red: Array<CompPick>,
    t: Tally,
): CompScore | null => {
    if (!t || t.totalMatches < MIN_MATCHES) return null

    const bluePicks = validPicks(blue)
    const redPicks = validPicks(red)
    // Chấm được khi chưa đủ 5 pick — nhưng cần ít nhất 1 pick hợp lệ mỗi bên.
    if (bluePicks.length === 0 || redPicks.length === 0) return null

    const laneEdge = clampEdge(
        (meanAdjRate(bluePicks, t) - meanAdjRate(redPicks, t)) / 0.5,
    )
    const synergyEdge = clampEdge(
        (meanPairRate(bluePicks, t) - meanPairRate(redPicks, t)) / 0.5,
    )
    const matchupEdge = clampEdge((meanMatchupRate(bluePicks, redPicks, t) - 0.5) / 0.5)

    const raw = 0.5 + 0.4 * laneEdge + 0.3 * synergyEdge + 0.3 * matchupEdge
    const probBlue = Number.isFinite(raw) ? Math.max(0.05, Math.min(0.95, raw)) : 0.5

    return { probBlue, laneEdge, synergyEdge, matchupEdge }
}

/** Số ván tối thiểu trong nguồn dữ liệu để chấm điểm có nghĩa. */
const MIN_MATCHES = 50

/** Mẫu tối thiểu của một cặp (synergy/matchup) mới được tính — đồng bộ assist.ts. */
const MIN_PAIR_SAMPLE = 5

/** Kẹp tín hiệu về [-1, 1]; NaN/Infinity → 0 (trung lập). */
const clampEdge = (x: number): number => {
    if (!Number.isFinite(x) || Number.isNaN(x)) return 0
    return x < -1 ? -1 : x > 1 ? 1 : x
}

/** Chỉ giữ pick đủ hero + lane để tra tally. */
const validPicks = (picks: Array<CompPick>): Array<CompPick> =>
    (picks ?? []).filter((p) => Boolean(p?.heroId) && Boolean(p?.lane))

/**
 * WR điều chỉnh theo phe của một ô pick `hero|lane` — cùng công thức assist.ts:
 * `(wins − expWins + 0.5n)/n` với `expWins = redN·redBase + (n−redN)·blueBase`.
 * Không có trong tally → 0.5 (trung lập).
 */
const adjRate = (cell: PickCell | undefined, t: Tally): number => {
    if (!cell || cell.n <= 0) return 0.5
    const expWins =
        cell.redN * t.redBase + (cell.n - cell.redN) * t.blueBase
    return clamp01((cell.wins - expWins + 0.5 * cell.n) / cell.n)
}

/** Mean adjRate của các pick một bên; bên không có pick → 0.5. */
const meanAdjRate = (picks: Array<CompPick>, t: Tally): number => {
    if (picks.length === 0) return 0.5
    let sum = 0
    for (const p of picks) {
        sum += adjRate(t.pick.get(`${p.heroId}|${p.lane}`), t)
    }
    return sum / picks.length
}

/** Mean WR các cặp nội bộ (C(k,2), bỏ cặp n < 5); không có cặp đủ mẫu → 0.5. */
const meanPairRate = (picks: Array<CompPick>, t: Tally): number => {
    let sum = 0
    let count = 0
    for (let i = 0; i < picks.length; i++) {
        for (let j = i + 1; j < picks.length; j++) {
            const cell = t.pair.get([picks[i].heroId, picks[j].heroId].sort().join("+"))
            if (!cell || cell.n < MIN_PAIR_SAMPLE) continue
            sum += cell.wins / cell.n
            count++
        }
    }
    return count > 0 ? sum / count : 0.5
}

/** Mean WR của phe blue trong các kèo chéo `blue|red` (bỏ n < 5); không có → 0.5. */
const meanMatchupRate = (
    blue: Array<CompPick>,
    red: Array<CompPick>,
    t: Tally,
): number => {
    let sum = 0
    let count = 0
    for (const b of blue) {
        for (const r of red) {
            const cell = t.matchup.get(`${b.heroId}|${r.heroId}`)
            if (!cell || cell.n < MIN_PAIR_SAMPLE) continue
            sum += cell.wins / cell.n
            count++
        }
    }
    return count > 0 ? sum / count : 0.5
}

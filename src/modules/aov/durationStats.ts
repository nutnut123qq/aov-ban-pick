import type { Series } from "@/modules/types"

/** Một dòng thống kê thời lượng của hero hoặc team. */
export interface DurationRow {
    /** `hero_id` hoặc `team_id` tuỳ nhóm. */
    id: string
    /** Số ván thắng có duration hợp lệ (mẫu của `avgWinSec`). */
    winN: number
    /** Số ván thua có duration hợp lệ (mẫu của `avgLoseSec`). */
    loseN: number
    /** TB giây mỗi ván KHI THẮNG; null khi `winN` dưới mẫu tối thiểu. */
    avgWinSec: number | null
    /** TB giây mỗi ván KHI THUA; null khi `loseN` dưới mẫu tối thiểu. */
    avgLoseSec: number | null
}

/** Kết quả thống kê thời lượng toàn dataset. */
export interface DurationStats {
    /** TB giây/ván của TOÀN meta — chuẩn so sánh "nhanh/chậm". */
    metaAvgSec: number
    /** Số ván có duration hợp lệ (duration_seconds > 0). */
    gamesWithDuration: number
    /** Theo hero (phe pick tướng): sắp theo avgWinSec tăng dần (thắng nhanh nhất trước). */
    hero: Array<DurationRow>
    /** Theo team: sắp theo avgWinSec tăng dần. */
    team: Array<DurationRow>
}

/** Mẫu tối thiểu để trả trung bình — dưới mức này `avgWinSec`/`avgLoseSec` = null. */
export const MIN_SAMPLE = 5

/** Bộ đếm duration tích luỹ cho một hero hoặc team. */
interface DurAcc {
    /** Số ván thắng có duration hợp lệ. */
    winN: number
    /** Số ván thua có duration hợp lệ. */
    loseN: number
    /** Tổng giây của các ván thắng. */
    winSum: number
    /** Tổng giây của các ván thua. */
    loseSum: number
}

/** Cộng 1 mẫu duration `sec` vào acc của `id` (win hoặc lose). */
const bumpDur = (map: Map<string, DurAcc>, id: string, won: boolean, sec: number): void => {
    const acc = map.get(id) ?? { winN: 0, loseN: 0, winSum: 0, loseSum: 0 }
    if (won) {
        acc.winN++
        acc.winSum += sec
    } else {
        acc.loseN++
        acc.loseSum += sec
    }
    map.set(id, acc)
}

/** DurAcc → DurationRow, áp mẫu tối thiểu `MIN_SAMPLE`. */
const toDurationRow = (id: string, acc: DurAcc): DurationRow => ({
    id,
    winN: acc.winN,
    loseN: acc.loseN,
    avgWinSec: acc.winN >= MIN_SAMPLE ? acc.winSum / acc.winN : null,
    avgLoseSec: acc.loseN >= MIN_SAMPLE ? acc.loseSum / acc.loseN : null,
})

/** Sắp theo `avgWinSec` tăng dần, null xuống cuối, tie-break `id` tăng dần. */
const byAvgWinSec = (a: DurationRow, b: DurationRow): number => {
    if (a.avgWinSec === null && b.avgWinSec === null) return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
    if (a.avgWinSec === null) return 1
    if (b.avgWinSec === null) return -1
    return a.avgWinSec - b.avgWinSec || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
}

/**
 * Thống kê thời lượng ván (`duration_seconds`) theo hero và team.
 * - Hero: mỗi lượt pick trong ván đóng góp 1 mẫu vào hero đó (win/lose theo bên pick).
 * - Team: mỗi ván đóng góp 1 mẫu cho team thắng (`winN`) và 1 cho team thua (`loseN`).
 * - Bỏ qua ván thiếu/`duration_seconds <= 0`. Mẫu tối thiểu 5 mới trả avg.
 */
export const getDurationStats = (series: Array<Series>): DurationStats => {
    const heroAcc = new Map<string, DurAcc>()
    const teamAcc = new Map<string, DurAcc>()
    let durSum = 0
    let gamesWithDuration = 0

    if (!Array.isArray(series)) {
        return { metaAvgSec: 0, gamesWithDuration: 0, hero: [], team: [] }
    }

    for (const s of series) {
        if (!s || !Array.isArray(s.matches)) continue
        for (const m of s.matches) {
            if (!m || !Array.isArray(m.draft_actions)) continue
            const dur = m.duration_seconds
            if (typeof dur !== "number" || !Number.isFinite(dur) || dur <= 0) continue
            gamesWithDuration++
            durSum += dur

            const winnerIsBlue = m.winner_team_id === m.team_blue_id
            const winnerIsRed = m.winner_team_id === m.team_red_id
            // Ván không rõ bên thắng: chỉ tính vào metaAvgSec, không gán hero/team.
            if (!winnerIsBlue && !winnerIsRed) continue

            bumpDur(teamAcc, m.winner_team_id, true, dur)
            bumpDur(teamAcc, winnerIsBlue ? m.team_red_id : m.team_blue_id, false, dur)

            for (const a of m.draft_actions) {
                if (!a || a.action_type !== "pick" || !a.hero_id || !a.lane_position) continue
                const won = a.team_side === "blue" ? winnerIsBlue : winnerIsRed
                bumpDur(heroAcc, a.hero_id, won, dur)
            }
        }
    }

    return {
        metaAvgSec: gamesWithDuration > 0 ? durSum / gamesWithDuration : 0,
        gamesWithDuration,
        hero: [...heroAcc.entries()].map(([id, acc]) => toDurationRow(id, acc)).sort(byAvgWinSec),
        team: [...teamAcc.entries()].map(([id, acc]) => toDurationRow(id, acc)).sort(byAvgWinSec),
    }
}

import type { HeroManifest, Lane, Match, Series, TeamSide } from "@/modules/types"
import {
    bayesSmoothedRate,
    confidenceFromSample,
    wilsonInterval,
    type ConfidenceLevel,
} from "@/modules/utils/statistics"

/**
 * Số "trận ảo" của prior khi làm mượt Bayes (α+β). 10 ≈ kéo nhẹ tướng ít trận
 * về mức trung bình meta mà không lấn át dữ liệu thật khi n lớn dần.
 */
export const PRIOR_STRENGTH = 10

/** Một dòng thống kê meta cho một cặp (tướng, lane). */
export interface MetaRow {
    /** `hero_id`. */
    heroId: string
    /** Tên hiển thị (fallback về heroId nếu thiếu trong catalog). */
    heroName: string
    /** Tên file ảnh, hoặc null nếu không có trong catalog. */
    heroFile: string | null
    /** Lane của dòng này. */
    lane: Lane
    /** Số lần được pick ở lane này (= n cho WR). */
    picks: number
    /** Số trận thắng khi pick ở lane này. */
    wins: number
    /** WR đã làm mượt Bayes (0..1). */
    winRate: number
    /** WR quan sát thô (0..1). */
    winRateRaw: number
    /** Cận dưới khoảng tin cậy Wilson (0..1). */
    ciLow: number
    /** Cận trên khoảng tin cậy Wilson (0..1). */
    ciHigh: number
    /** Mức tin cậy theo cỡ mẫu. */
    confidence: ConfidenceLevel
    /** Pick rate = picks / tổng số ván (0..1). */
    pickRate: number
    /** Ban rate toàn tướng = số lần cấm / tổng số ván (0..1). */
    banRate: number
}

/** Bộ lọc thống kê meta. */
export interface MetaFilter {
    /** `patch_id` cần lọc, hoặc "all" cho mọi patch. */
    patchId: string
    /** Lane cần lọc, hoặc "all" cho mọi lane. */
    lane: Lane | "all"
}

/** Kết quả tổng hợp meta. */
export interface MetaResult {
    /** Các dòng (tướng, lane) đã lọc, sắp theo số pick giảm dần. */
    rows: Array<MetaRow>
    /** Tổng số ván sau khi lọc patch (mẫu số cho PR/BR). */
    totalMatches: number
    /** Mọi `patch_id` có trong dữ liệu (dựng dropdown), không phụ thuộc bộ lọc. */
    patches: Array<string>
}

/** Bộ đếm pick/thắng cho một cặp (tướng, lane). */
interface PickAcc {
    picks: number
    wins: number
}

/** Bên `side` có thắng ván `m` không. */
const isPickWinner = (m: Match, side: TeamSide): boolean => {
    const teamId = side === "blue" ? m.team_blue_id : m.team_red_id
    return m.winner_team_id === teamId
}

/**
 * Tổng hợp WR/PR/BR theo (tướng, lane) cho một bộ lọc patch/lane.
 * Lọc theo `patch_id` TRƯỚC khi tính (meta reset theo patch — xem design/05).
 * @param series - mọi series đã load
 * @param heroes - catalog tướng để gắn tên/ảnh
 * @param filter - bộ lọc patch + lane
 * @returns các dòng thống kê + tổng số ván + danh sách patch
 */
export const aggregateMeta = (
    series: Array<Series>,
    heroes: Array<HeroManifest>,
    filter: MetaFilter,
): MetaResult => {
    const heroById = new Map(heroes.map((h) => [h.slug, h]))
    const patchSet = new Set<string>()

    // key = `${heroId}|${lane}`
    const pickAcc = new Map<string, PickAcc>()
    // key = heroId
    const banCount = new Map<string, number>()
    let totalMatches = 0
    let totalPicks = 0
    let totalPickWins = 0

    for (const s of series) {
        patchSet.add(s.patch_id)
        if (filter.patchId !== "all" && s.patch_id !== filter.patchId) continue

        for (const m of s.matches) {
            totalMatches++
            for (const a of m.draft_actions) {
                if (a.action_type === "ban") {
                    banCount.set(a.hero_id, (banCount.get(a.hero_id) ?? 0) + 1)
                    continue
                }
                // pick: bỏ qua nếu thiếu lane (không gán lane → matchup vô nghĩa)
                if (!a.lane_position) continue
                const won = isPickWinner(m, a.team_side)
                totalPicks++
                if (won) totalPickWins++

                const key = `${a.hero_id}|${a.lane_position}`
                const acc = pickAcc.get(key) ?? { picks: 0, wins: 0 }
                acc.picks++
                if (won) acc.wins++
                pickAcc.set(key, acc)
            }
        }
    }

    // Prior = WR trung bình toàn meta trong tập đã lọc (theo lý thuyết ~0.5).
    const priorMean = totalPicks > 0 ? totalPickWins / totalPicks : 0.5

    const rows: Array<MetaRow> = []
    for (const [key, acc] of pickAcc) {
        const sep = key.indexOf("|")
        const heroId = key.slice(0, sep)
        const lane = key.slice(sep + 1) as Lane
        if (filter.lane !== "all" && lane !== filter.lane) continue

        const hero = heroById.get(heroId)
        const ci = wilsonInterval(acc.wins, acc.picks)
        rows.push({
            heroId,
            heroName: hero?.name ?? heroId,
            heroFile: hero?.file ?? null,
            lane,
            picks: acc.picks,
            wins: acc.wins,
            winRate: bayesSmoothedRate(acc.wins, acc.picks, priorMean, PRIOR_STRENGTH),
            winRateRaw: acc.picks > 0 ? acc.wins / acc.picks : 0,
            ciLow: ci.low,
            ciHigh: ci.high,
            confidence: confidenceFromSample(acc.picks),
            pickRate: totalMatches > 0 ? acc.picks / totalMatches : 0,
            banRate: totalMatches > 0 ? (banCount.get(heroId) ?? 0) / totalMatches : 0,
        })
    }

    rows.sort((a, b) => b.picks - a.picks || b.winRate - a.winRate)

    return { rows, totalMatches, patches: [...patchSet].sort() }
}

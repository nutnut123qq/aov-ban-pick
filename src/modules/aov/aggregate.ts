import type { HeroManifest, Lane, Match, Series, TeamSide } from "@/modules/types"

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
    /** WR thô = wins / picks (0..1). */
    winRate: number
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
    /** Tên giải đấu cần lọc, hoặc "all" cho mọi giải. */
    tournamentName: string
}

/** Kết quả tổng hợp meta. */
export interface MetaResult {
    /** Các dòng (tướng, lane) đã lọc, sắp theo số pick giảm dần. */
    rows: Array<MetaRow>
    /** Tổng số ván sau khi lọc patch (mẫu số cho PR/BR). */
    totalMatches: number
    /** Mọi `patch_id` có trong dữ liệu (dựng dropdown), không phụ thuộc bộ lọc. */
    patches: Array<string>
    /** Mọi tên giải đấu có trong dữ liệu (dựng dropdown), không phụ thuộc bộ lọc. */
    tournaments: Array<string>
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
    const tournamentSet = new Set<string>()

    // key = `${heroId}|${lane}`
    const pickAcc = new Map<string, PickAcc>()
    // key = heroId
    const banCount = new Map<string, number>()
    let totalMatches = 0

    for (const s of series) {
        patchSet.add(s.patch_id)
        tournamentSet.add(s.tournament_name)
        if (filter.patchId !== "all" && s.patch_id !== filter.patchId) continue
        if (filter.tournamentName !== "all" && s.tournament_name !== filter.tournamentName) continue

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
                const key = `${a.hero_id}|${a.lane_position}`
                const acc = pickAcc.get(key) ?? { picks: 0, wins: 0 }
                acc.picks++
                if (won) acc.wins++
                pickAcc.set(key, acc)
            }
        }
    }

    const rows: Array<MetaRow> = []
    for (const [key, acc] of pickAcc) {
        const sep = key.indexOf("|")
        const heroId = key.slice(0, sep)
        const lane = key.slice(sep + 1) as Lane
        if (filter.lane !== "all" && lane !== filter.lane) continue

        const hero = heroById.get(heroId)
        rows.push({
            heroId,
            heroName: hero?.name ?? heroId,
            heroFile: hero?.file ?? null,
            lane,
            picks: acc.picks,
            wins: acc.wins,
            winRate: acc.picks > 0 ? acc.wins / acc.picks : 0,
            pickRate: totalMatches > 0 ? acc.picks / totalMatches : 0,
            banRate: totalMatches > 0 ? (banCount.get(heroId) ?? 0) / totalMatches : 0,
        })
    }

    rows.sort((a, b) => b.picks - a.picks || b.winRate - a.winRate)

    return {
        rows,
        totalMatches,
        patches: [...patchSet].sort(),
        tournaments: [...tournamentSet].sort(),
    }
}

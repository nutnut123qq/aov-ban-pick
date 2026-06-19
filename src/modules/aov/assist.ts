import type { HeroManifest, Lane, Series, TeamSide } from "@/modules/types"
import {
    bayesSmoothedRate,
    confidenceFromSample,
    type ConfidenceLevel,
} from "@/modules/utils/statistics"

import { PRIOR_STRENGTH } from "./aggregate"
import { LANE_LABELS } from "./lanes"

/**
 * Ngữ cảnh của lượt đang tới — do UI bàn draft tính từ trạng thái bàn cờ rồi truyền vào.
 * Tách khỏi cấu trúc bàn cờ để engine gợi ý thuần tuý, dễ test.
 */
export interface AssistContext {
    /** Lượt này là cấm hay chọn. */
    action: "ban" | "pick"
    /** Bên đang tới lượt. */
    side: TeamSide
    /** Mọi `hero_id` đã có trên bàn (cả 2 bên, cấm lẫn chọn) — không gợi lại. */
    used: Set<string>
    /** Các lane phía mình còn thiếu (chỉ dùng cho lượt pick). */
    lanesNeeded: Array<Lane>
    /** Tướng đối phương đã lộ kèm lane (để gợi ý counter). */
    enemyRevealed: Array<{ heroId: string; lane: Lane }>
}

/** Một gợi ý cho lượt hiện tại, kèm lý do giải thích được + cỡ mẫu. */
export interface Suggestion {
    /** `hero_id`. */
    heroId: string
    /** Tên hiển thị. */
    heroName: string
    /** File ảnh, hoặc null. */
    heroFile: string | null
    /** Một dòng lý do (đã việt hoá). */
    reason: string
    /** Cỡ mẫu chống lưng cho gợi ý (số ban hoặc số pick). */
    n: number
    /** WR đã làm mượt (0..1) khi áp dụng — chỉ với lượt pick. */
    winRate?: number
    /** Mức tin cậy theo cỡ mẫu. */
    confidence: ConfidenceLevel
    /** Lane gắn với gợi ý (lượt pick). */
    lane?: Lane
}

/** Số gợi ý tối đa trả về mỗi lượt. */
const MAX_SUGGESTIONS = 6

const ALL_LANES: Array<Lane> = ["ta_than", "rung", "giua", "rong_xa", "rong_ho_tro"]

interface PickCell {
    n: number
    wins: number
}

interface Tally {
    totalMatches: number
    /** key = heroId → số lần bị cấm. */
    banCount: Map<string, number>
    /** key = `${heroId}|${lane}` → đếm pick/thắng. */
    pick: Map<string, PickCell>
    /** key = heroId → các lane đã từng đi (phát hiện flex). */
    lanesByHero: Map<string, Set<Lane>>
    /** key = heroId → tổng số pick mọi lane. */
    pickTotal: Map<string, number>
}

/** Quét toàn bộ series một lượt, dựng các bảng đếm cho engine gợi ý. */
const tally = (series: Array<Series>): Tally => {
    const banCount = new Map<string, number>()
    const pick = new Map<string, PickCell>()
    const lanesByHero = new Map<string, Set<Lane>>()
    const pickTotal = new Map<string, number>()
    let totalMatches = 0

    for (const s of series) {
        for (const m of s.matches) {
            totalMatches++
            for (const a of m.draft_actions) {
                if (a.action_type === "ban") {
                    banCount.set(a.hero_id, (banCount.get(a.hero_id) ?? 0) + 1)
                    continue
                }
                if (!a.lane_position) continue
                const won =
                    m.winner_team_id ===
                    (a.team_side === "blue" ? m.team_blue_id : m.team_red_id)

                const key = `${a.hero_id}|${a.lane_position}`
                const cell = pick.get(key) ?? { n: 0, wins: 0 }
                cell.n++
                if (won) cell.wins++
                pick.set(key, cell)

                pickTotal.set(a.hero_id, (pickTotal.get(a.hero_id) ?? 0) + 1)
                if (!lanesByHero.has(a.hero_id)) lanesByHero.set(a.hero_id, new Set())
                lanesByHero.get(a.hero_id)!.add(a.lane_position)
            }
        }
    }

    return { totalMatches, banCount, pick, lanesByHero, pickTotal }
}

/** Gợi ý cho lượt CẤM: tướng ban-rate cao + flex nhiều lane (khó đoán bài). */
const suggestBans = (
    t: Tally,
    ctx: AssistContext,
    heroById: Map<string, HeroManifest>,
): Array<Suggestion> => {
    // Hợp nhất ứng viên: từng bị cấm HOẶC từng được pick (để cả tướng chỉ pick cũng lên).
    const candidates = new Set<string>([...t.banCount.keys(), ...t.pickTotal.keys()])

    const scored = [...candidates]
        .filter((id) => !ctx.used.has(id))
        .map((id) => {
            const bans = t.banCount.get(id) ?? 0
            const picks = t.pickTotal.get(id) ?? 0
            const lanes = t.lanesByHero.get(id)?.size ?? 0
            const banRate = t.totalMatches > 0 ? bans / t.totalMatches : 0
            const presence = t.totalMatches > 0 ? (bans + picks) / t.totalMatches : 0
            return { id, bans, picks, lanes, banRate, presence }
        })
        // Ưu tiên độ hiện diện (ban+pick), rồi số lần bị cấm.
        .sort((a, b) => b.presence - a.presence || b.bans - a.bans)
        .slice(0, MAX_SUGGESTIONS)

    return scored.map((c) => {
        const hero = heroById.get(c.id)
        const flex = c.lanes >= 2 ? ` · flex ${c.lanes} lane (khó đoán bài)` : ""
        const reason =
            c.bans > 0
                ? `Ban-rate ${(c.banRate * 100).toFixed(0)}%${flex}`
                : `Hay xuất hiện ${(c.presence * 100).toFixed(0)}%${flex}`
        return {
            heroId: c.id,
            heroName: hero?.name ?? c.id,
            heroFile: hero?.file ?? null,
            reason,
            n: c.bans + c.picks,
            confidence: confidenceFromSample(c.bans + c.picks),
        }
    })
}

/** Gợi ý cho lượt CHỌN: WR cao theo lane còn thiếu + ghi chú counter khi địch đã lộ bài. */
const suggestPicks = (
    t: Tally,
    ctx: AssistContext,
    heroById: Map<string, HeroManifest>,
): Array<Suggestion> => {
    const lanes = ctx.lanesNeeded.length > 0 ? ctx.lanesNeeded : ALL_LANES
    const enemyByLane = new Map<Lane, string>()
    for (const e of ctx.enemyRevealed) enemyByLane.set(e.lane, e.heroId)

    const rows: Array<{ suggestion: Suggestion; score: number }> = []
    for (const [key, cell] of t.pick) {
        const sep = key.indexOf("|")
        const heroId = key.slice(0, sep)
        const lane = key.slice(sep + 1) as Lane
        if (ctx.used.has(heroId)) continue
        if (!lanes.includes(lane)) continue

        const wr = bayesSmoothedRate(cell.wins, cell.n, 0.5, PRIOR_STRENGTH)
        const hero = heroById.get(heroId)
        const enemy = enemyByLane.get(lane)
        const counterNote = enemy
            ? ` · khắc ${LANE_LABELS[lane]} (địch đã có ${heroById.get(enemy)?.name ?? enemy})`
            : ""
        rows.push({
            suggestion: {
                heroId,
                heroName: hero?.name ?? heroId,
                heroFile: hero?.file ?? null,
                reason: `WR ${LANE_LABELS[lane]} ${(wr * 100).toFixed(0)}% (n=${cell.n})${counterNote}`,
                n: cell.n,
                winRate: wr,
                confidence: confidenceFromSample(cell.n),
                lane,
            },
            // Ưu tiên lane có địch lộ bài (cần đối đáp), rồi WR, rồi cỡ mẫu.
            score: (enemy ? 1 : 0) * 1000 + wr * 100 + Math.min(cell.n, 50) / 100,
        })
    }

    return rows
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_SUGGESTIONS)
        .map((r) => r.suggestion)
}

/**
 * Gợi ý cấm/chọn cho lượt hiện tại dựa trên thống kê đã có.
 * Trả mảng rỗng khi chưa đủ dữ liệu — UI tự hiển thị trạng thái "chưa có gợi ý".
 * @param ctx - ngữ cảnh lượt hiện tại (bên, hành động, bàn cờ)
 * @param series - mọi series đã load
 * @param heroes - catalog tướng (tên/ảnh)
 * @returns danh sách gợi ý đã xếp hạng (tối đa 6)
 */
export const suggestStep = (
    ctx: AssistContext,
    series: Array<Series>,
    heroes: Array<HeroManifest>,
): Array<Suggestion> => {
    const t = tally(series)
    if (t.totalMatches === 0) return []
    const heroById = new Map(heroes.map((h) => [h.slug, h]))
    return ctx.action === "ban"
        ? suggestBans(t, ctx, heroById)
        : suggestPicks(t, ctx, heroById)
}

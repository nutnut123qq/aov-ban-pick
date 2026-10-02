import type { HeroManifest, Lane, Series, TeamSide } from "@/modules/types"
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
    /** Tướng đồng đội đã pick kèm lane (để gợi ý combo/synergy). */
    alliesPicked: Array<{ heroId: string; lane: Lane }>
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
    /** Lane gắn với gợi ý (lượt pick). */
    lane?: Lane
}

/** Số gợi ý tối đa trả về mỗi lượt. */
const MAX_SUGGESTIONS = 6

const ALL_LANES: Array<Lane> = ["ta_than", "rung", "giua", "rong_xa", "rong_ho_tro"]

/** Kẹp về [0, 1] an toàn — bảo vệ chống NaN, Infinity. */
export const clamp01 = (x: number): number => {
    if (typeof x !== "number" || !Number.isFinite(x) || Number.isNaN(x)) return 0.5
    return x < 0 ? 0 : x > 1 ? 1 : x
}

/**
 * Cận dưới khoảng tin cậy Wilson 95% cho tỉ lệ thắng — dùng để XẾP HẠNG.
 * Kéo mẫu nhỏ về thấp, bảo vệ triệt để chống chia 0 và số âm.
 */
export const wilsonLower = (wins: number, n: number): number => {
    if (
        typeof wins !== "number" ||
        typeof n !== "number" ||
        !Number.isFinite(wins) ||
        !Number.isFinite(n) ||
        n <= 0 ||
        wins < 0
    ) {
        return 0
    }
    const safeWins = Math.min(n, Math.max(0, wins))
    const z = 1.959963984540054
    const z2 = z * z
    const phat = safeWins / n
    const denom = 1 + z2 / n
    if (!Number.isFinite(denom) || denom <= 0) return 0

    const center = phat + z2 / (2 * n)
    const variance = (phat * (1 - phat)) / n + z2 / (4 * n * n)
    const margin = z * Math.sqrt(Math.max(0, variance))
    const result = (center - margin) / denom

    return Number.isFinite(result) ? Math.max(0, Math.min(1, result)) : 0
}

export interface PickCell {
    n: number
    wins: number
    /** Số lần pick này nằm ở bên đỏ (để khử nhiễu lợi thế phe khi xếp hạng). */
    redN: number
}

export interface Tally {
    totalMatches: number
    /** key = heroId → số lần bị cấm. */
    banCount: Map<string, number>
    /** key = `${heroId}|${lane}` → đếm pick/thắng. */
    pick: Map<string, PickCell>
    /** key = heroId → các lane đã từng đi (phát hiện flex). */
    lanesByHero: Map<string, Set<Lane>>
    /** key = heroId → tổng số pick mọi lane. */
    pickTotal: Map<string, number>
    /** Tỉ lệ thắng nền của bên xanh (first pick) — base rate để khử nhiễu phe. */
    blueBase: number
    /** Tỉ lệ thắng nền của bên đỏ (last pick). */
    redBase: number
    /** key = lane → tỉ lệ lane đó được pick trong phase 1 (pick_index ≤ 6). */
    lanePhase1Share: Map<Lane, number>
    /** key = `${a}+${b}` (đã sort) → số ván/thắng khi 2 tướng chơi CÙNG bên. */
    pair: Map<string, PickCell>
    /** key = `${a}|${b}` → số ván/thắng của phe có `a` khi gặp `b` bên kia. */
    matchup: Map<string, PickCell>
}

/** Pick thuộc phase 1 (lượt chọn đầu) khi pick_index nằm trong 1..6. */
const PHASE1_MAX_PICK = 6

/** Quét toàn bộ series một lượt, dựng các bảng đếm cho engine gợi ý. */
export const tally = (series: Array<Series>): Tally => {
    const banCount = new Map<string, number>()
    const pick = new Map<string, PickCell>()
    const lanesByHero = new Map<string, Set<Lane>>()
    const pickTotal = new Map<string, number>()
    const laneN = new Map<Lane, number>()
    const lanePhase1 = new Map<Lane, number>()
    const pair = new Map<string, PickCell>()
    const matchup = new Map<string, PickCell>()
    let totalMatches = 0
    let blueWins = 0

    if (!Array.isArray(series)) {
        return createEmptyTally()
    }

    for (const s of series) {
        if (!s || !Array.isArray(s.matches)) continue
        for (const m of s.matches) {
            if (!m || !Array.isArray(m.draft_actions)) continue
            totalMatches++
            const blueWon = m.winner_team_id && m.winner_team_id === m.team_blue_id
            if (blueWon) blueWins++
            const bluePicks: Array<string> = []
            const redPicks: Array<string> = []
            for (const a of m.draft_actions) {
                if (!a || !a.hero_id) continue
                if (a.action_type === "ban") {
                    banCount.set(a.hero_id, (banCount.get(a.hero_id) ?? 0) + 1)
                    continue
                }
                if (!a.lane_position) continue
                const won =
                    m.winner_team_id ===
                    (a.team_side === "blue" ? m.team_blue_id : m.team_red_id)

                const key = `${a.hero_id}|${a.lane_position}`
                const cell = pick.get(key) ?? { n: 0, wins: 0, redN: 0 }
                cell.n++
                if (won) cell.wins++
                if (a.team_side === "red") cell.redN++
                pick.set(key, cell)

                pickTotal.set(a.hero_id, (pickTotal.get(a.hero_id) ?? 0) + 1)
                if (!lanesByHero.has(a.hero_id)) lanesByHero.set(a.hero_id, new Set())
                lanesByHero.get(a.hero_id)!.add(a.lane_position)

                laneN.set(a.lane_position, (laneN.get(a.lane_position) ?? 0) + 1)
                if (a.pick_index != null && a.pick_index <= PHASE1_MAX_PICK) {
                    lanePhase1.set(a.lane_position, (lanePhase1.get(a.lane_position) ?? 0) + 1)
                }
                ;(a.team_side === "blue" ? bluePicks : redPicks).push(a.hero_id)
            }

            // Cặp cùng bên (synergy) + cặp đối đầu (matchup) — chỉ khi đủ 5 pick/bên.
            if (bluePicks.length >= 5 && redPicks.length >= 5) {
                for (const side of [bluePicks, redPicks]) {
                    const sideWon = side === bluePicks ? blueWon : !blueWon
                    for (let i = 0; i < side.length; i++) {
                        for (let j = i + 1; j < side.length; j++) {
                            const k = [side[i], side[j]].sort().join("+")
                            const cell = pair.get(k) ?? { n: 0, wins: 0, redN: 0 }
                            cell.n++
                            if (sideWon) cell.wins++
                            pair.set(k, cell)
                        }
                    }
                }
                for (const b of bluePicks) {
                    for (const r of redPicks) {
                        const fwd = matchup.get(`${b}|${r}`) ?? { n: 0, wins: 0, redN: 0 }
                        fwd.n++
                        if (blueWon) fwd.wins++
                        matchup.set(`${b}|${r}`, fwd)
                        const rev = matchup.get(`${r}|${b}`) ?? { n: 0, wins: 0, redN: 0 }
                        rev.n++
                        if (!blueWon) rev.wins++
                        matchup.set(`${r}|${b}`, rev)
                    }
                }
            }
        }
    }

    const blueBase = totalMatches > 0 ? blueWins / totalMatches : 0.5
    const safeBlueBase = Number.isFinite(blueBase) ? Math.max(0, Math.min(1, blueBase)) : 0.5
    const lanePhase1Share = new Map<Lane, number>()
    for (const lane of ALL_LANES) {
        const n = laneN.get(lane) ?? 0
        const share = n > 0 ? (lanePhase1.get(lane) ?? 0) / n : 0.5
        lanePhase1Share.set(lane, Number.isFinite(share) ? Math.max(0, Math.min(1, share)) : 0.5)
    }
    return {
        totalMatches,
        banCount,
        pick,
        lanesByHero,
        pickTotal,
        blueBase: safeBlueBase,
        redBase: 1 - safeBlueBase,
        lanePhase1Share,
        pair,
        matchup,
    }
}

const createEmptyTally = (): Tally => ({
    totalMatches: 0,
    banCount: new Map(),
    pick: new Map(),
    lanesByHero: new Map(),
    pickTotal: new Map(),
    blueBase: 0.5,
    redBase: 0.5,
    lanePhase1Share: new Map(ALL_LANES.map((l) => [l, 0.5])),
    pair: new Map(),
    matchup: new Map(),
})

/** Tạo fingerprint ổn định từ dataset series để làm cache key (chống mất cache khi SWR re-parse). */
export const computeSeriesFingerprint = (series: Array<Series>): string => {
    if (!Array.isArray(series) || series.length === 0) return "empty"
    const count = series.length
    const first = series[0]
    const last = series[count - 1]
    const matchCount = series.reduce((acc, s) => acc + (s?.matches?.length ?? 0), 0)
    return `${count}:${matchCount}:${first?.id ?? ""}:${last?.id ?? ""}:${first?.played_at ?? ""}:${last?.played_at ?? ""}`
}

/** LRU Cache giới hạn dung lượng lưu trữ Tally objects. */
class BoundedTallyCache {
    private readonly cache = new Map<string, Tally>()
    private readonly maxSize: number

    constructor(maxSize = 50) {
        this.maxSize = maxSize
    }

    get(key: string): Tally | undefined {
        const val = this.cache.get(key)
        if (val) {
            // Đẩy key lên cuối cùng để duy trì thứ tự LRU
            this.cache.delete(key)
            this.cache.set(key, val)
        }
        return val
    }

    set(key: string, val: Tally): void {
        if (this.cache.has(key)) {
            this.cache.delete(key)
        } else if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value
            if (oldestKey !== undefined) {
                this.cache.delete(oldestKey)
            }
        }
        this.cache.set(key, val)
    }

    clear(): void {
        this.cache.clear()
    }

    get size(): number {
        return this.cache.size
    }
}

const tallyLruCache = new BoundedTallyCache(50)

export const clearTallyCache = (): void => {
    tallyLruCache.clear()
}

/**
 * Lấy Tally đã memoize theo dataset fingerprint ổn định (chống vỡ cache với SWR).
 * @param series - mảng series
 * @returns kết quả tally từ LRU cache hoặc tính mới
 */
export const getTally = (series: Array<Series>, scope = ""): Tally => {
    if (!Array.isArray(series) || series.length === 0) {
        return createEmptyTally()
    }
    // scope = bộ lọc (patch|tournament) để tally của 2 bộ lọc khác nhau
    // không đụng nhau khi fingerprint trùng
    const key = `${scope}|${computeSeriesFingerprint(series)}`
    const cached = tallyLruCache.get(key)
    if (cached) return cached

    const computed = tally(series)
    tallyLruCache.set(key, computed)
    return computed
}

/** Gợi ý cho lượt CẤM: tướng ban-rate cao + flex nhiều lane (khó đoán bài). */
const suggestBans = (
    t: Tally,
    ctx: AssistContext,
    heroById: Map<string, HeroManifest>,
): Array<Suggestion> => {
    const candidates = new Set<string>([...t.banCount.keys(), ...t.pickTotal.keys()])

    // Chỉ boost deny ở phase cấm trễ (mình đã lộ ≥2 pick) — ban đầu vẫn theo meta.
    const lateBanPhase = ctx.alliesPicked.length >= 2

    const scored = [...candidates]
        .filter((id) => !ctx.used.has(id))
        .map((id) => {
            const bans = t.banCount.get(id) ?? 0
            const picks = t.pickTotal.get(id) ?? 0
            const lanes = t.lanesByHero.get(id)?.size ?? 0
            const banRate = t.totalMatches > 0 ? bans / t.totalMatches : 0
            const presence = t.totalMatches > 0 ? (bans + picks) / t.totalMatches : 0

            // Deny: WR của candidate khi gặp từng tướng mình đã lộ — địch có thể
            // pick nó để counter ta nên cấm đi. Chỉ cell đủ mẫu mới tính.
            let denySum = 0
            let denyN = 0
            let bestDeny: { name: string; w: number; n: number } | null = null
            if (lateBanPhase) {
                for (const a of ctx.alliesPicked) {
                    const cell = t.matchup.get(`${id}|${a.heroId}`)
                    if (!cell || cell.n < MIN_PAIR_SAMPLE) continue
                    denySum += cell.wins / cell.n
                    denyN++
                    if (!bestDeny || cell.wins * bestDeny.n > bestDeny.w * cell.n) {
                        bestDeny = { name: heroById.get(a.heroId)?.name ?? a.heroId, w: cell.wins, n: cell.n }
                    }
                }
            }
            // Lệch 0.5 × hệ số 0.3 → tối đa ±0.15, không át ban-rate nền.
            const denyBoost = denyN > 0 ? (denySum / denyN - 0.5) * 0.3 : 0

            const safeBanRate = Number.isFinite(banRate) ? banRate : 0
            const rawScore = safeBanRate + denyBoost
            return {
                id,
                bans,
                picks,
                lanes,
                banRate: safeBanRate,
                presence: Number.isFinite(presence) ? presence : 0,
                bestDeny,
                score: Number.isFinite(rawScore) ? rawScore : 0,
            }
        })
        .sort((a, b) => b.score - a.score || b.presence - a.presence)
        .slice(0, MAX_SUGGESTIONS)

    return scored.map((c) => {
        const hero = heroById.get(c.id)
        const flex = c.lanes >= 2 ? ` · flex ${c.lanes} lane (khó đoán bài)` : ""
        const counter = c.bestDeny ? ` · counter ${c.bestDeny.name} ${c.bestDeny.w}/${c.bestDeny.n}` : ""
        const reason =
            c.bans > 0
                ? `Ban-rate ${(c.banRate * 100).toFixed(0)}%${flex}${counter}`
                : `Hay xuất hiện ${(c.presence * 100).toFixed(0)}%${flex}${counter}`
        return {
            heroId: c.id,
            heroName: hero?.name ?? c.id,
            heroFile: hero?.file ?? null,
            reason,
            n: c.bans + c.picks,
        }
    })
}

/** Mẫu tối thiểu để dùng thống kê cặp (dưới mức này bỏ qua, tránh nhiễu). */
const MIN_PAIR_SAMPLE = 5

/** Gợi ý cho lượt CHỌN: WR cao theo lane còn thiếu + ghi chú counter khi địch đã lộ bài. */
const suggestPicks = (
    t: Tally,
    ctx: AssistContext,
    heroById: Map<string, HeroManifest>,
): Array<Suggestion> => {
    const lanes = ctx.lanesNeeded.length > 0 ? ctx.lanesNeeded : ALL_LANES
    const enemyByLane = new Map<Lane, string>()
    for (const e of ctx.enemyRevealed) enemyByLane.set(e.lane, e.heroId)

    const isLastPick = ctx.lanesNeeded.length <= 1
    const earlyExposed = ctx.lanesNeeded.length >= 3 && ctx.enemyRevealed.length <= 1
    const myPhase1 = ctx.lanesNeeded.length >= 3

    const rows: Array<{ suggestion: Suggestion; score: number }> = []
    for (const [key, cell] of t.pick) {
        const sep = key.indexOf("|")
        const heroId = key.slice(0, sep)
        const lane = key.slice(sep + 1) as Lane
        if (ctx.used.has(heroId)) continue
        if (!lanes.includes(lane)) continue

        const wr = cell.n > 0 ? clamp01(cell.wins / cell.n) : 0
        const expWins = cell.redN * (Number.isFinite(t.redBase) ? t.redBase : 0.5) + (cell.n - cell.redN) * (Number.isFinite(t.blueBase) ? t.blueBase : 0.5)
        const adjRate = cell.n > 0 ? clamp01((cell.wins - expWins + 0.5 * cell.n) / cell.n) : 0.5
        const hero = heroById.get(heroId)
        const enemy = enemyByLane.get(lane)
        const flexLanes = t.lanesByHero.get(heroId)?.size ?? 0
        const isFlex = flexLanes >= 2

        const laneNote = enemy
            ? ` · cần đối ${LANE_LABELS[lane] ?? lane} (địch đã có ${heroById.get(enemy)?.name ?? enemy})`
            : ""
        const lowSample = cell.n < 5 ? " · mẫu ít" : ""
        const flexNote = earlyExposed && isFlex ? ` · flex ${flexLanes} lane (khó bắt bài)` : ""

        // Synergy: WR của các cặp (candidate, đồng đội đã pick) — mẫu đủ mới tính.
        let synergySum = 0
        let synergyN = 0
        let bestSynergy: { name: string; w: number; n: number } | null = null
        for (const a of ctx.alliesPicked) {
            const c = t.pair.get([heroId, a.heroId].sort().join("+"))
            if (!c || c.n < MIN_PAIR_SAMPLE) continue
            synergySum += c.wins / c.n
            synergyN++
            if (!bestSynergy || c.wins * bestSynergy.n > bestSynergy.w * c.n) {
                bestSynergy = { name: heroById.get(a.heroId)?.name ?? a.heroId, w: c.wins, n: c.n }
            }
        }
        // Matchup: WR của candidate khi gặp từng tướng địch đã lộ.
        let matchupSum = 0
        let matchupN = 0
        let bestMatchup: { name: string; w: number; n: number } | null = null
        for (const e of ctx.enemyRevealed) {
            const c = t.matchup.get(`${heroId}|${e.heroId}`)
            if (!c || c.n < MIN_PAIR_SAMPLE) continue
            matchupSum += c.wins / c.n
            matchupN++
            if (!bestMatchup || c.wins * bestMatchup.n > bestMatchup.w * c.n) {
                bestMatchup = { name: heroById.get(e.heroId)?.name ?? e.heroId, w: c.wins, n: c.n }
            }
        }
        const synergyNote = bestSynergy ? ` · cùng ${bestSynergy.name} ${bestSynergy.w}/${bestSynergy.n}` : ""
        const matchupNote = bestMatchup ? ` · thắng kèo ${bestMatchup.name} ${bestMatchup.w}/${bestMatchup.n}` : ""

        const counterBoost = enemy ? (isLastPick ? 0.05 : 0.02) : 0
        const flexBoost = earlyExposed && isFlex ? 0.04 : 0
        const laneShare = t.lanePhase1Share.get(lane) ?? 0.5
        const laneBoost = (myPhase1 ? 1 : -1) * (laneShare - 0.5) * 0.4
        // Cặp: lệch 0.5 × hệ số 0.4 → tối đa ±0.2, không át WR nền của tướng.
        const synergyBoost = synergyN > 0 ? (synergySum / synergyN - 0.5) * 0.4 : 0
        const matchupBoost = matchupN > 0 ? (matchupSum / matchupN - 0.5) * 0.4 : 0

        const rawScore =
            wilsonLower(adjRate * cell.n, cell.n) +
            counterBoost +
            flexBoost +
            laneBoost +
            synergyBoost +
            matchupBoost
        const score = Number.isFinite(rawScore) ? rawScore : 0

        rows.push({
            suggestion: {
                heroId,
                heroName: hero?.name ?? heroId,
                heroFile: hero?.file ?? null,
                reason: `WR ${LANE_LABELS[lane] ?? lane} ${(wr * 100).toFixed(0)}% (n=${cell.n})${lowSample}${flexNote}${laneNote}${synergyNote}${matchupNote}`,
                n: cell.n,
                winRate: wr,
                lane,
            },
            score,
        })
    }

    return rows
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_SUGGESTIONS)
        .map((r) => r.suggestion)
}

/**
 * Gợi ý cấm/chọn cho lượt hiện tại dựa trên thống kê đã có.
 * @param ctx - ngữ cảnh lượt hiện tại (bên, hành động, bàn cờ)
 * @param series - mọi series đã load
 * @param heroes - catalog tướng (tên/ảnh)
 * @returns danh sách gợi ý đã xếp hạng (tối đa 6)
 */
export const suggestStep = (
    ctx: AssistContext,
    series: Array<Series>,
    heroes: Array<HeroManifest>,
    scope = "",
): Array<Suggestion> => {
    if (!series || series.length === 0) return []
    const t = getTally(series, scope)
    if (t.totalMatches === 0) return []
    const heroById = new Map((heroes || []).map((h) => [h.slug, h]))
    return ctx.action === "ban"
        ? suggestBans(t, ctx, heroById)
        : suggestPicks(t, ctx, heroById)
}

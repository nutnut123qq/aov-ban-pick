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

/** Kẹp về [0, 1] — WR khử nhiễu phe có thể tràn nhẹ ra ngoài do tái tâm. */
const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x)

/**
 * Cận dưới khoảng tin cậy Wilson 95% cho tỉ lệ thắng — dùng để XẾP HẠNG.
 * Kéo mẫu nhỏ về thấp (1 thắng/1 trận không còn = 100%), nên không bị ăn may đè mẫu lớn.
 * WR hiển thị vẫn là WR thô; chỉ điểm sắp xếp dùng giá trị này.
 */
const wilsonLower = (wins: number, n: number): number => {
    if (n <= 0) return 0
    const z = 1.96
    const z2 = z * z
    const phat = wins / n
    const denom = 1 + z2 / n
    const center = phat + z2 / (2 * n)
    const margin = z * Math.sqrt((phat * (1 - phat) + z2 / (4 * n)) / n)
    return (center - margin) / denom
}

interface PickCell {
    n: number
    wins: number
    /** Số lần pick này nằm ở bên đỏ (để khử nhiễu lợi thế phe khi xếp hạng). */
    redN: number
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
    /** Tỉ lệ thắng nền của bên xanh (first pick) — base rate để khử nhiễu phe. */
    blueBase: number
    /** Tỉ lệ thắng nền của bên đỏ (last pick). APL 2026: đỏ ~59% nên WR thô lệch. */
    redBase: number
    /**
     * key = lane → tỉ lệ lane đó được pick trong phase 1 (pick_index ≤ 6).
     * Học quy ước thứ tự lane từ data: HT/AD/Giữa pick sớm (~0.7+), Tà thần để muộn (~0.35).
     */
    lanePhase1Share: Map<Lane, number>
}

/** Pick thuộc phase 1 (lượt chọn đầu) khi pick_index nằm trong 1..6. */
const PHASE1_MAX_PICK = 6

/** Quét toàn bộ series một lượt, dựng các bảng đếm cho engine gợi ý. */
const tally = (series: Array<Series>): Tally => {
    const banCount = new Map<string, number>()
    const pick = new Map<string, PickCell>()
    const lanesByHero = new Map<string, Set<Lane>>()
    const pickTotal = new Map<string, number>()
    const laneN = new Map<Lane, number>()
    const lanePhase1 = new Map<Lane, number>()
    let totalMatches = 0
    let blueWins = 0

    for (const s of series) {
        for (const m of s.matches) {
            totalMatches++
            if (m.winner_team_id === m.team_blue_id) blueWins++
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
            }
        }
    }

    const blueBase = totalMatches > 0 ? blueWins / totalMatches : 0.5
    const lanePhase1Share = new Map<Lane, number>()
    for (const lane of ALL_LANES) {
        const n = laneN.get(lane) ?? 0
        lanePhase1Share.set(lane, n > 0 ? (lanePhase1.get(lane) ?? 0) / n : 0.5)
    }
    return {
        totalMatches,
        banCount,
        pick,
        lanesByHero,
        pickTotal,
        blueBase,
        redBase: 1 - blueBase,
        lanePhase1Share,
    }
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
        // Ưu tiên BAN-RATE (sở thích cấm thật của pro), rồi độ hiện diện.
        // Presence-first cũ kéo nhầm tướng-pick mạnh (vd Flowborn pick=20) lên đầu
        // và chôn permaban thật (vd Florentino pick=0, ban=19). Xem data APL 2026.
        .sort((a, b) => b.banRate - a.banRate || b.presence - a.presence)
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

    // Vị trí trong lượt pick của mình: lanesNeeded.length = số pick còn lại (kể cả lượt này).
    // Pick cuối → ưu tiên counter lane địch đã lộ. Còn nhiều pick + địch lộ ít → ưu tiên
    // tướng flex (lane mơ hồ, khó bị bắt bài ngược). Thuần lý thuyết draft, không cần thêm data.
    const isLastPick = ctx.lanesNeeded.length <= 1
    const earlyExposed = ctx.lanesNeeded.length >= 3 && ctx.enemyRevealed.length <= 1
    // Phase 1 của mình = vẫn còn ≥3 pick (2 pick cuối là phase 2). Dùng để xếp đúng
    // thứ tự lane như pro: phase 1 ưu tiên HT/AD/Giữa, để Tà thần cho phase 2.
    const myPhase1 = ctx.lanesNeeded.length >= 3

    const rows: Array<{ suggestion: Suggestion; score: number }> = []
    for (const [key, cell] of t.pick) {
        const sep = key.indexOf("|")
        const heroId = key.slice(0, sep)
        const lane = key.slice(sep + 1) as Lane
        if (ctx.used.has(heroId)) continue
        if (!lanes.includes(lane)) continue

        const wr = cell.n > 0 ? cell.wins / cell.n : 0
        // WR khử nhiễu phe: trừ base rate của bên đã pick lịch sử rồi tái tâm về 0.5.
        // Đỏ ~59% nên staple bên đỏ bị hạ, hero bên xanh thắng được lại được nâng.
        const expWins = cell.redN * t.redBase + (cell.n - cell.redN) * t.blueBase
        const adjRate = clamp01((cell.wins - expWins + 0.5 * cell.n) / cell.n)
        const hero = heroById.get(heroId)
        const enemy = enemyByLane.get(lane)
        const flexLanes = t.lanesByHero.get(heroId)?.size ?? 0
        const isFlex = flexLanes >= 2
        // Note trung thực: ta CHƯA tính head-to-head, chỉ biết lane này cần đối bài.
        const laneNote = enemy
            ? ` · cần đối ${LANE_LABELS[lane]} (địch đã có ${heroById.get(enemy)?.name ?? enemy})`
            : ""
        // Mẫu nhỏ là chuẩn ở giải đấu (median n=3) — cảnh báo để không tin mù WR.
        const lowSample = cell.n < 5 ? " · mẫu ít" : ""
        const flexNote = earlyExposed && isFlex ? ` · flex ${flexLanes} lane (khó bắt bài)` : ""

        // Nudge counter ở pick cuối (lúc đó mới chốt được đối lane). Giữ NHỎ vì data
        // APL 2026 cho thấy is_counter_pick chỉ +2% WR — counter gần như không lợi thế.
        const counterBoost = enemy ? (isLastPick ? 0.05 : 0.02) : 0
        // Ưu tiên flex khi mình lộ bài sớm — tránh bị hard-counter ở các lượt sau.
        const flexBoost = earlyExposed && isFlex ? 0.04 : 0
        // Thứ tự lane theo phase (học từ data): lane hợp phase được cộng, lệch phase bị trừ.
        // Vd Tà thần (phase1Share ~0.35) bị dìm ở phase 1, được nâng ở phase 2.
        // Hệ số 0.4 hiệu chỉnh trên data APL 2026: nhỏ nhất ép đúng thứ tự lane như pro
        // (phase1 = HT/AD/Giữa, phase2 = Tà thần/Rừng), ổn định tới 0.7 nên không overfit.
        const laneShare = t.lanePhase1Share.get(lane) ?? 0.5
        const laneBoost = (myPhase1 ? 1 : -1) * (laneShare - 0.5) * 0.4

        rows.push({
            suggestion: {
                heroId,
                heroName: hero?.name ?? heroId,
                heroFile: hero?.file ?? null,
                reason: `WR ${LANE_LABELS[lane]} ${(wr * 100).toFixed(0)}% (n=${cell.n})${lowSample}${flexNote}${laneNote}`,
                n: cell.n,
                winRate: wr,
                lane,
            },
            // Xếp hạng theo Wilson trên WR ĐÃ KHỬ NHIỄU PHE (mẫu nhỏ không ăn may lên top),
            // cộng nudge counter/flex/thứ-tự-lane theo vị trí lượt — không đè bẹp WR.
            score: wilsonLower(adjRate * cell.n, cell.n) + counterBoost + flexBoost + laneBoost,
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

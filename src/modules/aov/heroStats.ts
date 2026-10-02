import type { DraftAction, Lane, Series, TeamSide } from "@/modules/types"

/** Thống kê của một tướng theo lane. */
export interface HeroLaneStat {
    lane: Lane
    picks: number
    wins: number
}

/** Một cặp liên quan tới tướng (đồng đội hoặc đối thủ). */
export interface HeroPairStat {
    /** hero_id của tướng liên quan. */
    heroId: string
    /** Số ván hai tướng đứng cùng/đối nhau. */
    n: number
    /**
     * Số ván thắng tính theo góc nhìn hero chủ:
     * đồng đội = số ván thắng khi đi cùng, kèo = số ván hero chủ thắng đối thủ.
     */
    wins: number
}

/** Một ván mà tướng được pick — dùng cho danh sách trận gần nhất. */
export interface HeroGameRef {
    seriesId: string
    vanNumber: number
    tournamentName: string
    playedAt: string
    teamSide: TeamSide
    won: boolean
    vodUrl?: string
    /** team_id đối thủ trong ván đó. */
    opponentTeamId: string
}

/** Thống kê của tướng trong một giải — dùng cho bảng trend theo mùa. */
export interface HeroSeasonStat {
    tournamentName: string
    picks: number
    wins: number
    bans: number
}

/** Hồ sơ đầy đủ của một tướng, đủ để render trang /heroes/[slug]. */
export interface HeroDetail {
    slug: string
    picks: number
    bans: number
    wins: number
    /** WR/picks theo từng lane (chỉ lane có picks > 0). */
    byLane: Array<HeroLaneStat>
    /** Chia theo giải — cột trend. */
    byTournament: Array<HeroSeasonStat>
    /** Đồng đội thắng cùng nhiều nhất (n >= 5, sort WR desc). */
    teammates: Array<HeroPairStat>
    /** Tướng mà hero này thắng kèo (n >= 5, sort WR desc). */
    beats: Array<HeroPairStat>
    /** Tướng khắc chế hero này (n >= 5, sort WR của đối thủ desc). */
    losesTo: Array<HeroPairStat>
    /** Các ván gần nhất có pick tướng này, mới nhất trước. */
    games: Array<HeroGameRef>
}

/** Bộ đếm gộp cho một cặp tướng. */
interface PairAgg {
    /** Số lần gặp/đi cùng. */
    n: number
    /** Số ván thắng theo góc nhìn hero chủ. */
    wins: number
}

/** Số ván tối thiểu để một cặp lên bảng — dưới mức này quá nhiễu. */
const MIN_PAIR_GAMES = 5

/** Số trận gần nhất tối đa liệt kê trong mục games. */
const MAX_RECENT_GAMES = 30

/** Thứ tự lane cố định khi render bảng byLane. */
const LANE_ORDER: Record<Lane, number> = {
    ta_than: 0,
    rung: 1,
    giua: 2,
    rong_xa: 3,
    rong_ho_tro: 4,
}

/** Pick hợp lệ phải có lane đã gán (ban và pick chưa gán lane bị loại). */
const isLanePick = (a: DraftAction): boolean =>
    a.action_type === "pick" && a.lane_position !== null

/** Cộng dồn một quan sát vào map cặp. */
const bump = (map: Map<string, PairAgg>, key: string, win: boolean): void => {
    const cur = map.get(key) ?? { n: 0, wins: 0 }
    cur.n += 1
    if (win) cur.wins += 1
    map.set(key, cur)
}

/** Chuyển map cặp thành list, bỏ các cặp dưới mẫu tối thiểu. */
const toPairList = (map: Map<string, PairAgg>): Array<HeroPairStat> =>
    [...map.entries()]
        .filter(([, c]) => c.n >= MIN_PAIR_GAMES)
        .map(([heroId, c]) => ({ heroId, n: c.n, wins: c.wins }))

/** WR của hero chủ trong cặp. */
const wr = (p: HeroPairStat): number => (p.n === 0 ? 0 : p.wins / p.n)

/** Sort WR desc, hoà thì nhiều ván trước, rồi heroId asc cho ổn định. */
const byWrDesc = (x: HeroPairStat, y: HeroPairStat): number =>
    wr(y) - wr(x) || y.n - x.n || x.heroId.localeCompare(y.heroId)

/**
 * Tổng hợp hồ sơ một tướng từ toàn bộ series.
 * @returns null nếu slug không xuất hiện trong dữ liệu.
 */
export const getHeroDetail = (
    series: Array<Series>,
    slug: string,
): HeroDetail | null => {
    let picks = 0
    let bans = 0
    let wins = 0
    const laneMap = new Map<Lane, HeroLaneStat>()
    const tourMap = new Map<string, HeroSeasonStat>()
    const teammateMap = new Map<string, PairAgg>()
    const opponentMap = new Map<string, PairAgg>()
    const games: Array<HeroGameRef> = []

    for (const s of series) {
        for (const m of s.matches) {
            const heroPicks = m.draft_actions.filter(
                (a) => isLanePick(a) && a.hero_id === slug,
            )
            const heroBans = m.draft_actions.filter(
                (a) => a.action_type === "ban" && a.hero_id === slug,
            )
            if (heroPicks.length === 0 && heroBans.length === 0) continue

            let tour = tourMap.get(s.tournament_name)
            if (!tour) {
                tour = { tournamentName: s.tournament_name, picks: 0, wins: 0, bans: 0 }
                tourMap.set(s.tournament_name, tour)
            }
            tour.bans += heroBans.length
            bans += heroBans.length

            const matchPicks = m.draft_actions.filter(isLanePick)
            for (const a of heroPicks) {
                if (a.lane_position === null) continue
                const heroTeamId =
                    a.team_side === "blue" ? m.team_blue_id : m.team_red_id
                const opponentTeamId =
                    a.team_side === "blue" ? m.team_red_id : m.team_blue_id
                const won = m.winner_team_id === heroTeamId

                picks += 1
                tour.picks += 1
                if (won) {
                    wins += 1
                    tour.wins += 1
                }

                let ls = laneMap.get(a.lane_position)
                if (!ls) {
                    ls = { lane: a.lane_position, picks: 0, wins: 0 }
                    laneMap.set(a.lane_position, ls)
                }
                ls.picks += 1
                if (won) ls.wins += 1

                // Cặp đồng đội/đối thủ trong cùng ván; ván blind pick có thể
                // có hero trùng ở cả 2 bên → bỏ qua chính hero.
                for (const o of matchPicks) {
                    if (o.hero_id === slug) continue
                    bump(
                        o.team_side === a.team_side ? teammateMap : opponentMap,
                        o.hero_id,
                        won,
                    )
                }

                games.push({
                    seriesId: s.id,
                    vanNumber: m.van_number,
                    tournamentName: s.tournament_name,
                    playedAt: s.played_at,
                    teamSide: a.team_side,
                    won,
                    vodUrl: m.vod_url,
                    opponentTeamId,
                })
            }
        }
    }

    if (picks === 0) return null

    const teammates = toPairList(teammateMap).sort(byWrDesc)
    const opponents = toPairList(opponentMap)
    // Kèo thắng: WR hero chủ > 50%; kèo thua: WR đối thủ > 50%
    // (tức WR hero chủ < 50%) — hai list tách rời, không trùng nhau.
    const beats = opponents.filter((p) => p.wins * 2 > p.n).sort(byWrDesc)
    const losesTo = opponents
        .filter((p) => p.wins * 2 < p.n)
        .sort((x, y) => wr(x) - wr(y) || y.n - x.n || x.heroId.localeCompare(y.heroId))

    games.sort(
        (x, y) => new Date(y.playedAt).getTime() - new Date(x.playedAt).getTime(),
    )

    return {
        slug,
        picks,
        bans,
        wins,
        byLane: [...laneMap.values()].sort(
            (x, y) => LANE_ORDER[x.lane] - LANE_ORDER[y.lane],
        ),
        byTournament: [...tourMap.values()],
        teammates,
        beats,
        losesTo,
        games: games.slice(0, MAX_RECENT_GAMES),
    }
}

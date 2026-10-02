import type { Series, TeamSide } from "@/modules/types"

/** Một tướng trong pool của đội. */
export interface TeamHeroStat {
    heroId: string
    picks: number
    wins: number
    /** Số lần đội này tự cấm tướng đó. */
    bansByTeam: number
    /** Số lần đội này bị đối thủ cấm tướng đó. */
    bansAgainst: number
}

/** Combo 2 tướng đội này hay dùng cùng. */
export interface TeamComboStat {
    a: string
    b: string
    n: number
    wins: number
}

/** Thành tích của đội trong một giải. */
export interface TeamSeasonStat {
    tournamentName: string
    seriesWon: number
    seriesLost: number
    gameWon: number
    gameLost: number
}

/** Đối đầu trực tiếp với một đội khác (theo series). */
export interface TeamOppStat {
    teamId: string
    won: number
    lost: number
}

/** Hồ sơ đầy đủ của một đội, đủ để render trang /teams/[id]. */
export interface TeamDetail {
    teamId: string
    seriesPlayed: number
    seriesWon: number
    gameWon: number
    gameLost: number
    heroPool: Array<TeamHeroStat>
    combos: Array<TeamComboStat>
    seasons: Array<TeamSeasonStat>
    opponents: Array<TeamOppStat>
    /** Các series gần nhất, mới nhất trước. */
    recent: Array<Series>
}

/** Số series gần nhất đưa vào `recent`. */
const RECENT_CAP = 10

/** Số combo tối đa trả về. */
const COMBO_CAP = 15

/** Cỡ mẫu tối thiểu để một cặp pick lên bảng combo. */
const COMBO_MIN_GAMES = 3

/**
 * Tổng hợp hồ sơ một đội từ toàn bộ series.
 * Dùng `team_blue_id`/`team_red_id` **của từng match** (đội đổi bên theo ván)
 * để quy pick/ban về đúng đội — không dùng bên ở cấp series.
 * @returns null nếu teamId không xuất hiện trong dữ liệu.
 */
export const getTeamDetail = (
    series: Array<Series>,
    teamId: string,
): TeamDetail | null => {
    const mine = series.filter(
        (s) => s.team_blue_id === teamId || s.team_red_id === teamId,
    )
    if (mine.length === 0) return null

    let seriesWon = 0
    let gameWon = 0
    let gameLost = 0

    const heroAcc = new Map<string, TeamHeroStat>()
    const comboAcc = new Map<string, TeamComboStat>()
    const seasonAcc = new Map<string, TeamSeasonStat>()
    const oppAcc = new Map<string, TeamOppStat>()

    const heroRow = (heroId: string): TeamHeroStat => {
        let r = heroAcc.get(heroId)
        if (!r) {
            r = { heroId, picks: 0, wins: 0, bansByTeam: 0, bansAgainst: 0 }
            heroAcc.set(heroId, r)
        }
        return r
    }

    for (const s of mine) {
        const wonSeries = s.winner_team_id === teamId
        if (wonSeries) seriesWon++

        const oppId = s.team_blue_id === teamId ? s.team_red_id : s.team_blue_id
        const opp = oppAcc.get(oppId) ?? { teamId: oppId, won: 0, lost: 0 }
        if (wonSeries) opp.won++
        else opp.lost++
        oppAcc.set(oppId, opp)

        const season = seasonAcc.get(s.tournament_name) ?? {
            tournamentName: s.tournament_name,
            seriesWon: 0,
            seriesLost: 0,
            gameWon: 0,
            gameLost: 0,
        }
        if (wonSeries) season.seriesWon++
        else season.seriesLost++
        seasonAcc.set(s.tournament_name, season)

        for (const m of s.matches) {
            // Bên của đội trong ván này — đổi theo ván, bỏ qua nếu dữ liệu lệch
            const mySide: TeamSide | null =
                m.team_blue_id === teamId
                    ? "blue"
                    : m.team_red_id === teamId
                      ? "red"
                      : null
            if (!mySide) continue

            const wonGame = m.winner_team_id === teamId
            if (wonGame) {
                gameWon++
                season.gameWon++
            } else {
                gameLost++
                season.gameLost++
            }

            const picks: Array<string> = []
            for (const a of m.draft_actions) {
                if (a.action_type === "pick") {
                    if (a.team_side !== mySide) continue
                    const row = heroRow(a.hero_id)
                    row.picks++
                    if (wonGame) row.wins++
                    picks.push(a.hero_id)
                } else {
                    // ban: đội cấm → bansByTeam; phe kia cấm → bansAgainst
                    const row = heroRow(a.hero_id)
                    if (a.team_side === mySide) row.bansByTeam++
                    else row.bansAgainst++
                }
            }

            // Combo: mọi cặp pick cùng đội trong ván (khóa = cặp hero_id đã sort)
            const unique = [...new Set(picks)].sort()
            for (let i = 0; i < unique.length; i++) {
                for (let j = i + 1; j < unique.length; j++) {
                    const a = unique[i]
                    const b = unique[j]
                    const key = `${a}|${b}`
                    const c = comboAcc.get(key) ?? { a, b, n: 0, wins: 0 }
                    c.n++
                    if (wonGame) c.wins++
                    comboAcc.set(key, c)
                }
            }
        }
    }

    const heroPool = [...heroAcc.values()].sort(
        (a, b) => b.picks - a.picks || b.wins - a.wins || a.heroId.localeCompare(b.heroId),
    )

    const combos = [...comboAcc.values()]
        .filter((c) => c.n >= COMBO_MIN_GAMES)
        .sort((a, b) => b.wins - a.wins || b.n - a.n || a.a.localeCompare(b.a) || a.b.localeCompare(b.b))
        .slice(0, COMBO_CAP)

    const seasons = [...seasonAcc.values()].sort(
        (a, b) =>
            b.seriesWon + b.seriesLost - (a.seriesWon + a.seriesLost) ||
            a.tournamentName.localeCompare(b.tournamentName),
    )

    const opponents = [...oppAcc.values()].sort(
        (a, b) => b.won + b.lost - (a.won + a.lost) || b.won - a.won || a.teamId.localeCompare(b.teamId),
    )

    const recent = [...mine]
        .sort((a, b) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime())
        .slice(0, RECENT_CAP)

    return {
        teamId,
        seriesPlayed: mine.length,
        seriesWon,
        gameWon,
        gameLost,
        heroPool,
        combos,
        seasons,
        opponents,
        recent,
    }
}

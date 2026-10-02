import { describe, expect, it } from "vitest"
import type { DraftAction, Lane, Match, Series, TeamSide } from "@/modules/types"
import { getHeroDetail } from "../heroStats"

const pick = (side: TeamSide, heroId: string, lane: Lane): DraftAction => ({
    turn_number: 0,
    pick_index: null,
    team_side: side,
    action_type: "pick",
    hero_id: heroId,
    lane_position: lane,
    player_id: null,
    is_counter_pick: false,
})

const ban = (side: TeamSide, heroId: string): DraftAction => ({
    turn_number: 0,
    pick_index: null,
    team_side: side,
    action_type: "ban",
    hero_id: heroId,
    lane_position: null,
    player_id: null,
    is_counter_pick: false,
})

const mkMatch = (
    van: number,
    winner: TeamSide,
    actions: Array<DraftAction>,
    vodUrl?: string,
): Match => ({
    van_number: van,
    team_blue_id: "AAA",
    team_red_id: "BBB",
    winner_team_id: winner === "blue" ? "AAA" : "BBB",
    is_blind_pick: false,
    vod_url: vodUrl,
    draft_actions: actions,
})

const mkSeries = (
    id: string,
    tournamentName: string,
    playedAt: string,
    matches: Array<Match>,
): Series => ({
    id,
    tournament_name: tournamentName,
    patch_id: "1.54",
    format: "BO7",
    team_blue_id: "AAA",
    team_red_id: "BBB",
    winner_team_id: "AAA",
    played_at: playedAt,
    matches,
})

/**
 * Series A (APL 2026, 2026-06-20): 7 ván.
 * - Ván 1-6: blue pick tulen(giua)+nakroth(rung)+airi(ta_than),
 *   red pick liliana(giua)+veres(ta_than)+yorn(rong_xa). Blue thắng ván 1-4.
 * - Ván 7: tulen bị ban, kèm 1 pick thiếu lane (phải bị bỏ qua).
 */
const seriesA = (): Series => {
    const matches: Array<Match> = []
    for (let van = 1; van <= 6; van += 1) {
        matches.push(
            mkMatch(
                van,
                van <= 4 ? "blue" : "red",
                [
                    pick("blue", "tulen", "giua"),
                    pick("blue", "nakroth", "rung"),
                    pick("blue", "airi", "ta_than"),
                    pick("red", "liliana", "giua"),
                    pick("red", "veres", "ta_than"),
                    pick("red", "yorn", "rong_xa"),
                ],
            ),
        )
    }
    matches.push(
        mkMatch(7, "blue", [
            ban("red", "tulen"),
            // Pick thiếu lane_position — không được tính vào picks/lanes/games
            { ...pick("blue", "tulen", "giua"), lane_position: null },
            pick("blue", "enzo", "rung"),
        ]),
    )
    return mkSeries("s_apl", "APL 2026", "2026-06-20", matches)
}

/**
 * Series B (AOG 2025, 2026-07-01): 5 ván, tulen đi rừng ở bên red.
 * Red chỉ thắng ván 1 (có VOD). Ván 1 có thêm đồng đội enzo (n=1 → bị lọc).
 */
const seriesB = (): Series => {
    const matches: Array<Match> = []
    for (let van = 1; van <= 5; van += 1) {
        const redPicks = [
            pick("red", "tulen", "rung"),
            pick("red", "helen", "rong_ho_tro"),
            ...(van === 1 ? [pick("red", "enzo", "giua")] : []),
        ]
        matches.push(
            mkMatch(
                van,
                van === 1 ? "red" : "blue",
                [
                    ...redPicks,
                    pick("blue", "keera", "giua"),
                    pick("blue", "dolia", "rong_ho_tro"),
                    pick("blue", "zip", "ta_than"),
                ],
                van === 1 ? "https://vod.example/b1" : undefined,
            ),
        )
    }
    return mkSeries("s_aog", "AOG 2025", "2026-07-01", matches)
}

const mockSeries = (): Array<Series> => [seriesA(), seriesB()]

describe("getHeroDetail", () => {
    it("trả null khi slug không có pick nào", () => {
        expect(getHeroDetail(mockSeries(), "khong_ton_tai")).toBeNull()
        expect(getHeroDetail([], "tulen")).toBeNull()
    })

    it("đếm picks/bans/wins đúng, bỏ pick thiếu lane", () => {
        const d = getHeroDetail(mockSeries(), "tulen")
        expect(d).not.toBeNull()
        expect(d!.slug).toBe("tulen")
        expect(d!.picks).toBe(11)
        expect(d!.bans).toBe(1)
        expect(d!.wins).toBe(5)
    })

    it("group byLane theo lane_position, đúng thứ tự lane", () => {
        const d = getHeroDetail(mockSeries(), "tulen")!
        expect(d.byLane.map((l) => l.lane)).toEqual(["rung", "giua"])
        const giua = d.byLane.find((l) => l.lane === "giua")!
        const rung = d.byLane.find((l) => l.lane === "rung")!
        expect(giua).toMatchObject({ picks: 6, wins: 4 })
        expect(rung).toMatchObject({ picks: 5, wins: 1 })
    })

    it("group byTournament giữ thứ tự xuất hiện", () => {
        const d = getHeroDetail(mockSeries(), "tulen")!
        expect(d.byTournament.map((t) => t.tournamentName)).toEqual([
            "APL 2026",
            "AOG 2025",
        ])
        expect(d.byTournament[0]).toMatchObject({ picks: 6, wins: 4, bans: 1 })
        expect(d.byTournament[1]).toMatchObject({ picks: 5, wins: 1, bans: 0 })
    })

    it("teammates đúng chiều, lọc cặp n<5", () => {
        const d = getHeroDetail(mockSeries(), "tulen")!
        const nakroth = d.teammates.find((p) => p.heroId === "nakroth")
        const helen = d.teammates.find((p) => p.heroId === "helen")
        expect(nakroth).toMatchObject({ n: 6, wins: 4 })
        expect(helen).toMatchObject({ n: 5, wins: 1 })
        // enzo chỉ đi cùng 1 ván → bị lọc
        expect(d.teammates.some((p) => p.heroId === "enzo")).toBe(false)
        // đối thủ không lẫn vào teammates
        expect(d.teammates.some((p) => p.heroId === "liliana")).toBe(false)
    })

    it("beats chứa đối thủ bị hero thắng kèo, losesTo chứa đối thủ khắc chế", () => {
        const d = getHeroDetail(mockSeries(), "tulen")!
        // liliana thua tulen 4/6 → nằm ở beats với wins = wins của tulen
        const liliana = d.beats.find((p) => p.heroId === "liliana")
        expect(liliana).toMatchObject({ n: 6, wins: 4 })
        // keera thắng tulen 4/5 → nằm ở losesTo
        const keera = d.losesTo.find((p) => p.heroId === "keera")
        expect(keera).toMatchObject({ n: 5, wins: 1 })
        // hai list tách rời
        expect(d.beats.some((p) => p.heroId === "keera")).toBe(false)
        expect(d.losesTo.some((p) => p.heroId === "liliana")).toBe(false)
        // losesTo sort theo WR đối thủ desc (WR hero chủ asc), hoà thì heroId asc
        expect(d.losesTo.map((p) => p.heroId)).toEqual(["dolia", "keera", "zip"])
    })

    it("games: 1 ref mỗi match có pick, sort played_at desc, kèm vod/side/opponent", () => {
        const d = getHeroDetail(mockSeries(), "tulen")!
        // 11 pick hợp lệ → 11 ref; ván chỉ ban + ván pick thiếu lane không tạo ref
        expect(d.games).toHaveLength(11)
        // series B mới hơn → 5 ván AOG đứng đầu
        expect(d.games.slice(0, 5).every((g) => g.tournamentName === "AOG 2025")).toBe(true)
        expect(d.games[0]).toMatchObject({
            seriesId: "s_aog",
            vanNumber: 1,
            teamSide: "red",
            won: true,
            opponentTeamId: "AAA",
            vodUrl: "https://vod.example/b1",
        })
        // games APL: tulen bên blue, đối thủ BBB, thắng 4 ván đầu
        const aplGames = d.games.filter((g) => g.seriesId === "s_apl")
        expect(aplGames.every((g) => g.teamSide === "blue" && g.opponentTeamId === "BBB")).toBe(true)
        expect(aplGames.filter((g) => g.won)).toHaveLength(4)
    })
})

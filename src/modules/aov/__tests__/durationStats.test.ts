import { describe, expect, it } from "vitest"
import type { DraftAction, Match, Series, TeamSide } from "@/modules/types"
import { getDurationStats, MIN_SAMPLE } from "../durationStats"

const pickAction = (idx: number, side: TeamSide, heroId: string): DraftAction => ({
    turn_number: idx,
    pick_index: idx,
    team_side: side,
    action_type: "pick",
    hero_id: heroId,
    lane_position: "giua",
    player_id: null,
    is_counter_pick: false,
})

const mkMatch = (
    van: number,
    duration: number | undefined,
    blueWon: boolean,
    blueHero: string,
    redHero: string,
): Match => ({
    van_number: van,
    team_blue_id: "A",
    team_red_id: "B",
    winner_team_id: blueWon ? "A" : "B",
    duration_seconds: duration,
    is_blind_pick: false,
    draft_actions: [pickAction(1, "blue", blueHero), pickAction(2, "red", redHero)],
})

const mkSeries = (matches: Array<Match>): Array<Series> => [
    {
        id: "s-dur",
        tournament_name: "Dur Cup",
        patch_id: "1.55",
        format: "BO7",
        team_blue_id: "A",
        team_red_id: "B",
        winner_team_id: "A",
        played_at: "2026-01-01",
        matches,
    },
]

describe("getDurationStats", () => {
    it("returns empty stats for empty or non-array input", () => {
        expect(getDurationStats([])).toEqual({
            metaAvgSec: 0,
            gamesWithDuration: 0,
            hero: [],
            team: [],
        })
    })

    it("skips matches with missing or non-positive duration", () => {
        const series = mkSeries([
            mkMatch(1, undefined, true, "hA", "hB"),
            mkMatch(2, 0, true, "hA", "hB"),
            mkMatch(3, -50, false, "hA", "hB"),
            mkMatch(4, 600, true, "hA", "hB"),
        ])
        const res = getDurationStats(series)

        expect(res.gamesWithDuration).toBe(1)
        expect(res.metaAvgSec).toBe(600)
        const teamA = res.team.find((r) => r.id === "A")
        expect(teamA?.winN).toBe(1)
        // Chưa đủ MIN_SAMPLE → vẫn null
        expect(teamA?.avgWinSec).toBeNull()
    })

    it("returns null avgWinSec when win samples are below MIN_SAMPLE", () => {
        const series = mkSeries(
            [1, 2, 3, 4].map((i) => mkMatch(i, 600 + i * 10, true, "hA", "hB")),
        )
        const res = getDurationStats(series)

        expect(res.gamesWithDuration).toBe(4)
        expect(res.metaAvgSec).toBeCloseTo(625)
        const hA = res.hero.find((r) => r.id === "hA")
        expect(hA?.winN).toBe(4)
        expect(hA?.avgWinSec).toBeNull()
        const hB = res.hero.find((r) => r.id === "hB")
        expect(hB?.loseN).toBe(4)
        expect(hB?.avgLoseSec).toBeNull()
    })

    it("averages win and lose durations once samples reach MIN_SAMPLE", () => {
        // A thắng 5 ván duration 600..1000 (TB 800); B thua 5 ván → avgLoseSec = 800
        const series = mkSeries(
            [600, 700, 800, 900, 1000].map((d, i) => mkMatch(i + 1, d, true, "hA", "hB")),
        )
        const res = getDurationStats(series)

        expect(res.metaAvgSec).toBe(800)
        const teamA = res.team.find((r) => r.id === "A")
        expect(teamA?.winN).toBe(MIN_SAMPLE)
        expect(teamA?.avgWinSec).toBe(800)
        const teamB = res.team.find((r) => r.id === "B")
        expect(teamB?.loseN).toBe(MIN_SAMPLE)
        expect(teamB?.avgLoseSec).toBe(800)
        expect(teamB?.avgWinSec).toBeNull()

        const hA = res.hero.find((r) => r.id === "hA")
        expect(hA?.avgWinSec).toBe(800)
        const hB = res.hero.find((r) => r.id === "hB")
        expect(hB?.avgLoseSec).toBe(800)
        expect(hB?.winN).toBe(0)
    })

    it("sorts rows by avgWinSec ascending, null last, tie-break by id", () => {
        // 5 ván A thắng (fastHero) duration 500 + 5 ván B thắng (slowHero) duration 900.
        // loserHero/loser2 chỉ có mẫu thua → avgWinSec null, xếp cuối theo id.
        const series = mkSeries([
            ...[1, 2, 3, 4, 5].map((i) => mkMatch(i, 500, true, "fastHero", "loserHero")),
            ...[6, 7, 8, 9, 10].map((i) => mkMatch(i, 900, false, "loser2", "slowHero")),
        ])
        const res = getDurationStats(series)

        expect(res.hero.map((r) => r.id)).toEqual([
            "fastHero",
            "slowHero",
            "loser2",
            "loserHero",
        ])
        expect(res.team.map((r) => r.id)).toEqual(["A", "B"])
        expect(res.team[0].avgWinSec).toBe(500)
        expect(res.team[1].avgWinSec).toBe(900)
        expect(res.team[0].avgLoseSec).toBe(900)
        expect(res.team[1].avgLoseSec).toBe(500)
    })
})

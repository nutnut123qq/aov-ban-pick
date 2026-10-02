import { describe, expect, it } from "vitest"
import type { DraftAction, HeroManifest, Lane, Match, Series, TeamSide } from "@/modules/types"
import { getTally, suggestStep, tally, type AssistContext } from "../assist"

const mockHeroes: Array<HeroManifest> = [
    { slug: "florentino", name: "Florentino", file: "florentino.jpg" },
    { slug: "tulen", name: "Tulen", file: "tulen.jpg" },
    { slug: "nakroth", name: "Nakroth", file: "nakroth.jpg" },
    { slug: "hayate", name: "Hayate", file: "hayate.jpg" },
    { slug: "helen", name: "Helen", file: "helen.jpg" },
    { slug: "airi", name: "Airi", file: "airi.jpg" },
    { slug: "liliana", name: "Liliana", file: "liliana.jpg" },
    { slug: "krizzix", name: "Krizzix", file: "krizzix.jpg" },
]

const createMockSeries = (): Array<Series> => [
    {
        id: "s1",
        tournament_name: "APL 2026",
        patch_id: "1.54",
        format: "BO5",
        team_blue_id: "SGP",
        team_red_id: "FL",
        winner_team_id: "FL", // Red wins match 1
        played_at: "2026-06-20",
        matches: [
            {
                van_number: 1,
                team_blue_id: "SGP",
                team_red_id: "FL",
                winner_team_id: "FL", // Red won
                is_blind_pick: false,
                draft_actions: [
                    // Bans
                    { turn_number: 1, pick_index: null, team_side: "blue", action_type: "ban", hero_id: "florentino", lane_position: null, player_id: null, is_counter_pick: false },
                    { turn_number: 2, pick_index: null, team_side: "red", action_type: "ban", hero_id: "krizzix", lane_position: null, player_id: null, is_counter_pick: false },
                    // Picks Phase 1
                    { turn_number: 3, pick_index: 1, team_side: "blue", action_type: "pick", hero_id: "tulen", lane_position: "giua", player_id: null, is_counter_pick: false },
                    { turn_number: 4, pick_index: 2, team_side: "red", action_type: "pick", hero_id: "hayate", lane_position: "rong_xa", player_id: null, is_counter_pick: false },
                    { turn_number: 4, pick_index: 3, team_side: "red", action_type: "pick", hero_id: "helen", lane_position: "rong_ho_tro", player_id: null, is_counter_pick: false },
                    { turn_number: 5, pick_index: 4, team_side: "blue", action_type: "pick", hero_id: "nakroth", lane_position: "rung", player_id: null, is_counter_pick: false },
                    { turn_number: 5, pick_index: 5, team_side: "blue", action_type: "pick", hero_id: "airi", lane_position: "ta_than", player_id: null, is_counter_pick: false },
                    { turn_number: 6, pick_index: 6, team_side: "red", action_type: "pick", hero_id: "liliana", lane_position: "giua", player_id: null, is_counter_pick: true },
                ],
            },
            {
                van_number: 2,
                team_blue_id: "FL",
                team_red_id: "SGP",
                winner_team_id: "FL", // Blue won
                is_blind_pick: false,
                draft_actions: [
                    { turn_number: 1, pick_index: null, team_side: "blue", action_type: "ban", hero_id: "florentino", lane_position: null, player_id: null, is_counter_pick: false },
                    // Tulen played in jungle this time (flex)
                    { turn_number: 3, pick_index: 1, team_side: "blue", action_type: "pick", hero_id: "tulen", lane_position: "rung", player_id: null, is_counter_pick: false },
                ],
            },
        ],
    },
]

const banAction = (turn: number, side: TeamSide, heroId: string): DraftAction => ({
    turn_number: turn,
    pick_index: null,
    team_side: side,
    action_type: "ban",
    hero_id: heroId,
    lane_position: null,
    player_id: null,
    is_counter_pick: false,
})

const pickAction = (
    turn: number,
    idx: number,
    side: TeamSide,
    heroId: string,
    lane: Lane,
): DraftAction => ({
    turn_number: turn,
    pick_index: idx,
    team_side: side,
    action_type: "pick",
    hero_id: heroId,
    lane_position: lane,
    player_id: null,
    is_counter_pick: false,
})

/**
 * 6 ván: Xanh pick [tulen + 4 filler], Đỏ pick [florentino + 4 filler], Đỏ thắng 5/6.
 * → matchup `florentino|tulen` = 5/6, đủ mẫu để deny-boost khi ban phase trễ.
 */
const createCounterSeries = (): Array<Series> => {
    const mkMatch = (van: number, blueWon: boolean): Match => ({
        van_number: van,
        team_blue_id: "A",
        team_red_id: "R",
        winner_team_id: blueWon ? "A" : "R",
        is_blind_pick: false,
        draft_actions: [
            banAction(1, "blue", "veres"),
            banAction(2, "red", "enzo"),
            pickAction(3, 1, "blue", "tulen", "giua"),
            pickAction(3, 2, "blue", "b1", "rung"),
            pickAction(4, 3, "blue", "b2", "ta_than"),
            pickAction(4, 4, "blue", "b3", "rong_xa"),
            pickAction(5, 5, "blue", "b4", "rong_ho_tro"),
            pickAction(5, 6, "red", "florentino", "ta_than"),
            pickAction(6, 7, "red", "r1", "giua"),
            pickAction(6, 8, "red", "r2", "rung"),
            pickAction(7, 9, "red", "r3", "rong_xa"),
            pickAction(7, 10, "red", "r4", "rong_ho_tro"),
        ],
    })
    return [
        {
            id: "s-counter",
            tournament_name: "Counter Cup",
            patch_id: "1.55",
            format: "BO7",
            team_blue_id: "A",
            team_red_id: "R",
            winner_team_id: "R",
            played_at: "2026-02-01",
            matches: [
                mkMatch(1, true),
                mkMatch(2, false),
                mkMatch(3, false),
                mkMatch(4, false),
                mkMatch(5, false),
                mkMatch(6, false),
            ],
        },
    ]
}

describe("assist module", () => {
    describe("tally & getTally caching", () => {
        it("returns 0 totalMatches and default base rates for empty series", () => {
            const t = tally([])
            expect(t.totalMatches).toBe(0)
            expect(t.blueBase).toBe(0.5)
            expect(t.redBase).toBe(0.5)
            expect(t.banCount.size).toBe(0)
            expect(t.pick.size).toBe(0)
        })

        it("aggregates ban and pick stats correctly from series", () => {
            const series = createMockSeries()
            const t = tally(series)

            expect(t.totalMatches).toBe(2)
            expect(t.banCount.get("florentino")).toBe(2)
            expect(t.banCount.get("krizzix")).toBe(1)
            // Tulen flexed in 2 lanes: giua and rung
            expect(t.lanesByHero.get("tulen")?.size).toBe(2)
            expect(t.pickTotal.get("tulen")).toBe(2)
        })

        it("memoizes tally result with getTally for identical dataset fingerprint", () => {
            const series = createMockSeries()
            const t1 = getTally(series)
            const t2 = getTally(series)

            expect(t1).toBe(t2) // Same cached object

            // Re-parsed / cloned array with same content hits the fingerprint cache
            const clonedSeries = createMockSeries()
            const t3 = getTally(clonedSeries)
            expect(t3).toBe(t1)

            // Series with different ID computes new tally
            const modifiedSeries = [
                ...createMockSeries(),
                {
                    id: "series_different_id",
                    tournament_name: "Other Tournament",
                    patch_id: "p_99",
                    format: "BO1",
                    team_blue_id: "b",
                    team_red_id: "r",
                    winner_team_id: "b",
                    played_at: "2026-09-09",
                    matches: [],
                },
            ]
            const t4 = getTally(modifiedSeries)
            expect(t4).not.toBe(t1)
        })
    })


    describe("suggestStep for BAN action", () => {
        it("returns empty suggestions if series data is empty", () => {
            const ctx: AssistContext = {
                action: "ban",
                side: "blue",
                used: new Set(),
                lanesNeeded: ["ta_than", "rung", "giua", "rong_xa", "rong_ho_tro"],
                alliesPicked: [],
                enemyRevealed: [],
            }
            expect(suggestStep(ctx, [], mockHeroes)).toEqual([])
        })

        it("prioritizes heroes with highest ban rate and excludes used heroes", () => {
            const series = createMockSeries()
            const ctx: AssistContext = {
                action: "ban",
                side: "blue",
                used: new Set(),
                lanesNeeded: ["ta_than", "rung", "giua", "rong_xa", "rong_ho_tro"],
                alliesPicked: [],
                enemyRevealed: [],
            }

            const suggestions = suggestStep(ctx, series, mockHeroes)
            expect(suggestions.length).toBeGreaterThan(0)
            // Florentino was banned in 2/2 matches (100% ban rate)
            expect(suggestions[0].heroId).toBe("florentino")
            expect(suggestions[0].reason).toContain("Ban-rate 100%")

            // When florentino is already used, it should not be suggested again
            const ctxUsed: AssistContext = {
                ...ctx,
                used: new Set(["florentino"]),
            }
            const suggestions2 = suggestStep(ctxUsed, series, mockHeroes)
            expect(suggestions2.some((s) => s.heroId === "florentino")).toBe(false)
        })

        it("deny-boosts counters of revealed allies during late ban phase", () => {
            const series = createCounterSeries()
            const ctx: AssistContext = {
                action: "ban",
                side: "blue",
                used: new Set(["tulen", "b1", "b2", "b3", "b4"]),
                lanesNeeded: [],
                alliesPicked: [
                    { heroId: "tulen", lane: "giua" },
                    { heroId: "b1", lane: "rung" },
                ],
                enemyRevealed: [],
            }

            const suggestions = suggestStep(ctx, series, mockHeroes)
            const flo = suggestions.find((s) => s.heroId === "florentino")
            expect(flo).toBeDefined()
            // matchup florentino|tulen = 5/6 → reason kèm kèo counter mạnh nhất
            expect(flo?.reason).toContain("counter Tulen")
            expect(flo?.reason).toContain("5/6")
        })

        it("does not apply deny boost in early ban phase (alliesPicked < 2)", () => {
            const series = createCounterSeries()
            const ctx: AssistContext = {
                action: "ban",
                side: "blue",
                used: new Set(["tulen", "b1", "b2", "b3", "b4"]),
                lanesNeeded: [],
                alliesPicked: [{ heroId: "tulen", lane: "giua" }],
                enemyRevealed: [],
            }

            const suggestions = suggestStep(ctx, series, mockHeroes)
            expect(suggestions.every((s) => !s.reason.includes("counter"))).toBe(true)
        })
    })

    describe("suggestStep for PICK action", () => {
        it("suggests picks matching needed lanes and computes winrates", () => {
            const series = createMockSeries()
            const ctx: AssistContext = {
                action: "pick",
                side: "red",
                used: new Set(),
                lanesNeeded: ["rong_xa", "rong_ho_tro"],
                alliesPicked: [],
                enemyRevealed: [],
            }

            const suggestions = suggestStep(ctx, series, mockHeroes)
            expect(suggestions.length).toBeGreaterThan(0)
            suggestions.forEach((s) => {
                expect(["rong_xa", "rong_ho_tro"]).toContain(s.lane)
            })
        })

        it("adds counter note when enemy in the same lane is already revealed", () => {
            const series = createMockSeries()
            const ctx: AssistContext = {
                action: "pick",
                side: "red",
                used: new Set(["tulen"]),
                lanesNeeded: ["giua"],
                alliesPicked: [],
                enemyRevealed: [{ heroId: "tulen", lane: "giua" }],
            }

            const suggestions = suggestStep(ctx, series, mockHeroes)
            const liliana = suggestions.find((s) => s.heroId === "liliana")
            if (liliana) {
                expect(liliana.reason).toContain("cần đối Giữa")
                expect(liliana.reason).toContain("Tulen")
            }

        })

        it("excludes heroes already in the used set", () => {
            const series = createMockSeries()
            const ctx: AssistContext = {
                action: "pick",
                side: "blue",
                used: new Set(["tulen", "hayate", "helen", "nakroth", "airi", "liliana"]),
                lanesNeeded: ["ta_than", "rung", "giua", "rong_xa", "rong_ho_tro"],
                alliesPicked: [],
                enemyRevealed: [],
            }

            const suggestions = suggestStep(ctx, series, mockHeroes)
            expect(suggestions.length).toBe(0)
        })
    })
})

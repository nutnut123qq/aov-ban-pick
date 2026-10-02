import { describe, expect, it } from "vitest"
import type { HeroManifest, Series } from "@/modules/types"
import { aggregateMeta, type MetaFilter } from "../aggregate"

const mockHeroes: Array<HeroManifest> = [
    { slug: "florentino", name: "Florentino", file: "florentino.jpg" },
    { slug: "tulen", name: "Tulen", file: "tulen.jpg" },
    { slug: "nakroth", name: "Nakroth", file: "nakroth.jpg" },
    { slug: "hayate", name: "Hayate", file: "hayate.jpg" },
    { slug: "helen", name: "Helen", file: "helen.jpg" },
]

const mockSeries: Array<Series> = [
    {
        id: "s1",
        tournament_name: "APL 2026",
        patch_id: "1.54",
        format: "BO5",
        team_blue_id: "SGP",
        team_red_id: "FL",
        winner_team_id: "FL",
        played_at: "2026-06-20",
        matches: [
            {
                van_number: 1,
                team_blue_id: "SGP",
                team_red_id: "FL",
                winner_team_id: "FL",
                is_blind_pick: false,
                draft_actions: [
                    { turn_number: 1, pick_index: null, team_side: "blue", action_type: "ban", hero_id: "florentino", lane_position: null, player_id: null, is_counter_pick: false },
                    { turn_number: 2, pick_index: 1, team_side: "blue", action_type: "pick", hero_id: "tulen", lane_position: "giua", player_id: null, is_counter_pick: false },
                    { turn_number: 3, pick_index: 2, team_side: "red", action_type: "pick", hero_id: "hayate", lane_position: "rong_xa", player_id: null, is_counter_pick: false },
                    // Pick without lane should be ignored safely
                    { turn_number: 4, pick_index: 3, team_side: "red", action_type: "pick", hero_id: "helen", lane_position: null, player_id: null, is_counter_pick: false },
                ],
            },
        ],
    },
    {
        id: "s2",
        tournament_name: "ĐTDV Mùa Đông 2025",
        patch_id: "1.53",
        format: "BO5",
        team_blue_id: "FL",
        team_red_id: "SGP",
        winner_team_id: "FL",
        played_at: "2025-11-15",
        matches: [
            {
                van_number: 1,
                team_blue_id: "FL",
                team_red_id: "SGP",
                winner_team_id: "FL",
                is_blind_pick: false,
                draft_actions: [
                    { turn_number: 1, pick_index: null, team_side: "red", action_type: "ban", hero_id: "florentino", lane_position: null, player_id: null, is_counter_pick: false },
                    { turn_number: 2, pick_index: 1, team_side: "blue", action_type: "pick", hero_id: "tulen", lane_position: "giua", player_id: null, is_counter_pick: false },
                    { turn_number: 3, pick_index: 2, team_side: "red", action_type: "pick", hero_id: "nakroth", lane_position: "rung", player_id: null, is_counter_pick: false },
                ],
            },
        ],
    },
]

describe("aggregate module", () => {
    it("returns empty result when series list is empty", () => {
        const filter: MetaFilter = { patchId: "all", lane: "all", tournamentName: "all" }
        const res = aggregateMeta([], mockHeroes, filter)

        expect(res.totalMatches).toBe(0)
        expect(res.rows).toEqual([])
        expect(res.patches).toEqual([])
        expect(res.tournaments).toEqual([])
    })

    it("aggregates all matches when filter is 'all'", () => {
        const filter: MetaFilter = { patchId: "all", lane: "all", tournamentName: "all" }
        const res = aggregateMeta(mockSeries, mockHeroes, filter)

        expect(res.totalMatches).toBe(2)
        expect(res.patches).toEqual(["1.53", "1.54"])
        expect(res.tournaments).toEqual(["APL 2026", "ĐTDV Mùa Đông 2025"])

        // Tulen (giua) picked in both matches -> picks = 2, wins = 1 (match 2 won, match 1 lost)
        const tulenRow = res.rows.find((r) => r.heroId === "tulen" && r.lane === "giua")
        expect(tulenRow).toBeDefined()
        expect(tulenRow?.picks).toBe(2)
        expect(tulenRow?.wins).toBe(1)
        expect(tulenRow?.winRate).toBe(0.5)
        expect(tulenRow?.pickRate).toBe(1.0)
        // Florentino was banned in both matches
        expect(tulenRow?.banRate).toBe(0) // Tulen was banned 0 times

        // Ban rate for Florentino
        const hayateRow = res.rows.find((r) => r.heroId === "hayate")
        expect(hayateRow?.picks).toBe(1)
        expect(hayateRow?.wins).toBe(1)
        expect(hayateRow?.winRate).toBe(1.0)
    })

    it("filters accurately by patchId", () => {
        const filter: MetaFilter = { patchId: "1.54", lane: "all", tournamentName: "all" }
        const res = aggregateMeta(mockSeries, mockHeroes, filter)

        expect(res.totalMatches).toBe(1)
        // In patch 1.54, only tulen (giua) and hayate (rong_xa) were picked with lanes
        expect(res.rows.length).toBe(2)
        const tulenRow = res.rows.find((r) => r.heroId === "tulen")
        expect(tulenRow?.picks).toBe(1)
        expect(tulenRow?.wins).toBe(0)
    })

    it("filters accurately by tournamentName", () => {
        const filter: MetaFilter = { patchId: "all", lane: "all", tournamentName: "APL 2026" }
        const res = aggregateMeta(mockSeries, mockHeroes, filter)

        expect(res.totalMatches).toBe(1)
        expect(res.rows.some((r) => r.heroId === "nakroth")).toBe(false)
    })

    it("filters accurately by lane position", () => {
        const filter: MetaFilter = { patchId: "all", lane: "rung", tournamentName: "all" }
        const res = aggregateMeta(mockSeries, mockHeroes, filter)

        expect(res.rows.length).toBe(1)
        expect(res.rows[0].heroId).toBe("nakroth")
        expect(res.rows[0].lane).toBe("rung")
    })
})

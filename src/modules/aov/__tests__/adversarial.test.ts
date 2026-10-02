import { describe, expect, it } from "vitest"
import { bayesSmoothedRate, confidenceFromSample, wilsonInterval } from "@/modules/utils"
import type { HeroManifest, Series } from "@/modules/types"
import { aggregateMeta } from "../aggregate"
import {
    clamp01,
    clearTallyCache,
    getTally,
    suggestStep,
    tally,
    wilsonLower,
    type AssistContext,
} from "../assist"

describe("Adversarial & Zero-Propagation Defense Test Suite", () => {
    describe("Mathematical Functions Resilience", () => {
        it("handles extreme, negative, and NaN inputs in wilsonInterval", () => {
            expect(wilsonInterval(0, 0)).toEqual({ low: 0, high: 0 })
            expect(wilsonInterval(-10, -5)).toEqual({ low: 0, high: 0 })
            expect(wilsonInterval(NaN, 10)).toEqual({ low: 0, high: 0 })
            expect(wilsonInterval(5, NaN)).toEqual({ low: 0, high: 0 })
            expect(wilsonInterval(Infinity, 10)).toEqual({ low: 0, high: 0 })
            expect(wilsonInterval(5, Infinity)).toEqual({ low: 0, high: 0 })
            expect(wilsonInterval(15, 10)).toEqual(wilsonInterval(10, 10)) // Clamped successes <= total
        })

        it("handles extreme and malformed inputs in bayesSmoothedRate", () => {
            expect(bayesSmoothedRate(0, 0, 0.5, 10)).toBe(0.5)
            expect(bayesSmoothedRate(-5, 10, 0.5, 10)).toBe(0.5)
            expect(bayesSmoothedRate(5, -10, 0.5, 10)).toBe(0.5)
            expect(bayesSmoothedRate(NaN, 10, 0.5, 10)).toBe(0.5)
            expect(bayesSmoothedRate(5, 10, NaN, 10)).toBeCloseTo(0.5, 1)
            expect(bayesSmoothedRate(5, 10, 0.5, NaN)).toBeCloseTo(0.5, 1)
        })

        it("handles invalid inputs in confidenceFromSample", () => {
            expect(confidenceFromSample(0)).toBe("low")
            expect(confidenceFromSample(-10)).toBe("low")
            expect(confidenceFromSample(NaN)).toBe("low")
            expect(confidenceFromSample(Infinity)).toBe("low")
        })

        it("handles extreme inputs in wilsonLower and clamp01", () => {
            expect(wilsonLower(0, 0)).toBe(0)
            expect(wilsonLower(-5, 10)).toBe(0)
            expect(wilsonLower(10, -5)).toBe(0)
            expect(wilsonLower(NaN, 10)).toBe(0)
            expect(wilsonLower(5, NaN)).toBe(0)
            expect(clamp01(NaN)).toBe(0.5)
            expect(clamp01(-100)).toBe(0)
            expect(clamp01(100)).toBe(1)
        })
    })

    describe("Adversarial Datasets & Empty State Handling", () => {
        const dummyHeroes: Array<HeroManifest> = [
            { slug: "tulen", name: "Tulen", file: "tulen.webp" },
            { slug: "florentino", name: "Florentino", file: "florentino.webp" },
            { slug: "ghost_hero", name: "Ghost Hero", file: "ghost.webp" },
        ]

        it("handles empty series array in tally and suggestStep without throwing", () => {
            clearTallyCache()
            const emptyTally = getTally([])
            expect(emptyTally.totalMatches).toBe(0)
            expect(emptyTally.banCount.size).toBe(0)

            const ctx: AssistContext = {
                action: "ban",
                side: "blue",
                used: new Set(),
                lanesNeeded: ["giua", "rung"],
                alliesPicked: [],
                enemyRevealed: [],
            }

            const banSuggestions = suggestStep(ctx, [], dummyHeroes)
            expect(banSuggestions).toEqual([])

            const pickSuggestions = suggestStep({ ...ctx, action: "pick" }, [], dummyHeroes)
            expect(pickSuggestions).toEqual([])
        })

        it("handles malformed matches (negative duration, empty actions, invalid winner)", () => {
            const corruptedSeries: Array<Series> = [
                {
                    id: "corrupted_1",
                    tournament_name: "Corrupted Cup",
                    patch_id: "p_corrupted",
                    format: "BO1",
                    team_blue_id: "team_a",
                    team_red_id: "team_b",
                    winner_team_id: "unknown_team",
                    played_at: "2026-01-01",
                    matches: [
                        {
                            van_number: 1,
                            team_blue_id: "team_a",
                            team_red_id: "team_b",
                            winner_team_id: "unknown_team",
                            duration_seconds: -999,
                            is_blind_pick: false,
                            draft_actions: [],
                        },
                        {
                            van_number: 2,
                            team_blue_id: "team_a",
                            team_red_id: "team_b",
                            winner_team_id: "team_a",
                            duration_seconds: 0,
                            is_blind_pick: false,
                            draft_actions: [
                                {
                                    turn_number: 1,
                                    pick_index: null,
                                    team_side: "blue",
                                    action_type: "ban",
                                    hero_id: "florentino",
                                    lane_position: null,
                                    player_id: null,
                                    is_counter_pick: false,
                                },
                            ],
                        },
                    ],
                },
            ]

            const t = tally(corruptedSeries)
            expect(t.totalMatches).toBe(2)
            expect(t.banCount.get("florentino")).toBe(1)
            expect(Number.isFinite(t.blueBase)).toBe(true)

            const ctx: AssistContext = {
                action: "ban",
                side: "blue",
                used: new Set(),
                lanesNeeded: ["giua"],
                alliesPicked: [],
                enemyRevealed: [],
            }

            const suggestions = suggestStep(ctx, corruptedSeries, dummyHeroes)
            expect(suggestions.length).toBeGreaterThan(0)
            for (const s of suggestions) {
                expect(Number.isFinite(s.n)).toBe(true)
            }
        })

        it("handles filters matching 0 matches in aggregateMeta", () => {
            const meta = aggregateMeta([], dummyHeroes, {
                patchId: "non_existent_patch",
                lane: "all",
                tournamentNames: ["non_existent_tournament"],
            })

            expect(meta.totalMatches).toBe(0)
            expect(meta.rows).toEqual([])
            expect(meta.patches).toEqual([])
            expect(meta.tournaments).toEqual([])
        })
    })

    describe("Cache Performance & Benchmark Profiling", () => {
        it("executes cold compute and cached lookup in <= 1ms", () => {
            const mockSeries: Array<Series> = Array.from({ length: 50 }, (_, i) => ({
                id: `series_${i}`,
                tournament_name: "Mock Tournament",
                patch_id: "p_1",
                format: "BO3",
                team_blue_id: "blue",
                team_red_id: "red",
                winner_team_id: "blue",
                played_at: "2026-06-01",
                matches: [
                    {
                        van_number: 1,
                        team_blue_id: "blue",
                        team_red_id: "red",
                        winner_team_id: "blue",
                        is_blind_pick: false,
                        draft_actions: [
                            {
                                turn_number: 1,
                                pick_index: null,
                                team_side: "blue",
                                action_type: "ban",
                                hero_id: "florentino",
                                lane_position: null,
                                player_id: null,
                                is_counter_pick: false,
                            },
                            {
                                turn_number: 5,
                                pick_index: 1,
                                team_side: "blue",
                                action_type: "pick",
                                hero_id: "tulen",
                                lane_position: "giua",
                                player_id: null,
                                is_counter_pick: false,
                            },
                        ],
                    },
                ],
            }))

            clearTallyCache()

            // 1. Cold compute
            const coldStart = performance.now()
            const coldTally = getTally(mockSeries)
            const coldDuration = performance.now() - coldStart

            expect(coldTally.totalMatches).toBe(50)

            // 2. Cached lookups (re-parsed/re-referenced clone to simulate SWR)
            const lookupDurations: Array<number> = []
            for (let i = 0; i < 10; i++) {
                const clonedSeries = [...mockSeries] // fresh array ref
                const start = performance.now()
                const cachedTally = getTally(clonedSeries)
                const duration = performance.now() - start
                lookupDurations.push(duration)
                expect(cachedTally.totalMatches).toBe(50)
            }

            const avgCacheHit = lookupDurations.reduce((a, b) => a + b, 0) / lookupDurations.length
            console.log(`[Benchmark] Cold compute: ${coldDuration.toFixed(3)}ms | Avg cache hit: ${avgCacheHit.toFixed(3)}ms`)

            // Requirement: Cache hit time <= 1ms
            expect(avgCacheHit).toBeLessThanOrEqual(1.0)
        })
    })
})

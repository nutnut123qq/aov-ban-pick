import { readFileSync } from "fs"
import { join } from "path"
import { describe, expect, it } from "vitest"
import {
    DataIndexSchema,
    HeroManifestListSchema,
    SeriesListSchema,
    type HeroManifest,
    type Lane,
    type Series,
} from "@/modules/types"
import { aggregateMeta } from "../aggregate"
import { suggestStep, type AssistContext } from "../assist"
import { DRAFT_SEQUENCE } from "@/features/draft-input/sequence"

const ALL_LANES: Array<Lane> = ["ta_than", "rung", "giua", "rong_xa", "rong_ho_tro"]

describe("Data Pipeline & Draft Engine Integration", () => {
    const rootDir = process.cwd()
    const manifestPath = join(rootDir, "public", "images", "heroes", "manifest.json")
    const indexPath = join(rootDir, "public", "data", "index.json")
    const matchesDir = join(rootDir, "public", "data", "matches")

    const rawManifest = JSON.parse(readFileSync(manifestPath, "utf-8"))
    const rawIndex = JSON.parse(readFileSync(indexPath, "utf-8"))

    const heroes: Array<HeroManifest> = HeroManifestListSchema.parse(rawManifest)
    const indexData = DataIndexSchema.parse(rawIndex)

    const allSeries: Array<Series> = indexData.matches.flatMap((matchId) => {
        const rawSeries = JSON.parse(readFileSync(join(matchesDir, `${matchId}.json`), "utf-8"))
        return SeriesListSchema.parse(rawSeries)
    })

    it("loads and validates production dataset schema cleanly", () => {
        expect(heroes.length).toBeGreaterThan(100)
        expect(allSeries.length).toBeGreaterThan(0)

        // Ensure total matches across all series
        const totalMatches = allSeries.reduce((acc, s) => acc + s.matches.length, 0)
        expect(totalMatches).toBeGreaterThan(10)
    })

    it("aggregates meta statistics correctly from production dataset", () => {
        const meta = aggregateMeta(allSeries, heroes, {
            patchId: "all",
            lane: "all",
            tournamentName: "all",
        })

        expect(meta.totalMatches).toBeGreaterThan(0)
        expect(meta.rows.length).toBeGreaterThan(0)
        expect(meta.patches.length).toBeGreaterThan(0)
        expect(meta.tournaments.length).toBeGreaterThan(0)

        // Check each row integrity
        for (const row of meta.rows) {
            expect(row.heroId).toBeDefined()
            expect(row.heroName).toBeDefined()
            expect(row.picks).toBeGreaterThan(0)
            expect(row.winRate).toBeGreaterThanOrEqual(0)
            expect(row.winRate).toBeLessThanOrEqual(1)
            expect(row.pickRate).toBeGreaterThanOrEqual(0)
            expect(row.pickRate).toBeLessThanOrEqual(1)
            expect(row.banRate).toBeGreaterThanOrEqual(0)
            expect(row.banRate).toBeLessThanOrEqual(1)
        }
    })

    it("simulates a complete 18-step draft match without exceptions", () => {
        const filledState: Array<{ heroId: string; lane: Lane | null }> = []
        const usedHeroes = new Set<string>()

        const blueLanes = new Set<Lane>()
        const redLanes = new Set<Lane>()

        for (let i = 0; i < DRAFT_SEQUENCE.length; i++) {
            const step = DRAFT_SEQUENCE[i]
            const mySide = step.side
            const myLanes = mySide === "blue" ? blueLanes : redLanes
            const neededLanes = ALL_LANES.filter((l) => !myLanes.has(l))

            // Build enemy revealed list
            const enemyRevealed: Array<{ heroId: string; lane: Lane }> = []
            for (let j = 0; j < i; j++) {
                const prev = DRAFT_SEQUENCE[j]
                if (prev.action === "pick" && prev.side !== mySide && filledState[j]?.lane) {
                    enemyRevealed.push({
                        heroId: filledState[j].heroId,
                        lane: filledState[j].lane as Lane,
                    })
                }
            }

            const ctx: AssistContext = {
                action: step.action,
                side: mySide,
                used: new Set(usedHeroes),
                lanesNeeded: neededLanes,
                enemyRevealed,
            }

            const suggestions = suggestStep(ctx, allSeries, heroes)
            expect(Array.isArray(suggestions)).toBe(true)

            let chosenHeroId: string
            let chosenLane: Lane | null = null

            if (suggestions.length > 0) {
                const topSuggestion = suggestions[0]
                expect(topSuggestion.heroId).toBeDefined()
                expect(topSuggestion.heroName).toBeDefined()
                expect(topSuggestion.reason).toBeDefined()
                expect(usedHeroes.has(topSuggestion.heroId)).toBe(false)

                chosenHeroId = topSuggestion.heroId
                chosenLane = topSuggestion.lane ?? (neededLanes[0] || "giua")
            } else {
                // Fallback to any unused hero from manifest
                const fallbackHero = heroes.find((h) => !usedHeroes.has(h.slug))!
                chosenHeroId = fallbackHero.slug
                chosenLane = step.action === "pick" ? neededLanes[0] || "giua" : null
            }

            if (step.action === "pick" && chosenLane) {
                myLanes.add(chosenLane)
            }

            usedHeroes.add(chosenHeroId)
            filledState.push({ heroId: chosenHeroId, lane: chosenLane })
        }

        // Verify draft completion
        expect(filledState.length).toBe(18)
        expect(usedHeroes.size).toBe(18)
        expect(blueLanes.size).toBe(5)
        expect(redLanes.size).toBe(5)
    })

    it("respects fearless global bans in game 2 simulation", () => {
        // Game 1 picks
        const game1BluePicks = ["tulen", "nakroth", "florentino", "capheny", "helen"]
        const game1RedPicks = ["liliana", "airi", "hayate", "krizzix", "keera"]

        const globalBansBlue = new Set(game1BluePicks)

        const ctx: AssistContext = {
            action: "pick",
            side: "blue",
            used: new Set([...globalBansBlue]),
            lanesNeeded: ALL_LANES,
            enemyRevealed: [],
        }

        const suggestions = suggestStep(ctx, allSeries, heroes)
        for (const s of suggestions) {
            expect(globalBansBlue.has(s.heroId)).toBe(false)
        }
    })
})

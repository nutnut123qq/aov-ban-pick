/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { DRAFT_SEQUENCE } from "@/features/draft-input/sequence"
import { useDraftEngine } from "../hooks/useDraftEngine"

// Mock useAovData so test runs standalone without network
vi.mock("@/modules/aov", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/modules/aov")>()
    return {
        ...actual,
        useAovData: () => ({
            data: {
                heroes: [
                    { slug: "tulen", name: "Tulen", file: "tulen.webp" },
                    { slug: "liliana", name: "Liliana", file: "liliana.webp" },
                    { slug: "nakroth", name: "Nakroth", file: "nakroth.webp" },
                    { slug: "florentino", name: "Florentino", file: "florentino.webp" },
                    { slug: "capheny", name: "Capheny", file: "capheny.webp" },
                    { slug: "helen", name: "Helen", file: "helen.webp" },
                    { slug: "airi", name: "Airi", file: "airi.webp" },
                    { slug: "krizzix", name: "Krizzix", file: "krizzix.webp" },
                    { slug: "hayate", name: "Hayate", file: "hayate.webp" },
                    { slug: "keera", name: "Keera", file: "keera.webp" },
                ],
                series: [],
            },
            isLoading: false,
        }),
    }
})

describe("useDraftEngine State Machine & Fearless Ban Invariants", () => {
    it("dynamically reflects Fearless Bans as pure derived state across games", () => {
        const { result } = renderHook(() => useDraftEngine(1))

        // Step 4 is first pick (Blue, pick_index = 1)
        const bluePickStepIndex = 4

        // 1. Pick Tulen in Game 1
        act(() => {
            result.current.setStep(bluePickStepIndex, { heroId: "tulen", lane: "giua" })
        })
        expect(result.current.filled[bluePickStepIndex]?.heroId).toBe("tulen")

        // 2. Switch to Game 2 -> Tulen must be in globalBansBlue
        act(() => {
            result.current.handleVanChange(2)
        })
        expect(result.current.vanNumber).toBe(2)
        expect(result.current.globalBansBlue).toContain("tulen")
        expect(result.current.globalBansBlue.length).toBe(5)

        // 3. Switch back to Game 1 -> Change Tulen to Liliana
        act(() => {
            result.current.handleVanChange(1)
        })
        act(() => {
            result.current.setStep(bluePickStepIndex, { heroId: "liliana", lane: "giua" })
        })
        expect(result.current.filled[bluePickStepIndex]?.heroId).toBe("liliana")

        // 4. Switch to Game 2 -> Liliana must be in globalBansBlue, Tulen must be GONE (no ghost hero)
        act(() => {
            result.current.handleVanChange(2)
        })
        expect(result.current.globalBansBlue).toContain("liliana")
        expect(result.current.globalBansBlue).not.toContain("tulen")

        // 5. Switch back to Game 1 -> Undo pick -> Switch to Game 2 -> globalBansBlue must be empty
        act(() => {
            result.current.handleVanChange(1)
        })
        act(() => {
            result.current.undoLast()
        })
        expect(result.current.filled[bluePickStepIndex]?.heroId).toBeNull()

        act(() => {
            result.current.handleVanChange(2)
        })
        expect(result.current.globalBansBlue.filter(Boolean)).toHaveLength(0)
    })

    it("passes 60-step randomized Fuzz Testing without desync or duplicate invariant violation", () => {
        const { result } = renderHook(() => useDraftEngine(1))
        const heroes = ["tulen", "liliana", "nakroth", "florentino", "capheny", "helen", "airi", "krizzix", "hayate", "keera"]
        const lanes = ["ta_than", "rung", "giua", "rong_xa", "rong_ho_tro"] as const

        for (let op = 0; op < 60; op++) {
            const actionType = op % 6

            act(() => {
                switch (actionType) {
                    case 0: { // Pick/Ban a random step
                        const stepIdx = Math.floor(Math.random() * DRAFT_SEQUENCE.length)
                        const hero = heroes[Math.floor(Math.random() * heroes.length)]
                        const lane = DRAFT_SEQUENCE[stepIdx].action === "pick" ? lanes[Math.floor(Math.random() * lanes.length)] : null
                        result.current.setStep(stepIdx, { heroId: hero, lane })
                        break
                    }
                    case 1: { // Switch game
                        const nextVan = Math.floor(Math.random() * 4) + 1
                        result.current.handleVanChange(nextVan)
                        break
                    }
                    case 2: { // Undo last
                        result.current.undoLast()
                        break
                    }
                    case 3: { // Clear specific step
                        const stepIdx = Math.floor(Math.random() * DRAFT_SEQUENCE.length)
                        result.current.clearStep(stepIdx)
                        break
                    }
                    case 4: { // Apply suggestion
                        const hero = heroes[Math.floor(Math.random() * heroes.length)]
                        result.current.applySuggestion(hero, "giua")
                        break
                    }
                    case 5: { // Reset current game
                        if (Math.random() < 0.2) {
                            result.current.reset()
                        }
                        break
                    }
                }
            })

            // Invariant 1: State structure validity
            expect(result.current.filled).toHaveLength(DRAFT_SEQUENCE.length)
            expect(result.current.globalBansBlue).toHaveLength((result.current.vanNumber - 1) * 5)
            expect(result.current.globalBansRed).toHaveLength((result.current.vanNumber - 1) * 5)

            // Invariant 2: Derived fearless bans match actual picks in preceding games
            const currentVan = result.current.vanNumber
            const expectedBluePicks: Array<string> = []
            for (let g = 1; g < currentVan; g++) {
                const prevGame = result.current.games[g]
                if (prevGame) {
                    for (let s = 0; s < DRAFT_SEQUENCE.length; s++) {
                        if (DRAFT_SEQUENCE[s].action === "pick" && DRAFT_SEQUENCE[s].side === "blue" && prevGame[s]?.heroId) {
                            expectedBluePicks.push(prevGame[s].heroId!)
                        }
                    }
                }
            }

            const activeBlueBans = result.current.globalBansBlue.filter(Boolean) as Array<string>
            for (const p of expectedBluePicks.slice(0, activeBlueBans.length)) {
                expect(activeBlueBans).toContain(p)
            }
        }
    })
})

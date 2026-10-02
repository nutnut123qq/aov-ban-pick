import { describe, expect, it } from "vitest"
import type { Lane } from "@/modules/types"
import type { PickCell, Tally } from "../assist"
import { scoreDraft, type CompPick } from "../compScore"

const makeTally = (overrides: Partial<Tally> = {}): Tally => ({
    totalMatches: 100,
    banCount: new Map(),
    pick: new Map(),
    lanesByHero: new Map(),
    pickTotal: new Map(),
    blueBase: 0.5,
    redBase: 0.5,
    lanePhase1Share: new Map(),
    pair: new Map(),
    matchup: new Map(),
    duoLane: new Map(),
    phasePick: new Map(),
    ...overrides,
})

const cell = (wins: number, n: number, redN = 0): PickCell => ({ wins, n, redN })

const LANES: Array<Lane> = ["ta_than", "rung", "giua", "rong_xa", "rong_ho_tro"]

const picksOf = (ids: Array<string>): Array<CompPick> =>
    ids.map((heroId, i) => ({ heroId, lane: LANES[i] }))

const BLUE_IDS = ["b1", "b2", "b3", "b4", "b5"]
const RED_IDS = ["r1", "r2", "r3", "r4", "r5"]

describe("scoreDraft", () => {
    it("returns null when tally has too few matches", () => {
        const t = makeTally({ totalMatches: 49 })
        expect(scoreDraft(picksOf(BLUE_IDS), picksOf(RED_IDS), t)).toBeNull()
    })

    it("returns null when a side has no valid picks", () => {
        const t = makeTally()
        expect(scoreDraft([], picksOf(RED_IDS), t)).toBeNull()
        expect(scoreDraft(picksOf(BLUE_IDS), [], t)).toBeNull()
        expect(scoreDraft([], [], t)).toBeNull()
        // Pick thiếu lane không tính là hợp lệ
        expect(
            scoreDraft(
                [{ heroId: "b1", lane: undefined as unknown as Lane }],
                picksOf(RED_IDS),
                t,
            ),
        ).toBeNull()
    })

    it("returns ~0.5 probBlue when no stats exist for any pick", () => {
        const t = makeTally()
        const score = scoreDraft(picksOf(BLUE_IDS), picksOf(RED_IDS), t)
        expect(score).not.toBeNull()
        expect(score!.probBlue).toBeGreaterThan(0)
        expect(score!.probBlue).toBeLessThan(1)
        expect(score!.probBlue).toBeCloseTo(0.5, 5)
        expect(score!.laneEdge).toBe(0)
        expect(score!.synergyEdge).toBe(0)
        expect(score!.matchupEdge).toBe(0)
        expect(score!.laneEdges).toHaveLength(5)
        expect(score!.laneEdges.every((le) => le.edge === 0 && le.n === 0)).toBe(true)
    })

    it("returns per-lane edges sorted by lane order with hero ids", () => {
        const matchup = new Map<string, PickCell>([
            // Xanh thắng kèo Tà thần 7/10 → edge (0.7-0.5)/0.5 = 0.4
            ["b1|r1", cell(7, 10)],
            // Đỏ thắng kèo Rừng: b2 thua r2 → cell b2|r2 có wins=2/10 → edge -0.6
            ["b2|r2", cell(2, 10)],
        ])
        const t = makeTally({ matchup })
        const score = scoreDraft(picksOf(BLUE_IDS), picksOf(RED_IDS), t)
        expect(score).not.toBeNull()
        const le = score!.laneEdges
        expect(le.map((x) => x.lane)).toEqual(LANES)
        expect(le[0]).toMatchObject({
            lane: "ta_than",
            blueHero: "b1",
            redHero: "r1",
            n: 10,
        })
        expect(le[0].edge).toBeCloseTo(0.4, 5)
        expect(le[1].edge).toBeCloseTo(-0.6, 5)
        // Lane không có cell matchup → edge 0, n 0
        expect(le[4]).toMatchObject({ lane: "rong_ho_tro", edge: 0, n: 0 })
    })

    it("laneEdges = edge 0 when matchup cell is below min sample", () => {
        const matchup = new Map<string, PickCell>([["b1|r1", cell(4, 4)]])
        const t = makeTally({ matchup })
        const score = scoreDraft(picksOf(BLUE_IDS), picksOf(RED_IDS), t)
        expect(score).not.toBeNull()
        const ta_than = score!.laneEdges.find((le) => le.lane === "ta_than")!
        expect(ta_than.edge).toBe(0)
        expect(ta_than.n).toBe(4) // cỡ mẫu vẫn được giữ để UI hiện "—"
        expect(ta_than.blueHero).toBe("b1")
        expect(ta_than.redHero).toBe("r1")
    })

    it("laneEdges keeps a row with null hero when a side misses the lane", () => {
        const t = makeTally()
        // Xanh thiếu pick lane giua; Đỏ đủ 5 lane.
        const bluePartial = picksOf(BLUE_IDS).filter((p) => p.lane !== "giua")
        const score = scoreDraft(bluePartial, picksOf(RED_IDS), t)
        expect(score).not.toBeNull()
        const giua = score!.laneEdges.find((le) => le.lane === "giua")!
        expect(giua.blueHero).toBeNull()
        expect(giua.redHero).toBe("r3")
        expect(giua.edge).toBe(0)
        expect(giua.n).toBe(0)
    })

    it("scores partial drafts (works before all 5 picks)", () => {
        const pick = new Map<string, PickCell>([
            ["b1|ta_than", cell(9, 10)],
            ["r1|ta_than", cell(2, 10, 10)],
        ])
        const t = makeTally({ pick })
        const score = scoreDraft(picksOf(["b1"]), picksOf(["r1"]), t)
        expect(score).not.toBeNull()
        // blue adj = 9/10 = 0.9, red adj = 2/10 = 0.2 → edge (0.9-0.2)/0.5 = 1.4 → clamp 1
        expect(score!.laneEdge).toBeCloseTo(1, 5)
        expect(score!.probBlue).toBeCloseTo(0.5 + 0.4, 5)
    })

    it("favors blue when blue picks have higher lane WR", () => {
        const pick = new Map<string, PickCell>()
        for (const [i, id] of BLUE_IDS.entries()) {
            pick.set(`${id}|${LANES[i]}`, cell(8, 10))
        }
        for (const [i, id] of RED_IDS.entries()) {
            pick.set(`${id}|${LANES[i]}`, cell(3, 10, 10))
        }
        const t = makeTally({ pick })
        const score = scoreDraft(picksOf(BLUE_IDS), picksOf(RED_IDS), t)
        expect(score).not.toBeNull()
        expect(score!.laneEdge).toBeGreaterThan(0)
        expect(score!.probBlue).toBeGreaterThan(0.5)
    })

    it("adds positive synergy and matchup edges", () => {
        const pair = new Map<string, PickCell>()
        for (let i = 0; i < BLUE_IDS.length; i++) {
            for (let j = i + 1; j < BLUE_IDS.length; j++) {
                pair.set([BLUE_IDS[i], BLUE_IDS[j]].sort().join("+"), cell(9, 10))
            }
        }
        const matchup = new Map<string, PickCell>()
        for (const b of BLUE_IDS) {
            for (const r of RED_IDS) {
                matchup.set(`${b}|${r}`, cell(7, 10))
            }
        }
        const t = makeTally({ pair, matchup })
        const score = scoreDraft(picksOf(BLUE_IDS), picksOf(RED_IDS), t)
        expect(score).not.toBeNull()
        // synergy: (0.9 - 0.5) / 0.5 = 0.8 ; matchup: (0.7 - 0.5)/0.5 = 0.4
        expect(score!.synergyEdge).toBeCloseTo(0.8, 5)
        expect(score!.matchupEdge).toBeCloseTo(0.4, 5)
        expect(score!.probBlue).toBeCloseTo(0.5 + 0.3 * 0.8 + 0.3 * 0.4, 5)
    })

    it("skips pair/matchup cells below min sample (n < 5)", () => {
        const pair = new Map<string, PickCell>()
        for (let i = 0; i < BLUE_IDS.length; i++) {
            for (let j = i + 1; j < BLUE_IDS.length; j++) {
                pair.set([BLUE_IDS[i], BLUE_IDS[j]].sort().join("+"), cell(4, 4))
            }
        }
        const matchup = new Map<string, PickCell>()
        for (const b of BLUE_IDS) {
            for (const r of RED_IDS) {
                matchup.set(`${b}|${r}`, cell(4, 4))
            }
        }
        const t = makeTally({ pair, matchup })
        const score = scoreDraft(picksOf(BLUE_IDS), picksOf(RED_IDS), t)
        expect(score).not.toBeNull()
        expect(score!.synergyEdge).toBe(0)
        expect(score!.matchupEdge).toBe(0)
        expect(score!.probBlue).toBeCloseTo(0.5, 5)
    })

    it("clamps probBlue to 0.95 at most", () => {
        const pick = new Map<string, PickCell>()
        for (const [i, id] of BLUE_IDS.entries()) {
            pick.set(`${id}|${LANES[i]}`, cell(10, 10))
        }
        for (const [i, id] of RED_IDS.entries()) {
            pick.set(`${id}|${LANES[i]}`, cell(0, 10, 10))
        }
        const pair = new Map<string, PickCell>()
        for (let i = 0; i < BLUE_IDS.length; i++) {
            for (let j = i + 1; j < BLUE_IDS.length; j++) {
                pair.set([BLUE_IDS[i], BLUE_IDS[j]].sort().join("+"), cell(10, 10))
            }
        }
        for (let i = 0; i < RED_IDS.length; i++) {
            for (let j = i + 1; j < RED_IDS.length; j++) {
                pair.set([RED_IDS[i], RED_IDS[j]].sort().join("+"), cell(0, 10))
            }
        }
        const matchup = new Map<string, PickCell>()
        for (const b of BLUE_IDS) {
            for (const r of RED_IDS) {
                matchup.set(`${b}|${r}`, cell(10, 10))
            }
        }
        const t = makeTally({ pick, pair, matchup })
        const score = scoreDraft(picksOf(BLUE_IDS), picksOf(RED_IDS), t)
        expect(score).not.toBeNull()
        expect(score!.probBlue).toBe(0.95)
    })
})

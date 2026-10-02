import { describe, expect, it } from "vitest"

import { buildSeries } from "./export"
import { parseImport } from "./import"
import { DRAFT_SEQUENCE } from "./sequence"
import type { DraftMeta, FilledStep, Lane } from "./types"

const PICK_LANES: Array<Lane> = ["ta_than", "rung", "giua", "rong_xa", "rong_ho_tro"]

/** 18 slug tướng khác nhau, đủ cho một ván. */
const HEROES = [
    "nakroth", "tulen", "lauriel", "yorn",
    "charlotte", "cresht", "eland-orr", "arduin", "allain", "annette",
    "yue", "grakk", "liliana", "elsu",
    "zata", "quillen", "dolia", "volkath",
]

const baseMeta: DraftMeta = {
    tournamentName: "APL 2026",
    patchId: "p_1",
    format: "BO5",
    playedAt: "2026-06-18",
    vanNumber: 2,
    teamBlueName: "FPT",
    teamRedName: "One Star",
    winner: "red",
    durationSeconds: 1234,
    isBlindPick: false,
}

const makeFilled = (): Array<FilledStep> =>
    DRAFT_SEQUENCE.map((step, i) => ({
        heroId: HEROES[i],
        lane: step.action === "pick" ? PICK_LANES[i % PICK_LANES.length] : null,
    }))

describe("parseImport", () => {
    it("đọc ngược JSON export ra đúng meta + 18 ô hero/lane", () => {
        const filled = makeFilled()
        const json = JSON.stringify(buildSeries(baseMeta, filled))

        const { meta, filled: parsedFilled } = parseImport(json)

        expect(parsedFilled).toEqual(filled)
        expect(meta.tournamentName).toBe("APL 2026")
        expect(meta.patchId).toBe("p_1")
        expect(meta.format).toBe("BO5")
        expect(meta.playedAt).toBe("2026-06-18")
        expect(meta.vanNumber).toBe(2)
        expect(meta.teamBlueName).toBe("fpt")
        expect(meta.teamRedName).toBe("one star")
        expect(meta.winner).toBe("red")
        expect(meta.durationSeconds).toBe(1234)
        expect(meta.isBlindPick).toBe(false)
    })

    it("chấp nhận cả mảng Series (lấy phần tử đầu)", () => {
        const json = JSON.stringify([buildSeries(baseMeta, makeFilled())])
        const { meta } = parseImport(json)
        expect(meta.tournamentName).toBe("APL 2026")
    })

    it("báo lỗi khi JSON hỏng hoặc thiếu matches/draft_actions", () => {
        expect(() => parseImport("not json")).toThrow()
        expect(() => parseImport("{}")).toThrow(/matches/)
        expect(() => parseImport('{"matches":[{}]}')).toThrow(/draft_actions/)
    })
})

import { describe, expect, it } from "vitest"
import { decodeDraft, encodeDraft, type DraftSlot } from "../draftUrl"

const slot = (
    index: number,
    heroId: string | null,
    lane: DraftSlot["lane"] = null,
): DraftSlot => ({ index, heroId, lane })

describe("encodeDraft", () => {
    it("returns empty string when nothing is filled", () => {
        expect(encodeDraft([])).toBe("")
        expect(encodeDraft([slot(0, null), slot(4, null, "giua")])).toBe("")
    })

    it("encodes only filled slots, lane optional", () => {
        const slots = [
            slot(0, "tulen"), // ban — không lane
            slot(4, "liliana", "giua"),
            slot(5, null), // ô trống — bỏ
            slot(6, "nakroth", "rung"),
        ]
        expect(encodeDraft(slots)).toBe("0:tulen,4:liliana:giua,6:nakroth:rung")
    })
})

describe("decodeDraft", () => {
    it("returns [] for null/undefined/empty input", () => {
        expect(decodeDraft(null)).toEqual([])
        expect(decodeDraft(undefined)).toEqual([])
        expect(decodeDraft("")).toEqual([])
    })

    it("roundtrips encode -> decode", () => {
        const slots = [
            slot(0, "tulen"),
            slot(4, "liliana", "giua"),
            slot(6, "nakroth", "rung"),
            slot(17, "keera", "rong_xa"),
        ]
        expect(decodeDraft(encodeDraft(slots))).toEqual(slots)
    })

    it("skips malformed tokens and out-of-range indices", () => {
        const raw = "abc,18:x,-1:y,:hero,4:,4:liliana:giua"
        expect(decodeDraft(raw)).toEqual([slot(4, "liliana", "giua")])
    })

    it("keeps the pick but nulls an invalid lane", () => {
        expect(decodeDraft("5:yorn:top")).toEqual([slot(5, "yorn", null)])
        expect(decodeDraft("5:yorn:")).toEqual([slot(5, "yorn", null)])
    })

    it("later token wins on duplicate index and result is sorted by index", () => {
        expect(decodeDraft("9:b,4:a:giua,9:c")).toEqual([
            slot(4, "a", "giua"),
            slot(9, "c"),
        ])
    })
})

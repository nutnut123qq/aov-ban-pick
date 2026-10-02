import { describe, expect, it } from "vitest"

import { formatSec } from "../format"

describe("formatSec", () => {
    it("formats whole seconds as m′ss″", () => {
        expect(formatSec(754)).toBe("12′34″")
        expect(formatSec(90)).toBe("1′30″")
        expect(formatSec(0)).toBe("0′00″")
    })

    it("never displays :60 — rounding normalizes into minutes", () => {
        expect(formatSec(719.6)).toBe("12′00″")
        expect(formatSec(59.9)).toBe("1′00″")
        expect(formatSec(3599.5)).toBe("60′00″")
    })

    it("clamps non-finite and negative input to 0", () => {
        expect(formatSec(Number.NaN)).toBe("0′00″")
        expect(formatSec(-5)).toBe("0′00″")
        expect(formatSec(Number.POSITIVE_INFINITY)).toBe("0′00″")
    })
})

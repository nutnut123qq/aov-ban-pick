import { describe, expect, it } from "vitest"
import {
    bayesSmoothedRate,
    confidenceFromSample,
    SAMPLE_THRESHOLDS,
    wilsonInterval,
} from "../statistics"

describe("statistics module", () => {
    describe("confidenceFromSample", () => {
        it("returns 'low' when sample size is below medium threshold", () => {
            expect(confidenceFromSample(0)).toBe("low")
            expect(confidenceFromSample(SAMPLE_THRESHOLDS.medium - 1)).toBe("low")
            expect(confidenceFromSample(9)).toBe("low")
        })

        it("returns 'medium' when sample size is between medium and high thresholds", () => {
            expect(confidenceFromSample(SAMPLE_THRESHOLDS.medium)).toBe("medium")
            expect(confidenceFromSample(15)).toBe("medium")
            expect(confidenceFromSample(SAMPLE_THRESHOLDS.high - 1)).toBe("medium")
        })

        it("returns 'high' when sample size is at or above high threshold", () => {
            expect(confidenceFromSample(SAMPLE_THRESHOLDS.high)).toBe("high")
            expect(confidenceFromSample(50)).toBe("high")
            expect(confidenceFromSample(1000)).toBe("high")
        })
    })

    describe("wilsonInterval", () => {
        it("returns { low: 0, high: 0 } when total is 0 or negative", () => {
            expect(wilsonInterval(0, 0)).toEqual({ low: 0, high: 0 })
            expect(wilsonInterval(5, -1)).toEqual({ low: 0, high: 0 })
        })

        it("computes accurate 95% Wilson confidence intervals for sample proportions", () => {
            // 50% winrate in 100 games
            const res100 = wilsonInterval(50, 100)
            expect(res100.low).toBeGreaterThan(0.4)
            expect(res100.high).toBeLessThan(0.6)
            expect(res100.low).toBeLessThan(0.5)
            expect(res100.high).toBeGreaterThan(0.5)

            // 100% winrate in 1 game (1/1) - should not give [1, 1], lower bound should be pulled down
            const res1 = wilsonInterval(1, 1)
            expect(res1.low).toBeGreaterThan(0.0)
            expect(res1.low).toBeLessThan(0.5)
            expect(res1.high).toBeCloseTo(1.0, 1)

            // 0% winrate in 1 game (0/1)
            const res0 = wilsonInterval(0, 1)
            expect(res0.low).toBe(0)
            expect(res0.high).toBeGreaterThan(0.5)
        })

        it("narrows interval as sample size increases", () => {
            const small = wilsonInterval(5, 10)
            const large = wilsonInterval(500, 1000)

            const smallWidth = small.high - small.low
            const largeWidth = large.high - large.low

            expect(largeWidth).toBeLessThan(smallWidth)
        })
    })

    describe("bayesSmoothedRate", () => {
        it("smooths small sample winrates towards the prior mean", () => {
            const priorMean = 0.5
            const priorStrength = 10

            // 1-0 record (100% raw) should be pulled down significantly towards 0.5
            const smoothed1_1 = bayesSmoothedRate(1, 1, priorMean, priorStrength)
            // formula: (1 + 5) / (1 + 10) = 6 / 11 ~= 0.545
            expect(smoothed1_1).toBeCloseTo(6 / 11, 4)
            expect(smoothed1_1).toBeLessThan(0.6)

            // 0-1 record (0% raw) should be pulled up towards 0.5
            const smoothed0_1 = bayesSmoothedRate(0, 1, priorMean, priorStrength)
            // formula: (0 + 5) / (1 + 10) = 5 / 11 ~= 0.455
            expect(smoothed0_1).toBeCloseTo(5 / 11, 4)
            expect(smoothed0_1).toBeGreaterThan(0.4)
        })

        it("converges to empirical rate as sample size grows large", () => {
            const priorMean = 0.5
            const priorStrength = 10

            // 70 wins out of 100 matches (70% raw)
            const smoothedLarge = bayesSmoothedRate(70, 100, priorMean, priorStrength)
            // formula: (70 + 5) / (100 + 10) = 75 / 110 ~= 0.6818
            expect(smoothedLarge).toBeCloseTo(0.6818, 2)
            expect(Math.abs(smoothedLarge - 0.7)).toBeLessThan(0.03)
        })
    })
})

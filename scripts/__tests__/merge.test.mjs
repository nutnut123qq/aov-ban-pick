import { describe, expect, it } from "vitest"

import { mergeIntoSeason, seriesWinnerByGames } from "../merge.mjs"

const BT = "team_bacon_time"
const KOG = "team_king_of_gamers_club"
const ID = "s_rov_pro_league_2026_winter_2026_10_02_bacon_timevsking_of_gamers_club"

/** Ván tối giản — merge không đọc draft_actions, chỉ van_number + winner. */
const game = (van, winner) => ({
    van_number: van,
    team_blue_id: BT,
    team_red_id: KOG,
    winner_team_id: winner,
    is_blind_pick: false,
    draft_actions: [],
})

/** Series RPL 2026-10-02 BT vs KOG; mặc định = bản lưu sau ván 1 (BT thắng, BO3). */
const series = (matches, extra = {}) => ({
    id: ID,
    tournament_name: "RoV Pro League 2026 Winter",
    patch_id: "rpl2026_winter",
    format: "BO3",
    team_blue_id: BT,
    team_red_id: KOG,
    winner_team_id: BT,
    played_at: "2026-10-02",
    matches,
    ...extra,
})

describe("mergeIntoSeason", () => {
    it("adding van 2-4 to a series stored after van 1 flips the winner (KOG 3-1)", () => {
        const stored = [series([game(1, BT)])]
        const incoming = [series([game(1, BT), game(2, KOG), game(3, KOG), game(4, KOG)], {
            format: "BO5",
            winner_team_id: KOG,
        })]

        const r = mergeIntoSeason(stored, incoming)

        expect(r.newMatches).toBe(3)
        expect(r.winnerChanged).toBe(1)
        expect(r.seasonData[0].winner_team_id).toBe(KOG)
        expect(r.seasonData[0].matches.map((m) => m.van_number)).toEqual([1, 2, 3, 4])
        expect(stored[0].matches).toHaveLength(1) // input không bị đụng
    })

    it("updates format from incoming even when no game is new", () => {
        const stored = [series([game(1, BT), game(2, BT), game(3, KOG), game(4, BT)])]
        const incoming = [series([game(1, BT), game(2, BT), game(3, KOG), game(4, BT)], { format: "BO5" })]

        const r = mergeIntoSeason(stored, incoming)

        expect(r.newMatches).toBe(0)
        expect(r.formatChanged).toBe(1)
        expect(r.seasonData[0].format).toBe("BO5")
    })

    it("re-running with identical input changes nothing", () => {
        const incoming = [series([game(1, BT), game(2, KOG), game(3, KOG), game(4, KOG)], {
            format: "BO5",
            winner_team_id: KOG,
        })]
        const once = mergeIntoSeason([series([game(1, BT)])], incoming).seasonData

        const r = mergeIntoSeason(once, incoming)

        expect(r).toMatchObject({ newSeries: 0, newMatches: 0, overwritten: 0, formatChanged: 0, winnerChanged: 0 })
        expect(r.seasonData).toEqual(once)
    })

    it("never overwrites an existing game without force", () => {
        const stored = [series([game(1, BT)])]
        const incoming = [series([game(1, KOG)])]

        const kept = mergeIntoSeason(stored, incoming)
        expect(kept.skipped).toBe(1)
        expect(kept.seasonData[0].matches[0].winner_team_id).toBe(BT)
        expect(kept.seasonData[0].winner_team_id).toBe(BT)

        const forced = mergeIntoSeason(stored, incoming, { force: true })
        expect(forced.overwritten).toBe(1)
        expect(forced.seasonData[0].matches[0].winner_team_id).toBe(KOG)
        expect(forced.seasonData[0].winner_team_id).toBe(KOG)
    })

    it("on a tie of stored games, takes the export's winner (LP game with broken draft was skipped)", () => {
        // Ca thật RPL 2026-09-11 BT vs FULL SENSE: ván 4 bị bỏ → lưu 2-2, LP ghi FS thắng 3-2
        const games = [game(1, BT), game(2, BT), game(3, KOG), game(5, KOG)]
        const r = mergeIntoSeason([series(games, { format: "BO5" })], [series(games, { format: "BO5", winner_team_id: KOG })])
        expect(r.winnerChanged).toBe(1)
        expect(r.seasonData[0].winner_team_id).toBe(KOG)
    })

    it("does not let a stale export lower the format below the highest stored van", () => {
        const games = [game(1, BT), game(2, KOG), game(3, KOG), game(4, KOG)]
        const r = mergeIntoSeason([series(games, { format: "BO5", winner_team_id: KOG })], [series(games, { format: "BO3", winner_team_id: KOG })])
        expect(r.formatChanged).toBe(0)
        expect(r.seasonData[0].format).toBe("BO5")
    })
})

describe("seriesWinnerByGames", () => {
    it("returns the team with strictly more wins, null on tie/empty", () => {
        expect(seriesWinnerByGames([game(1, BT), game(2, KOG), game(3, KOG)])).toBe(KOG)
        expect(seriesWinnerByGames([game(1, BT), game(2, KOG)])).toBeNull()
        expect(seriesWinnerByGames([])).toBeNull()
    })
})

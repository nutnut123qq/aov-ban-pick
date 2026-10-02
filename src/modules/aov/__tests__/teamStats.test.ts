import { describe, expect, it } from "vitest"

import type { DraftAction, Series, TeamSide } from "@/modules/types"

import { getTeamDetail } from "../teamStats"

const pick = (turn: number, side: TeamSide, hero: string): DraftAction => ({
    turn_number: turn,
    pick_index: turn,
    team_side: side,
    action_type: "pick",
    hero_id: hero,
    lane_position: "giua",
    player_id: null,
    is_counter_pick: false,
})

const ban = (turn: number, side: TeamSide, hero: string): DraftAction => ({
    turn_number: turn,
    pick_index: null,
    team_side: side,
    action_type: "ban",
    hero_id: hero,
    lane_position: null,
    player_id: null,
    is_counter_pick: false,
})

// SGP vs FL — SGP đổi bên theo ván: blue (m1) → red (m2) → blue (m3)
const s1: Series = {
    id: "s1",
    tournament_name: "AOG 2025",
    patch_id: "1.54",
    format: "BO3",
    team_blue_id: "team_sgp",
    team_red_id: "team_fl",
    winner_team_id: "team_sgp",
    played_at: "2025-12-01",
    matches: [
        {
            van_number: 1,
            team_blue_id: "team_sgp",
            team_red_id: "team_fl",
            winner_team_id: "team_sgp",
            is_blind_pick: false,
            draft_actions: [
                pick(1, "blue", "tulen"),
                pick(2, "blue", "florentino"),
                pick(3, "red", "nakroth"),
                ban(4, "blue", "yena"),
                ban(5, "red", "zip"),
            ],
        },
        {
            van_number: 2,
            team_blue_id: "team_fl",
            team_red_id: "team_sgp",
            winner_team_id: "team_fl",
            is_blind_pick: false,
            draft_actions: [
                pick(1, "red", "tulen"),
                pick(2, "red", "nakroth"),
                pick(3, "blue", "hayate"),
                ban(4, "red", "airi"),
                ban(5, "blue", "tulen"),
            ],
        },
        {
            van_number: 3,
            team_blue_id: "team_sgp",
            team_red_id: "team_fl",
            winner_team_id: "team_sgp",
            is_blind_pick: false,
            draft_actions: [
                pick(1, "blue", "tulen"),
                pick(2, "blue", "florentino"),
                pick(3, "red", "hayate"),
                ban(4, "blue", "yena"),
                ban(5, "red", "zip"),
            ],
        },
    ],
}

// SGP (red) vs ONE — SGP thắng
const s2: Series = {
    id: "s2",
    tournament_name: "RPL 2026",
    patch_id: "1.55",
    format: "BO1",
    team_blue_id: "team_one",
    team_red_id: "team_sgp",
    winner_team_id: "team_sgp",
    played_at: "2026-01-10",
    matches: [
        {
            van_number: 1,
            team_blue_id: "team_one",
            team_red_id: "team_sgp",
            winner_team_id: "team_sgp",
            is_blind_pick: false,
            draft_actions: [
                pick(1, "red", "tulen"),
                pick(2, "red", "florentino"),
                pick(3, "blue", "veres"),
                ban(4, "red", "yena"),
                ban(5, "blue", "zip"),
            ],
        },
    ],
}

// Series không liên quan tới SGP — phải bị bỏ qua
const s3: Series = {
    id: "s3",
    tournament_name: "AOG 2025",
    patch_id: "1.54",
    format: "BO1",
    team_blue_id: "team_fl",
    team_red_id: "team_one",
    winner_team_id: "team_fl",
    played_at: "2025-12-20",
    matches: [
        {
            van_number: 1,
            team_blue_id: "team_fl",
            team_red_id: "team_one",
            winner_team_id: "team_fl",
            is_blind_pick: false,
            draft_actions: [pick(1, "blue", "tulen"), pick(2, "red", "florentino")],
        },
    ],
}

const mockSeries: Array<Series> = [s1, s2, s3]

describe("getTeamDetail", () => {
    it("trả null khi đội không xuất hiện", () => {
        expect(getTeamDetail(mockSeries, "team_unknown")).toBeNull()
        expect(getTeamDetail([], "team_sgp")).toBeNull()
    })

    it("tổng hợp record series + ván đúng", () => {
        const d = getTeamDetail(mockSeries, "team_sgp")
        expect(d).not.toBeNull()
        expect(d?.teamId).toBe("team_sgp")
        expect(d?.seriesPlayed).toBe(2)
        expect(d?.seriesWon).toBe(2)
        expect(d?.gameWon).toBe(3)
        expect(d?.gameLost).toBe(1)
    })

    it("heroPool quy pick/ban theo bên của từng match", () => {
        const d = getTeamDetail(mockSeries, "team_sgp")!

        // Tulen: pick ở m1 (blue), m2 (red), m3 (blue), s2m1 (red) → 4 picks, 3 wins
        // FL cấm tulen ở m2 → bansAgainst 1
        const tulen = d.heroPool.find((h) => h.heroId === "tulen")
        expect(tulen).toEqual({
            heroId: "tulen",
            picks: 4,
            wins: 3,
            bansByTeam: 0,
            bansAgainst: 1,
        })

        const florentino = d.heroPool.find((h) => h.heroId === "florentino")
        expect(florentino?.picks).toBe(3)
        expect(florentino?.wins).toBe(3)

        // Nakroth chỉ pick ở m2 khi SGP ở red và thua
        const nakroth = d.heroPool.find((h) => h.heroId === "nakroth")
        expect(nakroth?.picks).toBe(1)
        expect(nakroth?.wins).toBe(0)

        // Yena: SGP tự cấm 3 lần; zip: phe kia cấm 3 lần (không pick)
        const yena = d.heroPool.find((h) => h.heroId === "yena")
        expect(yena?.picks).toBe(0)
        expect(yena?.bansByTeam).toBe(3)
        const zip = d.heroPool.find((h) => h.heroId === "zip")
        expect(zip?.bansAgainst).toBe(3)

        // Sort picks desc — tulen đầu bảng; hero của đối thủ (veres, hayate) không lẫn pick
        expect(d.heroPool[0].heroId).toBe("tulen")
        expect(d.heroPool.find((h) => h.heroId === "veres")?.picks ?? 0).toBe(0)
        expect(d.heroPool.find((h) => h.heroId === "hayate")?.picks ?? 0).toBe(0)
    })

    it("combos chỉ giữ cặp n>=3, sort wins desc", () => {
        const d = getTeamDetail(mockSeries, "team_sgp")!
        expect(d.combos).toEqual([{ a: "florentino", b: "tulen", n: 3, wins: 3 }])
    })

    it("seasons group theo tournament_name", () => {
        const d = getTeamDetail(mockSeries, "team_sgp")!
        const aog = d.seasons.find((s) => s.tournamentName === "AOG 2025")
        expect(aog).toEqual({
            tournamentName: "AOG 2025",
            seriesWon: 1,
            seriesLost: 0,
            gameWon: 2,
            gameLost: 1,
        })
        const rpl = d.seasons.find((s) => s.tournamentName === "RPL 2026")
        expect(rpl).toEqual({
            tournamentName: "RPL 2026",
            seriesWon: 1,
            seriesLost: 0,
            gameWon: 1,
            gameLost: 0,
        })
        // Không tính series của đội khác vào cùng giải
        expect(aog?.seriesWon).toBe(1)
    })

    it("opponents là thành tích đối đầu theo series", () => {
        const d = getTeamDetail(mockSeries, "team_sgp")!
        expect(d.opponents).toEqual([
            { teamId: "team_fl", won: 1, lost: 0 },
            { teamId: "team_one", won: 1, lost: 0 },
        ])
    })

    it("recent sort played_at desc", () => {
        const d = getTeamDetail(mockSeries, "team_sgp")!
        expect(d.recent.map((s) => s.id)).toEqual(["s2", "s1"])
    })
})

/**
 * Ánh xạ `tournament_name` (chuẩn Liquipedia) → giải đấu + khu vực.
 * Dữ liệu import từ nhiều khu vực (VN/TH/TW/quốc tế); map này dùng để
 * group và lọc theo khu vực mà không cần đụng schema dữ liệu.
 */

/** Khu vực của giải đấu. */
export type LeagueRegion = "vn" | "intl" | "th" | "tw" | "other"

/** Thông tin giải sau khi map. */
export interface LeagueInfo {
    /** Mã giải ngắn (AOG, APL, RPL, GCS…). */
    league: string
    /** Khu vực — key vào `regions.*` i18n. */
    region: LeagueRegion
}

/** Thứ tự hiển thị khu vực trong các select. */
export const REGION_ORDER: Array<LeagueRegion> = ["vn", "intl", "th", "tw", "other"]

const LEAGUES: Array<{ match: RegExp; league: string; region: LeagueRegion }> = [
    { match: /arena of glory/i, league: "AOG", region: "vn" },
    { match: /arena of valor premier league/i, league: "APL", region: "intl" },
    { match: /rov pro league/i, league: "RPL", region: "th" },
    { match: /garena challenger series/i, league: "GCS", region: "tw" },
]

/** Map tên giải LP → giải/khu vực; fallback "other" khi chưa biết. */
export const leagueOf = (tournamentName: string): LeagueInfo => {
    const hit = LEAGUES.find((l) => l.match.test(tournamentName))
    return { league: hit?.league ?? "?", region: hit?.region ?? "other" }
}

/**
 * Group danh sách tên giải theo khu vực (theo `REGION_ORDER`),
 * phục vụ SelectGroup trong các dropdown giải đấu.
 */
export const groupTournamentsByRegion = (
    tournaments: Array<string>,
): Array<{ region: LeagueRegion; tournaments: Array<string> }> => {
    const map = new Map<LeagueRegion, Array<string>>()
    for (const name of tournaments) {
        const { region } = leagueOf(name)
        const arr = map.get(region) ?? []
        arr.push(name)
        map.set(region, arr)
    }
    return REGION_ORDER.filter((r) => map.has(r)).map((r) => ({
        region: r,
        tournaments: map.get(r)!.sort(),
    }))
}

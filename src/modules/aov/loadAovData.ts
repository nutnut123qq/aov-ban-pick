import {
    DataIndexSchema,
    HeroManifestListSchema,
    SeriesListSchema,
    type HeroManifest,
    type Series,
} from "@/modules/types"

/** Toàn bộ dữ liệu tĩnh đã tải về browser. */
export interface AovData {
    /** Catalog tướng (slug/file/name). */
    heroes: Array<HeroManifest>
    /** Mọi series gộp từ các file mùa liệt kê trong index.json. */
    series: Array<Series>
}

/** Fetch + parse JSON; ném lỗi rõ ràng nếu HTTP không OK. */
const fetchJson = async <T>(url: string): Promise<T> => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`[AOV Data Loader] ${url} → HTTP ${res.status}`)
    return (await res.json()) as T
}

/**
 * Tải dữ liệu draft tĩnh: catalog tướng + mọi file mùa trong `public/data/index.json`.
 * Tích hợp Zod parser validation runtime để fail fast nếu dữ liệu bị lỗi.
 * @returns catalog tướng + danh sách series đã gộp phẳng
 */
export const loadAovData = async (): Promise<AovData> => {
    const [rawHeroes, rawIndex] = await Promise.all([
        fetchJson<unknown>("/images/heroes/manifest.json"),
        fetchJson<unknown>("/data/index.json"),
    ])

    const heroesParsed = HeroManifestListSchema.safeParse(rawHeroes)
    if (!heroesParsed.success) {
        throw new Error(
            `[AOV Data Loader] Lỗi cấu trúc manifest tướng: ${heroesParsed.error.message}`,
        )
    }

    const indexParsed = DataIndexSchema.safeParse(rawIndex)
    if (!indexParsed.success) {
        throw new Error(
            `[AOV Data Loader] Lỗi cấu trúc index.json: ${indexParsed.error.message}`,
        )
    }

    const seasons = await Promise.all(
        (indexParsed.data.matches ?? []).map(async (id) => {
            const rawSeriesList = await fetchJson<unknown>(`/data/matches/${id}.json`)
            const seriesParsed = SeriesListSchema.safeParse(rawSeriesList)
            if (!seriesParsed.success) {
                throw new Error(
                    `[AOV Data Loader] File /data/matches/${id}.json không hợp lệ: ${seriesParsed.error.message}`,
                )
            }
            return seriesParsed.data as Array<Series>
        }),
    )

    return {
        heroes: heroesParsed.data as Array<HeroManifest>,
        series: seasons.flat(),
    }
}


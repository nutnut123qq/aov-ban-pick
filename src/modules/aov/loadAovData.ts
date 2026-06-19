import type { DataIndex, HeroManifest, Series } from "@/modules/types"

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
    if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`)
    return (await res.json()) as T
}

/**
 * Tải dữ liệu draft tĩnh: catalog tướng + mọi file mùa trong `public/data/index.json`.
 * Chạy ở browser (đường dẫn tương đối tới `public/`). Không đụng tới backend.
 * @returns catalog tướng + danh sách series đã gộp phẳng
 */
export const loadAovData = async (): Promise<AovData> => {
    const [heroes, index] = await Promise.all([
        fetchJson<Array<HeroManifest>>("/images/heroes/manifest.json"),
        fetchJson<DataIndex>("/data/index.json"),
    ])

    const seasons = await Promise.all(
        (index.matches ?? []).map((id) => fetchJson<Array<Series>>(`/data/matches/${id}.json`)),
    )

    return { heroes, series: seasons.flat() }
}

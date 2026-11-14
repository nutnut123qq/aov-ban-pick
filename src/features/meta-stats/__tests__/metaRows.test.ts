import { describe, expect, it } from "vitest"
import type { MetaRow } from "@/modules/aov"
import { filterSortRows, META_PAGE_SIZE, paginate } from "../metaRows"

/** 60 dòng: picks giảm dần theo i, winRate tăng dần theo i; tên "Hero 0".."Hero 59". */
const rows: Array<MetaRow> = Array.from({ length: 60 }, (_, i) => ({
    heroId: `h${i}`,
    heroName: `Hero ${i}`,
    heroFile: null,
    lane: "giua",
    picks: 100 - i,
    wins: 0,
    winRate: i / 100,
    pickRate: 0,
    banRate: 0,
    wrBlue: null,
    wrRed: null,
    avgWinSec: null,
}))

describe("filterSortRows + paginate", () => {
    it("sắp xếp toàn bộ tập trước khi cắt trang", () => {
        const sorted = filterSortRows(rows, "", { column: "winRate", direction: "desc" })
        const first = paginate(sorted, 0)
        const second = paginate(sorted, 1)
        // WR cao nhất toàn tập (Hero 59) nằm đầu trang 1, không phải WR cao nhất của 25 dòng đầu.
        expect(first.pageRows[0].heroId).toBe("h59")
        expect(second.pageRows[0].heroId).toBe(`h${59 - META_PAGE_SIZE}`)
        expect(first.pageCount).toBe(3)
    })

    it("lọc toàn bộ tập trước khi cắt trang và giữ đủ mọi kết quả qua các trang", () => {
        // "Hero 1" khớp Hero 1, 10..19 → 11 dòng nằm rải ở trang 1 lẫn ngoài trang 1 của tập gốc.
        const filtered = filterSortRows(rows, "hero 1", { column: null, direction: "desc" })
        expect(filtered).toHaveLength(11)
        const { pageRows, pageCount } = paginate(filtered, 0)
        expect(pageCount).toBe(1)
        expect(pageRows.map((r) => r.heroId)).toEqual(filtered.map((r) => r.heroId))
    })

    it("kẹp trang về trang cuối hợp lệ khi bộ lọc làm tập ngắn lại", () => {
        const all = paginate(rows, 2)
        expect(all.page).toBe(2)
        expect(all.pageRows).toHaveLength(60 - 2 * META_PAGE_SIZE)
        const narrowed = paginate(filterSortRows(rows, "hero 5", { column: null, direction: "desc" }), 2)
        expect(narrowed.page).toBe(0)
        expect(narrowed.pageRows.length).toBeGreaterThan(0)
    })

    it("tập rỗng vẫn có đúng 1 trang rỗng", () => {
        const empty = paginate(filterSortRows(rows, "không có", { column: null, direction: "desc" }), 3)
        expect(empty).toEqual({ pageRows: [], page: 0, pageCount: 1 })
    })
})

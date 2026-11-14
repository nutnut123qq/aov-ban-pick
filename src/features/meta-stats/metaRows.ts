import type { MetaRow } from "@/modules/aov"

/** Cột bảng tướng có thể sắp xếp. */
export type MetaSortColumn = "picks" | "winRate" | "pickRate" | "banRate"

/** Trạng thái sắp xếp; `column: null` = giữ thứ tự mặc định của aggregateMeta. */
export interface MetaSort {
    /** Cột đang sắp xếp. */
    column: MetaSortColumn | null
    /** Chiều sắp xếp. */
    direction: "asc" | "desc"
}

/** Số dòng mỗi trang của bảng tướng (cả table desktop lẫn card mobile). */
export const META_PAGE_SIZE = 25

/** Lọc theo tên tướng + sắp xếp trên TOÀN BỘ dòng — luôn chạy trước khi phân trang. */
export const filterSortRows = (
    rows: Array<MetaRow>,
    query: string,
    sort: MetaSort,
): Array<MetaRow> => {
    let filtered = rows
    const q = query.trim().toLowerCase()
    if (q) filtered = filtered.filter((r) => r.heroName.toLowerCase().includes(q))
    if (sort.column) {
        const col = sort.column
        const dir = sort.direction === "asc" ? 1 : -1
        filtered = [...filtered].sort((a, b) => {
            if (a[col] < b[col]) return -1 * dir
            if (a[col] > b[col]) return 1 * dir
            return b.picks - a.picks
        })
    }
    return filtered
}

/** Cắt một trang; `page` (0-based) được kẹp vào [0, pageCount - 1], tập rỗng vẫn có 1 trang. */
export const paginate = <T>(rows: Array<T>, page: number, size = META_PAGE_SIZE) => {
    const pageCount = Math.max(1, Math.ceil(rows.length / size))
    const current = Math.min(Math.max(0, page), pageCount - 1)
    return {
        pageRows: rows.slice(current * size, (current + 1) * size),
        page: current,
        pageCount,
    }
}

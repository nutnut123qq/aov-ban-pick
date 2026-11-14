import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

import { LANE_OPTIONS } from "@/modules/aov"
import type { Lane } from "@/modules/types"
import type { MetaSort, MetaSortColumn } from "./metaRows"

/** Nhóm phân tích (tab) của trang Meta. */
export type MetaViewName = "heroes" | "synergy" | "matchup" | "duo"

const VIEWS: Array<MetaViewName> = ["heroes", "synergy", "matchup", "duo"]
const SORT_COLUMNS: Array<MetaSortColumn> = ["picks", "winRate", "pickRate", "banRate"]
const LANES: Array<Lane> = LANE_OPTIONS.map((o) => o.value)

/** Cặp lane mặc định của bảng duo — Rừng × Giữa, duo phổ biến nhất. */
export const DEFAULT_DUO = "rung|giua"

/** Trạng thái màn Meta, giữ trên URL để Back từ trang tướng trở về đúng ngữ cảnh. */
export interface MetaParams {
    /** Tab đang xem. */
    view: MetaViewName
    /** Giải đang lọc ([] = mọi giải). */
    tournaments: Array<string>
    /** Vị trí đang lọc. */
    lane: Lane | "all"
    /** Ô tìm tướng. */
    query: string
    /** Sắp xếp bảng tướng. */
    sort: MetaSort
    /** Trang bảng tướng, 0-based (URL ghi 1-based). */
    page: number
    /** Cặp lane của bảng duo, dạng `laneA|laneB` theo thứ tự LANE_OPTIONS. */
    duoPair: string
    /** Đang so sánh 2 bộ giải. */
    compare: boolean
    /** Bộ giải A khi so sánh. */
    tournamentsA: Array<string>
    /** Bộ giải B khi so sánh. */
    tournamentsB: Array<string>
}

/** Đọc query (người dùng sửa được) — giá trị lạ rơi về mặc định. */
export const parseMetaParams = (sp: URLSearchParams): MetaParams => {
    const page = Number.parseInt(sp.get("page") ?? "", 10)
    const [da, db] = (sp.get("duo") ?? "").split("|")
    const ia = LANES.indexOf(da as Lane)
    const ib = LANES.indexOf(db as Lane)
    return {
        view: VIEWS.find((v) => v === sp.get("view")) ?? "heroes",
        tournaments: sp.getAll("t"),
        lane: LANES.find((l) => l === sp.get("lane")) ?? "all",
        query: sp.get("q") ?? "",
        sort: {
            column: SORT_COLUMNS.find((c) => c === sp.get("sort")) ?? null,
            direction: sp.get("dir") === "asc" ? "asc" : "desc",
        },
        page: page > 1 ? page - 1 : 0,
        duoPair: ia >= 0 && ia < ib ? `${da}|${db}` : DEFAULT_DUO,
        compare: sp.get("cmp") === "1",
        tournamentsA: sp.getAll("a"),
        tournamentsB: sp.getAll("b"),
    }
}

/** Ghi trạng thái thành query; bỏ giá trị mặc định cho URL gọn. */
export const toMetaQuery = (s: MetaParams): string => {
    const p = new URLSearchParams()
    if (s.view !== "heroes") p.set("view", s.view)
    for (const n of s.tournaments) p.append("t", n)
    if (s.lane !== "all") p.set("lane", s.lane)
    if (s.query) p.set("q", s.query)
    if (s.sort.column) {
        p.set("sort", s.sort.column)
        if (s.sort.direction === "asc") p.set("dir", "asc")
    }
    if (s.page > 0) p.set("page", String(s.page + 1))
    if (s.duoPair !== DEFAULT_DUO) p.set("duo", s.duoPair)
    if (s.compare) {
        p.set("cmp", "1")
        for (const n of s.tournamentsA) p.append("a", n)
        for (const n of s.tournamentsB) p.append("b", n)
    }
    return p.toString()
}

/**
 * State màn Meta đồng bộ với URL (replaceState). Khởi tạo một lần từ URL nên Back
 * từ trang tướng khôi phục đúng trang/bộ lọc; chỉ `changeFilter` (thao tác người dùng)
 * mới đưa về trang 1.
 */
export const useMetaParams = () => {
    const searchParams = useSearchParams()
    const [params, setParams] = useState(() => parseMetaParams(searchParams))

    useEffect(() => {
        const qs = toMetaQuery(params)
        if (window.location.search === (qs ? `?${qs}` : "")) return
        window.history.replaceState(
            null,
            "",
            `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`,
        )
    }, [params])

    return {
        ...params,
        /** Đổi tab/trang/so sánh/duo — giữ nguyên trang hiện tại. */
        update: (patch: Partial<MetaParams>) => setParams((p) => ({ ...p, ...patch })),
        /** Người dùng đổi bộ lọc hoặc sắp xếp → luôn về trang 1, kể cả khi quay lại giá trị cũ. */
        changeFilter: (patch: Partial<Pick<MetaParams, "tournaments" | "lane" | "query" | "sort">>) =>
            setParams((p) => ({ ...p, ...patch, page: 0 })),
    }
}

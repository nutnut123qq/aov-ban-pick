/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useMetaParams } from "../useMetaParams"

// useSearchParams đọc URL thật của jsdom — giống router khi Back khôi phục entry lịch sử.
vi.mock("next/navigation", () => ({
    useSearchParams: () => new URLSearchParams(window.location.search),
}))

const go = (url: string) => window.history.replaceState(null, "", url)

describe("useMetaParams — state trang Meta (lỗi review Codex)", () => {
    beforeEach(() => go("/vi/meta"))

    it("trang 2 → tìm → xoá ô tìm: về trang 1, không hồi sinh trang 2", () => {
        const { result } = renderHook(() => useMetaParams())
        act(() => result.current.update({ page: 1 }))
        expect(result.current.page).toBe(1)
        expect(window.location.search).toBe("?page=2")

        act(() => result.current.changeFilter({ query: "Y'bneth" }))
        expect(result.current.page).toBe(0)
        act(() => result.current.changeFilter({ query: "" }))
        expect(result.current.page).toBe(0)
        expect(window.location.search).toBe("")
    })

    it("đổi sort rồi đổi lại như cũ vẫn ở trang 1", () => {
        const { result } = renderHook(() => useMetaParams())
        act(() => result.current.update({ page: 3 }))
        act(() => result.current.changeFilter({ sort: { column: "winRate", direction: "desc" } }))
        act(() => result.current.changeFilter({ sort: { column: null, direction: "desc" } }))
        expect(result.current.page).toBe(0)
    })

    it("mount từ URL (Back từ trang tướng) khôi phục trang + bộ lọc, không reset trang", () => {
        go("/vi/meta?view=synergy&t=APL+2026&lane=rung&q=an&sort=winRate&dir=asc&page=2&duo=giua|rong_xa")
        const { result } = renderHook(() => useMetaParams())
        expect(result.current).toMatchObject({
            view: "synergy",
            tournaments: ["APL 2026"],
            lane: "rung",
            query: "an",
            sort: { column: "winRate", direction: "asc" },
            page: 1,
            duoPair: "giua|rong_xa",
            compare: false,
        })
        // Effect ghi URL không được làm mất trang vừa khôi phục.
        expect(new URLSearchParams(window.location.search).get("page")).toBe("2")
    })

    it("khôi phục chế độ so sánh A/B", () => {
        go("/vi/meta?cmp=1&a=A1&a=A2&b=B1")
        const { result } = renderHook(() => useMetaParams())
        expect(result.current).toMatchObject({ compare: true, tournamentsA: ["A1", "A2"], tournamentsB: ["B1"] })
    })

    it("mở trực tiếp không có query → mặc định, URL vẫn sạch", () => {
        const { result } = renderHook(() => useMetaParams())
        expect(result.current).toMatchObject({
            view: "heroes",
            tournaments: [],
            lane: "all",
            query: "",
            sort: { column: null, direction: "desc" },
            page: 0,
            duoPair: "rung|giua",
            compare: false,
        })
        expect(window.location.search).toBe("")
    })

    it("query không hợp lệ rơi về mặc định", () => {
        go("/vi/meta?view=x&lane=bogus&sort=evil&page=-3&duo=giua|rung")
        const { result } = renderHook(() => useMetaParams())
        expect(result.current).toMatchObject({
            view: "heroes",
            lane: "all",
            sort: { column: null },
            page: 0,
            duoPair: "rung|giua",
        })
    })
})

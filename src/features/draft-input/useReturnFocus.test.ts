/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { useReturnFocus } from "./useReturnFocus"

const make = <K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}) => {
    const el = document.createElement(tag)
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
    document.body.appendChild(el)
    return el
}

/** Mô phỏng vòng đời picker: opener có focus → mở (focus vào input) → đóng. */
const cycle = (fallback: HTMLElement | null, mutateOpener: (b: HTMLButtonElement) => void = () => {}) => {
    const opener = make("button")
    opener.focus()
    const { result } = renderHook(() => useReturnFocus({ current: fallback }))
    result.current.onOpenAutoFocus()
    make("input").focus()
    mutateOpener(opener)
    const close = new Event("focusScope.autoFocusOnUnmount", { cancelable: true })
    result.current.onCloseAutoFocus(close)
    return { opener, close }
}

describe("useReturnFocus — trả focus khi đóng picker", () => {
    afterEach(() => {
        document.body.innerHTML = ""
    })

    it("opener còn trong DOM → focus về opener", () => {
        const fallback = make("section", { tabindex: "-1" })
        const { opener, close } = cycle(fallback)
        expect(document.activeElement).toBe(opener)
        expect(close.defaultPrevented).toBe(true)
    })

    it("opener bị gỡ (chọn lượt cuối) → focus fallback còn kết nối DOM", () => {
        const fallback = make("section", { tabindex: "-1" })
        cycle(fallback, (b) => b.remove())
        expect(document.activeElement).toBe(fallback)
        expect(fallback.isConnected).toBe(true)
    })

    it("opener bị disabled → focus fallback", () => {
        const fallback = make("section", { tabindex: "-1" })
        cycle(fallback, (b) => {
            b.disabled = true
        })
        expect(document.activeElement).toBe(fallback)
    })

    it("không có fallback (draft-input) → không ném lỗi", () => {
        expect(() => cycle(null, (b) => b.remove())).not.toThrow()
    })
})

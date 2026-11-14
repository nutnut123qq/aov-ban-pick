import { useRef, type RefObject } from "react"

/**
 * Trả focus cho picker mở bằng state (không có Radix Trigger nên Radix không biết trả về đâu):
 * nhớ phần tử đang focus lúc mở; khi đóng thì focus lại nó. Nếu nó đã bị gỡ hoặc không nhận
 * focus (vd chọn lượt cuối làm nút "Chọn tướng" biến mất) thì focus `fallbackRef`.
 * Trả về handler gắn thẳng vào `DialogContent`/`SheetContent`.
 */
export const useReturnFocus = (fallbackRef?: RefObject<HTMLElement | null>) => {
    const openerRef = useRef<HTMLElement | null>(null)
    return {
        onOpenAutoFocus: () => {
            openerRef.current = document.activeElement as HTMLElement | null
        },
        onCloseAutoFocus: (e: Event) => {
            e.preventDefault()
            const opener = openerRef.current
            opener?.focus()
            if (!opener || document.activeElement !== opener) fallbackRef?.current?.focus()
        },
    }
}

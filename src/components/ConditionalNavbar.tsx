"use client"
import { usePathname } from "next/navigation"
import { Navbar } from "@/components/layouts"
import { useSyncExternalStore } from "react"

const subscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export const ConditionalNavbar = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname()
    const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)
    const showNavbar = !pathname?.includes("/learn/")

    // Prevent hydration mismatch: navbar chỉ render sau khi mount. Giữ fragment
    // luôn 2 vị trí (slot navbar + children) — nếu đổi cấu trúc cây (1 con → 2 con)
    // React sẽ unmount+remount toàn bộ trang sau hydration, phá state mount-once.
    return (
        <>
            {mounted && showNavbar ? <Navbar /> : null}
            {children}
        </>
    )
}

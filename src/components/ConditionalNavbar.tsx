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

    // Prevent hydration mismatch by rendering children only on server
    if (!mounted) {
        return <>{children}</>
    }

    return (
        <>
            {showNavbar && <Navbar />}
            {children}
        </>
    )
}

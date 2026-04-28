"use client"
import { usePathname } from "next/navigation"
import { Navbar } from "@/components/layouts"
import { useEffect, useState } from "react"

export const ConditionalNavbar = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)
    const [showNavbar, setShowNavbar] = useState(true)

    useEffect(() => {
        setMounted(true)
        // Hide navbar on learn pages
        setShowNavbar(!pathname?.includes("/learn/"))
    }, [pathname])

    // Prevent hydration mismatch
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

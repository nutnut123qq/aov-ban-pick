"use client"

import { usePathname } from "next/navigation"

export const useLocale = (): "en" | "vi" => {
    const pathname = usePathname()
    if (pathname.startsWith("/en")) return "en"
    return "vi"
}

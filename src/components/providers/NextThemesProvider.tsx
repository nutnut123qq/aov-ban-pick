"use client"
import React, { PropsWithChildren, useEffect } from "react"

interface NextThemesProviderProps extends PropsWithChildren {
    defaultTheme?: "dark" | "light" | "system"
    storageKey?: string
}

export const NextThemesProvider = ({
    children,
    defaultTheme = "dark",
    storageKey = "aov-theme",
}: NextThemesProviderProps) => {
    useEffect(() => {
        const storedTheme = localStorage.getItem(storageKey)
        const theme = storedTheme ?? defaultTheme
        const prefersDark = globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches
        const shouldUseDark = theme === "dark" || (theme === "system" && prefersDark)

        document.documentElement.classList.toggle("dark", shouldUseDark)
    }, [defaultTheme, storageKey])

    return <>{children}</>
}

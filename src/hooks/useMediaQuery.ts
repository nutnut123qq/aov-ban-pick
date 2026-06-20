"use client"

import { useSyncExternalStore } from "react"

const subscribe = (query: string) => (callback: () => void) => {
    const media = window.matchMedia(query)
    media.addEventListener("change", callback)
    return () => media.removeEventListener("change", callback)
}

const getSnapshot = (query: string) => () => window.matchMedia(query).matches
const getServerSnapshot = () => false

/** Hook trả về true nếu media query khớp. SSR-safe (mặc định false). */
export const useMediaQuery = (query: string): boolean => {
    return useSyncExternalStore(
        subscribe(query),
        getSnapshot(query),
        getServerSnapshot,
    )
}

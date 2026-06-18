"use client"

import { useSyncExternalStore } from "react"
import { useKeycloak } from "@/hooks/singleton"
import { getAccessToken, AUTH_TOKEN_CHANGED_EVENT } from "@/services/auth"
import { useAppSelector } from "@/redux/hooks"

const subscribe = (cb: () => void) => {
    if (typeof window === "undefined") return () => undefined
    window.addEventListener("storage", cb)
    window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, cb)
    return () => {
        window.removeEventListener("storage", cb)
        window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, cb)
    }
}

/**
 * Unified access-token source.
 *
 * The app supports two login flows:
 * - Keycloak redirect (keycloak-js instance holds the token), and
 * - the email/password modal (`SignInSection` → `saveTokens` → localStorage `access_token`).
 *
 * Pages that only read `useKeycloak().token` break after a modal login because the
 * keycloak-js instance is never authenticated. This hook resolves the token from
 * either source. `useSyncExternalStore` keeps the localStorage read SSR-safe (no
 * hydration mismatch); subscribing to the redux auth flag re-renders after a
 * same-tab modal login so the fresh token is picked up.
 */
export const useAuthToken = (): {
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    login: () => Promise<void>
} => {
    const kc = useKeycloak()
    // Re-render this consumer when the redux auth flag flips (same-tab modal login).
    useAppSelector((s) => s.user.authenticated)
    const stored = useSyncExternalStore(
        subscribe,
        () => getAccessToken(),
        () => null,
    )

    const token = kc.token ?? stored
    return {
        token,
        isAuthenticated: Boolean(token),
        isLoading: kc.isLoading,
        login: kc.login,
    }
}

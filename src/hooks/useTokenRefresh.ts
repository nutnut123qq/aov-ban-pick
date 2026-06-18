"use client"

import { useEffect, useRef } from "react"
import { jwtDecode } from "jwt-decode"
import {
    getAccessToken,
    refreshAccessToken,
    AUTH_TOKEN_CHANGED_EVENT,
} from "@/services/auth"

/** Refresh this many ms before the access token expires. */
const REFRESH_LEAD_MS = 30_000

/**
 * App-wide access-token auto-refresh.
 *
 * Decodes the stored access token's `exp` and schedules a Keycloak
 * `refresh_token` exchange ~30s before it expires, then reschedules on the
 * new token. Re-arms whenever the token changes (login / refresh / other tab).
 * Mount once near the app root.
 */
export const useTokenRefresh = () => {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        let cancelled = false

        const clear = () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
                timerRef.current = null
            }
        }

        const schedule = () => {
            clear()
            const token = getAccessToken()
            if (!token) return
            let expMs = 0
            try {
                const { exp } = jwtDecode<{ exp?: number }>(token)
                expMs = (exp ?? 0) * 1000
            } catch {
                return
            }
            const delay = Math.max(expMs - Date.now() - REFRESH_LEAD_MS, 1_000)
            timerRef.current = setTimeout(async () => {
                if (cancelled) return
                await refreshAccessToken()
                // saveTokens/clearTokens fire AUTH_TOKEN_CHANGED_EVENT → reschedule.
            }, delay)
        }

        schedule()
        const onChange = () => {
            if (!cancelled) schedule()
        }
        window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, onChange)
        window.addEventListener("storage", onChange)

        return () => {
            cancelled = true
            clear()
            window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, onChange)
            window.removeEventListener("storage", onChange)
        }
    }, [])
}

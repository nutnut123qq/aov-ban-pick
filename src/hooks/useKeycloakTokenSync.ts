"use client"

import { useEffect } from "react"
import { useKeycloak } from "./singleton"

const TOKEN_COOKIE_NAME = "keycloak_token"
const TOKEN_EXPIRY_COOKIE_NAME = "keycloak_token_expiry"

/**
 * Hook to sync Keycloak token with cookies for middleware access.
 * This allows server-side route protection.
 */
export const useKeycloakTokenSync = () => {
    const keycloak = useKeycloak()

    useEffect(() => {
        if (keycloak.isLoading || !keycloak.isAuthenticated) {
            return
        }

        const syncToken = () => {
            const parsed = keycloak.keycloak?.tokenParsed as { exp?: number } | undefined
            if (keycloak.token && parsed) {
                const expiry = parsed.exp
                if (expiry) {
                    const maxAgeSec = Math.max(
                        60,
                        expiry - Math.floor(Date.now() / 1000),
                    )
                    document.cookie = `${TOKEN_COOKIE_NAME}=${keycloak.token}; path=/; max-age=${maxAgeSec}; SameSite=Lax`
                    document.cookie = `${TOKEN_EXPIRY_COOKIE_NAME}=${expiry * 1000}; path=/; max-age=${maxAgeSec}; SameSite=Lax`
                }
            }
        }

        // Sync immediately
        syncToken()

        // Set up interval to sync token periodically (covers silent refresh)
        const intervalId = setInterval(syncToken, 10000)

        return () => {
            clearInterval(intervalId)
            // Clean up cookies on logout
            document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
            document.cookie = `${TOKEN_EXPIRY_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        }
    }, [
        keycloak.isLoading,
        keycloak.isAuthenticated,
        keycloak.token,
        keycloak.keycloak,
    ])
}

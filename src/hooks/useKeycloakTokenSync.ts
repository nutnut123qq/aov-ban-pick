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
        if (!keycloak.isReady || !keycloak.isAuthenticated) {
            return
        }

        const syncToken = () => {
            if (keycloak.token && keycloak.tokenParsed) {
                const expiry = (keycloak.tokenParsed as { exp?: number }).exp
                if (expiry) {
                    // Set cookies with proper settings
                    document.cookie = `${TOKEN_COOKIE_NAME}=${keycloak.token}; path=/; max-age=3600; SameSite=Lax`
                    document.cookie = `${TOKEN_EXPIRY_COOKIE_NAME}=${expiry * 1000}; path=/; max-age=3600; SameSite=Lax`
                }
            }
        }

        // Sync immediately
        syncToken()

        // Set up interval to sync token periodically
        const intervalId = setInterval(syncToken, 10000) // Sync every 10 seconds

        // Listen for token refresh events
        const handleTokenRefresh = () => {
            syncToken()
        }

        keycloak.keycloak?.on("token refreshed", handleTokenRefresh)

        return () => {
            clearInterval(intervalId)
            // Clean up cookies on logout
            document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
            document.cookie = `${TOKEN_EXPIRY_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        }
    }, [keycloak.isReady, keycloak.isAuthenticated, keycloak.token, keycloak.tokenParsed, keycloak.keycloak])
}

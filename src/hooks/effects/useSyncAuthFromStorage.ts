"use client"

import { useEffect } from "react"
import { jwtDecode } from "jwt-decode"
import { useAppDispatch } from "@/redux/hooks"
import { setUser, setAuthenticated } from "@/redux/slices/user"
import type { UserEntity } from "@/modules/types"
import { getAccessToken, clearTokens } from "@/services/auth"

interface KeycloakTokenPayload {
    sub?: string
    email?: string
    preferred_username?: string
    exp?: number
}

const createUserFromPayload = (payload: KeycloakTokenPayload): UserEntity => {
    const now = new Date()
    return {
        id: payload.sub ?? "",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        username: payload.preferred_username ?? payload.email ?? payload.sub ?? "",
        email: payload.email ?? null,
        keycloakId: payload.sub ?? "",
        isDeleted: false,
    }
}

/**
 * Syncs authentication state from localStorage to Redux on app mount.
 * This handles page reloads when a valid token exists in localStorage.
 */
export const useSyncAuthFromStorage = () => {
    const dispatch = useAppDispatch()

    useEffect(() => {
        const accessToken = getAccessToken()

        if (!accessToken) {
            return
        }

        try {
            const payload = jwtDecode<KeycloakTokenPayload>(accessToken)

            // Check if token is expired
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                clearTokens()
                return
            }

            const user = createUserFromPayload(payload)
            dispatch(setUser(user))
            dispatch(setAuthenticated(true))
        } catch (err) {
            console.error("[auth] Failed to decode token from storage:", err)
            localStorage.removeItem("access_token")
            localStorage.removeItem("refresh_token")
        }
    }, [dispatch])
}

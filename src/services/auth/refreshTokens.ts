import axios from "axios"
import { publicEnv } from "@/resources/env"
import {
    getRefreshToken,
    saveTokens,
    clearTokens,
} from "./authStorageService"
import type { LoginResponse } from "./loginWithKeycloak"

let inFlight: Promise<string | null> | null = null

/**
 * Exchanges the stored refresh token for a fresh access token (Keycloak
 * `grant_type=refresh_token`) and persists the new tokens. Concurrent callers
 * share a single in-flight request. On failure the session is cleared.
 *
 * @returns the new access token, or `null` if refresh failed / no refresh token.
 */
export const refreshAccessToken = async (): Promise<string | null> => {
    if (inFlight) return inFlight

    inFlight = (async () => {
        const refreshToken = getRefreshToken()
        if (!refreshToken) return null
        try {
            const params = new URLSearchParams()
            params.append("grant_type", "refresh_token")
            params.append("client_id", publicEnv().keycloak.clientId)
            params.append("client_secret", publicEnv().keycloak.secret)
            params.append("refresh_token", refreshToken)

            const res = await axios.post<LoginResponse>(
                `${publicEnv().keycloak.url}/realms/${publicEnv().keycloak.realm}/protocol/openid-connect/token`,
                params,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                },
            )
            saveTokens(res.data) // also fires AUTH_TOKEN_CHANGED_EVENT
            return res.data.access_token
        } catch {
            clearTokens() // invalid/expired refresh token → force re-login
            return null
        }
    })()

    try {
        return await inFlight
    } finally {
        inFlight = null
    }
}

import type { LoginResponse } from "./loginWithKeycloak"

export const AUTH_TOKEN_KEY = "access_token"
export const AUTH_REFRESH_TOKEN_KEY = "refresh_token"

/**
 * Get the access token from localStorage.
 */
export const getAccessToken = (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY)
}

/**
 * Get the refresh token from localStorage.
 */
export const getRefreshToken = (): string | null => {
    return localStorage.getItem(AUTH_REFRESH_TOKEN_KEY)
}

/**
 * Save tokens from login response to localStorage.
 */
export const saveTokens = (data: LoginResponse): void => {
    localStorage.setItem(AUTH_TOKEN_KEY, data.access_token)
    if (data.refresh_token) {
        localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, data.refresh_token)
    }
}

/**
 * Clear all auth tokens from localStorage.
 */
export const clearTokens = (): void => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY)
}

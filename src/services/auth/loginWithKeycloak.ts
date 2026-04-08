import axios from "axios"
import { publicEnv } from "@/resources/env"

export interface LoginResponse {
    access_token: string
    expires_in: number
    refresh_token: string
    token_type: string
    id_token?: string
    scope: string
}

/**
 * Login with username or email using Keycloak password grant
 * @param username - Can be either username or email address
 * @param password - User's password
 * @returns Token response from Keycloak
 */
export const loginWithKeycloak = async (
    username: string,
    password: string,
): Promise<LoginResponse> => {
    const params = new URLSearchParams()

    params.append("grant_type", "password")
    params.append("client_id", publicEnv().keycloak.clientId)
    params.append("client_secret", publicEnv().keycloak.secret)
    params.append("username", username)
    params.append("password", password)

    const res = await axios.post<LoginResponse>(
        `${publicEnv().keycloak.url}/realms/${publicEnv().keycloak.realm}/protocol/openid-connect/token`,
        params,
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        },
    )

    return res.data
}

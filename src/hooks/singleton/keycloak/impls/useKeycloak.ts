import { use } from "react"
import { KeycloakContext } from "../KeycloakContext"
import { createKeycloak, getKeycloakBrowserInitOptions } from "@/modules/keycloak"

export interface KeycloakProfile {
    id?: string
    sub?: string
    email?: string
    displayName?: string
    preferredUsername?: string
    picture?: string
}

/**
 * SWR state for the shared Keycloak instance (`data` is the adapter once `init` finished).
 */
export const useKeycloak = () => {
    const { keycloakSwr } = use(KeycloakContext)!
    const keycloak = keycloakSwr.data

    const login = async () => {
        if (!keycloak) {
            const newKeycloak = createKeycloak()
            await newKeycloak.init(
                getKeycloakBrowserInitOptions("login-required"),
            )
            await newKeycloak.login()
            return
        }
        // Do not call `init` again: the adapter is already initialised once via SWR.
        // After logout, `token` is cleared but a second `init` breaks; `login()` is enough.
        await keycloak.login()
    }

    const logout = async () => {
        if (keycloak) {
            await keycloak.logout({
                redirectUri: globalThis.location.origin,
            })
        }
    }

    return {
        ...keycloakSwr,
        keycloak: keycloak ?? null,
        isAuthenticated: keycloak?.authenticated ?? false,
        token: keycloak?.token ?? null,
        profile: keycloak?.profile as KeycloakProfile | undefined,
        login,
        logout,
    }
}

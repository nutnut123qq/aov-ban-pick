import { createKeycloak } from "@/modules/keycloak"
import useSWR from "swr"

/**
 * Keycloak client via SWR — single fetch for the app lifecycle.
 */
export const useKeycloakCore = () =>
    useSWR(
        "KEYCLOAK_SWR",
        async () => {
            const keycloak = createKeycloak()
            await keycloak.init({
                onLoad: "check-sso",
                silentCheckSsoRedirectUri: `${location.origin}/silent-check-sso.html`,
                responseMode: "query",
                pkceMethod: "S256",
                redirectUri: `${window.location.origin}/keycloak/google/callback`,
            })
            return keycloak
        }
    )

import { createKeycloak, getKeycloakBrowserInitOptions } from "@/modules/keycloak"
import useSWR from "swr"

/**
 * Keycloak client via SWR — single fetch for the app lifecycle.
 */
export const useKeycloakCore = () =>
    useSWR(
        "KEYCLOAK_SWR",
        async () => {
            try {
                const keycloak = createKeycloak()
                await keycloak.init(getKeycloakBrowserInitOptions("check-sso"))
                return keycloak
            } catch {
                return null
            }
        },
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    )

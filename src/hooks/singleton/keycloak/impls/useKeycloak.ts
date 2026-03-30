import { use } from "react"
import { KeycloakContext } from "../KeycloakContext"

/**
 * SWR state for the shared Keycloak instance (`data` is the adapter once `init` finished).
 */
export const useKeycloak = () => {
    const { keycloakSwr } = use(KeycloakContext)!
    return keycloakSwr
}

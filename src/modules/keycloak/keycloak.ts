
import { publicEnv } from "@/resources/env"
import Keycloak from "keycloak-js"

/**
 * Creates a new Keycloak instance.
 * @returns The Keycloak instance.
 */
export const createKeycloak = () => {
    return new Keycloak(
        {
            url: publicEnv().keycloak.url,
            realm: publicEnv().keycloak.realm,
            clientId: publicEnv().keycloak.clientId,
        }
    )
}
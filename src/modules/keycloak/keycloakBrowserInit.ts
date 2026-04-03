import type { KeycloakInitOptions, KeycloakOnLoad } from "keycloak-js"

/**
 * Browser-only Keycloak `init` options: must match Valid redirect URIs in Keycloak for this client.
 */
export const getKeycloakBrowserInitOptions = (
    onLoad: KeycloakOnLoad,
): KeycloakInitOptions => {
    const origin =
        typeof globalThis !== "undefined" && "location" in globalThis
            ? globalThis.location.origin
            : ""
    return {
        onLoad,
        silentCheckSsoRedirectUri: `${origin}/silent-check-sso.html`,
        responseMode: "fragment",
        pkceMethod: "S256",
        redirectUri: `${origin}/auth/login`,
    }
}

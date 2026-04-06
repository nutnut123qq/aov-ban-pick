import type { KeycloakInitOptions, KeycloakOnLoad } from "keycloak-js"

/**
 * Browser-only Keycloak `init` options: must match Valid redirect URIs in Keycloak for this client.
 *
 * - `checkLoginIframe: false` and no `silentCheckSsoRedirectUri` skips the Keycloak 26
 *   third-party cookie probe iframe. Without that, embedded / strict browsers (e.g. IDE
 *   Simple Browser) often hit: "Timeout when waiting for 3rd party check iframe message."
 * - Omitting `onLoad` avoids `check-sso` doing a `prompt=none` round-trip on every load
 *   when the login-status iframe is disabled (see keycloak-js `#processInit`).
 */
export const getKeycloakBrowserInitOptions = (
    onLoad?: KeycloakOnLoad,
): KeycloakInitOptions => {
    const origin =
        typeof globalThis !== "undefined" && "location" in globalThis
            ? globalThis.location.origin
            : ""
    return {
        ...(onLoad !== undefined ? { onLoad } : {}),
        checkLoginIframe: false,
        responseMode: "fragment",
        pkceMethod: "S256",
        redirectUri: `${origin}/auth/login`,
    }
}

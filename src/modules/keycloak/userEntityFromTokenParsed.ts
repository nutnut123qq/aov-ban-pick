import type { UserEntity } from "@/modules/types"

type KeycloakAccessLike = {
    sub?: string
    email?: string
    preferred_username?: string
}

/**
 * Builds a minimal {@link UserEntity} from Keycloak access token claims (`tokenParsed`)
 * until GraphQL `me` returns the persisted profile.
 */
export const userEntityFromKeycloakTokenParsed = (
    parsed: KeycloakAccessLike | undefined,
): UserEntity | null => {
    const sub = parsed?.sub
    if (!sub) {
        return null
    }
    const now = new Date()
    return {
        id: sub,
        createdAt: now,
        updatedAt: now,
        username: parsed.preferred_username ?? parsed.email ?? sub,
        email: parsed.email ?? null,
        keycloakId: sub,
        isDeleted: false,
    }
}

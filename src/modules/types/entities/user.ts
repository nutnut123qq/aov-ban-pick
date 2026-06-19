import type { AbstractEntity } from "./abstract"

/**
 * Application user; identity comes from Keycloak (keycloakId = JWT sub).
 */
export interface UserEntity extends AbstractEntity {
    /** The username of the user. */
    username: string
    /** The email of the user. */
    email: string | null
    /** The full name of the user. */
    fullName?: string | null
    /** The avatar URL of the user. */
    avatar?: string | null
    /** The Keycloak ID of the user. */
    keycloakId: string
    /** Whether the user is deleted. */
    isDeleted: boolean
}

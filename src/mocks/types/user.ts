// User & Auth Types
export interface UserEntity {
    id: string
    username: string
    email: string | null
    firstName?: string
    lastName?: string
    keycloakId: string
    avatar?: string | null
    phoneNumber?: string | null
    isActive: boolean
    isDeleted: boolean
    roles: string[]
    createdAt: string
    updatedAt: string
}

export interface RoleEntity {
    id: string
    name: string
    description?: string
    composite: boolean
    clientRole: boolean
    containerId: string
    attributes?: Record<string, string[]>
    createdAt: string
}

export interface PermissionEntity {
    id: string
    name: string
    description?: string
    type: string
    createdAt: string
}

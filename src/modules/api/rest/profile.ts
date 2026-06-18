import { restRequest } from "./client"

/** Account record (`GET /training/users/me`). */
export interface TrainingAccount {
    id: string
    keycloakId: string
    tenantId: string
    employeeCode: string | null
    fullName: string
    email: string
    phone: string | null
    avatarUrl: string | null
    status: string
    lastLoginAt: string | null
    createdAt: string
    updatedAt: string
}

export type GenderType = "male" | "female" | "other" | "unknown"

/** Optional profile custom fields (bio, socials, …). */
export interface ProfileCustomFields {
    bio?: string | null
    headline?: string | null
    pronouns?: string | null
    websiteUrl?: string | null
    socials?: {
        github?: string | null
        linkedin?: string | null
        facebook?: string | null
        x?: string | null
        youtube?: string | null
    } | null
    onboardedAt?: string | null
}

/** Extended profile (`GET /training/users/me/profile`). */
export interface TrainingProfile {
    userId: string
    gender: GenderType | null
    birthDate: string | null
    address: string | null
    orgId: string | null
    departmentId: string | null
    teamId: string | null
    positionId: string | null
    lineManagerId: string | null
    employmentType: string | null
    joinDate: string | null
    locale: string | null
    timezone: string | null
    customFields: ProfileCustomFields | null
    updatedAt: string | null
}

export interface ProfileCompleteness {
    percent: number
    filled: number
    total: number
    missing: string[]
    isComplete: boolean
    onboardedAt: string | null
}

/** Fields accepted by `PATCH /training/users/me`. */
export interface UpdateAccountInput {
    fullName?: string
    phone?: string | null
    avatarUrl?: string | null
}

/** Fields accepted by `PUT /training/users/me/profile`. */
export interface UpsertProfileInput {
    gender?: GenderType
    birthDate?: string | null
    address?: string | null
    locale?: string | null
    timezone?: string | null
    employmentType?: string | null
    customFields?: ProfileCustomFields
}

export const getMyAccount = ({ token }: { token: string }) =>
    restRequest<TrainingAccount>("training/users/me", { token })

export const updateMyAccount = ({
    token,
    input,
}: {
    token: string
    input: UpdateAccountInput
}) =>
    restRequest<TrainingAccount>("training/users/me", {
        token,
        method: "PATCH",
        body: input,
    })

export const getMyProfile = ({ token }: { token: string }) =>
    restRequest<TrainingProfile>("training/users/me/profile", { token })

export const upsertMyProfile = ({
    token,
    input,
}: {
    token: string
    input: UpsertProfileInput
}) =>
    restRequest<TrainingProfile>("training/users/me/profile", {
        token,
        method: "PUT",
        body: input,
    })

export const getMyProfileCompleteness = ({ token }: { token: string }) =>
    restRequest<ProfileCompleteness>("training/users/me/profile/completeness", {
        token,
    })

/**
 * Shared GraphQL client types: response envelope, optional auth headers, generic query params.
 */

/** Standard API wrapper around resolver payloads (`success`, `message`, optional `error`, nested `data`). */
export interface GraphQLResponse<TData = undefined> {
    success: boolean
    message: string
    error?: string
    data?: TData
}

/** Header names used for MFA or OTP flows when calling protected operations. */
export enum GraphQLHeadersKey {
    TOTP = "X-TOTP",
    EmailOTP = "X-Email-OTP",
}

export type GraphQLHeaders = Partial<Record<GraphQLHeadersKey, string>>

/** Generic query helper shape (variant, extra headers, bearer token). */
export interface QueryParams<TQuery, TRequest = undefined> {
    query?: TQuery
    request?: TRequest
    headers?: GraphQLHeaders
    token?: string
}

/** Variables bag when the operation expects a single `request` object. */
export interface QueryVariables<TRequest> {
    request: TRequest
}

/** Allowed sort keys for paginated course lists (GraphQL `SortBy`). */
export enum SortBy {
    Title = "title",
    CreatedAt = "createdAt",
    UpdatedAt = "updatedAt",
}

/** Sort direction sent to the API (GraphQL enum). */
export enum SortOrder {
    Asc = "ASC",
    Desc = "DESC",
}

/** Sort input. */
export interface SortInput<T extends string> {
    by: T
    order: SortOrder
}

/** Page size, index, and sort clauses for `courses` (`CoursesPaginationFilters`). */
export interface PaginationFilters<T extends string> {
    pageNumber?: number
    limit?: number
    sorts: Array<SortInput<T>>
}
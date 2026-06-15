import axios, { AxiosInstance } from "axios"
import { publicEnv } from "@/resources/env"

/**
 * REST client for the member-facing Community feature.
 *
 * The base URL (`publicEnv().api.http`) already ends with `/v1`, so endpoints
 * here start with `/training/communities/...` (no extra `/v1`).
 *
 * Every backend response uses the envelope `{ success, message, data }`.
 * Paginated payloads carry `data.items` + `data.meta`.
 */

/** Standard response envelope returned by the REST API. */
export interface ApiEnvelope<T> {
    success: boolean
    message: string
    data: T
}

/** Pagination metadata returned for list endpoints. */
export interface PaginationMeta {
    page: number
    size: number
    total: number
    totalPages: number
}

/** A paginated payload (`data.items` + `data.meta`). */
export interface Paginated<T> {
    items: T[]
    meta: PaginationMeta
}

export type CommunityVisibility = "PUBLIC" | "PRIVATE" | "RESTRICTED"
export type CommunityJoinPolicy = "OPEN" | "REQUEST" | "INVITE"
export type CommunityMemberStatus = "ACTIVE" | "PENDING" | "BANNED" | null
export type CommunityRole = "OWNER" | "ADMIN" | "MODERATOR" | "MEMBER" | null

export interface Community {
    id: string
    name: string
    slug: string
    description: string
    coverImageUrl: string | null
    visibility: CommunityVisibility
    joinPolicy: CommunityJoinPolicy
    memberCount: number
    postCount: number
    myRole: CommunityRole
    myStatus: CommunityMemberStatus
}

export interface CommunityPostMedia {
    fileUrl: string
}

export interface CommunityPost {
    id: string
    authorName: string
    authorAvatar: string | null
    title: string | null
    content: string
    status: string
    isPinned: boolean
    isLocked: boolean
    likeCount: number
    commentCount: number
    createdAt: string
    media: CommunityPostMedia[]
    likedByMe: boolean
}

export interface CommunityComment {
    id: string
    authorName: string
    authorAvatar: string | null
    parentCommentId: string | null
    content: string
    likeCount: number
    createdAt: string
    likedByMe: boolean
}

export interface CommunityMember {
    id: string
    userId: string
    displayName: string
    avatarUrl: string | null
    role: CommunityRole
    status: CommunityMemberStatus
    joinedAt: string
}

/** Body for {@link createCommunity}. */
export interface CreateCommunityBody {
    name: string
    description?: string
    visibility?: CommunityVisibility
}

/** Body for {@link createPost}. */
export interface CreatePostBody {
    title?: string
    content: string
    mediaUrls?: string[]
}

/** Body for {@link createComment}. */
export interface CreateCommentBody {
    content: string
    parentCommentId?: string
}

/**
 * Build an axios instance bound to the given Keycloak access token.
 * Token is passed per-call so the client always carries a fresh bearer.
 */
const createAxios = (token?: string | null): AxiosInstance => {
    return axios.create({
        baseURL: publicEnv().api.http,
        headers: {
            "Content-Type": "application/json",
            "X-Tenant-Id": publicEnv().tenant.id,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    })
}

/** Unwrap the `{ success, message, data }` envelope, returning `data`. */
const unwrap = <T>(payload: ApiEnvelope<T>): T => payload.data

// ---------------------------------------------------------------------------
// Communities
// ---------------------------------------------------------------------------

export const listCommunities = async (
    page: number,
    size: number,
    options: { search?: string; mine?: boolean } = {},
    token?: string | null,
): Promise<Paginated<Community>> => {
    const res = await createAxios(token).get<ApiEnvelope<Paginated<Community>>>(
        "/training/communities",
        {
            params: {
                page,
                size,
                ...(options.search ? { search: options.search } : {}),
                ...(options.mine ? { mine: true } : {}),
            },
        },
    )
    return unwrap(res.data)
}

export const getCommunity = async (
    id: string,
    token?: string | null,
): Promise<Community> => {
    const res = await createAxios(token).get<ApiEnvelope<Community>>(
        `/training/communities/${id}`,
    )
    return unwrap(res.data)
}

export const createCommunity = async (
    body: CreateCommunityBody,
    token?: string | null,
): Promise<Community> => {
    const res = await createAxios(token).post<ApiEnvelope<Community>>(
        "/training/communities",
        body,
    )
    return unwrap(res.data)
}

export const joinCommunity = async (
    id: string,
    token?: string | null,
): Promise<Community> => {
    const res = await createAxios(token).post<ApiEnvelope<Community>>(
        `/training/communities/${id}/join`,
    )
    return unwrap(res.data)
}

export const leaveCommunity = async (
    id: string,
    token?: string | null,
): Promise<Community> => {
    const res = await createAxios(token).post<ApiEnvelope<Community>>(
        `/training/communities/${id}/leave`,
    )
    return unwrap(res.data)
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

export const listPosts = async (
    communityId: string,
    options: { page?: number; size?: number } = {},
    token?: string | null,
): Promise<Paginated<CommunityPost>> => {
    const res = await createAxios(token).get<ApiEnvelope<Paginated<CommunityPost>>>(
        `/training/communities/${communityId}/posts`,
        {
            params: {
                page: options.page ?? 1,
                size: options.size ?? 10,
            },
        },
    )
    return unwrap(res.data)
}

export const createPost = async (
    communityId: string,
    body: CreatePostBody,
    token?: string | null,
): Promise<CommunityPost> => {
    const res = await createAxios(token).post<ApiEnvelope<CommunityPost>>(
        `/training/communities/${communityId}/posts`,
        body,
    )
    return unwrap(res.data)
}

export const likePost = async (
    communityId: string,
    postId: string,
    token?: string | null,
): Promise<{ likeCount: number; likedByMe: boolean }> => {
    const res = await createAxios(token).post<
        ApiEnvelope<{ likeCount: number; likedByMe: boolean }>
    >(`/training/communities/${communityId}/posts/${postId}/like`)
    return unwrap(res.data)
}

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

export const listComments = async (
    communityId: string,
    postId: string,
    page: number,
    size: number,
    token?: string | null,
): Promise<Paginated<CommunityComment>> => {
    const res = await createAxios(token).get<
        ApiEnvelope<Paginated<CommunityComment>>
    >(`/training/communities/${communityId}/posts/${postId}/comments`, {
        params: { page, size },
    })
    return unwrap(res.data)
}

export const createComment = async (
    communityId: string,
    postId: string,
    body: CreateCommentBody,
    token?: string | null,
): Promise<CommunityComment> => {
    const res = await createAxios(token).post<ApiEnvelope<CommunityComment>>(
        `/training/communities/${communityId}/posts/${postId}/comments`,
        body,
    )
    return unwrap(res.data)
}

export const likeComment = async (
    communityId: string,
    commentId: string,
    token?: string | null,
): Promise<{ likeCount: number; likedByMe: boolean }> => {
    const res = await createAxios(token).post<
        ApiEnvelope<{ likeCount: number; likedByMe: boolean }>
    >(`/training/communities/${communityId}/comments/${commentId}/like`)
    return unwrap(res.data)
}

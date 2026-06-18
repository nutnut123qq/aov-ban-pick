import { publicEnv } from "@/resources/env"
import { refreshAccessToken } from "@/services/auth/refreshTokens"

export type RestMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE"

export interface RestRequestOptions {
    /** Bearer token (Keycloak). Most training endpoints require it. */
    token?: string
    /** Query-string params; `undefined`/`null` values are skipped. */
    query?: Record<string, string | number | boolean | undefined | null>
    /** JSON body (serialized automatically). */
    body?: unknown
    /** HTTP method; defaults to GET. */
    method?: RestMethod
}

/**
 * Minimal fetch wrapper for the Nest REST API (`/api/v1`).
 *
 * - Injects `Authorization` (when a token is supplied) and `X-Tenant-ID`.
 * - Unwraps the `{ success, message, data }` envelope from `RestTransformInterceptor`.
 *
 * @param path - Path relative to the `/api/v1` base, e.g. `training/notifications`.
 * @throws Error when the response status is not OK.
 */
export const restRequest = async <T>(
    path: string,
    options: RestRequestOptions = {},
): Promise<T> => {
    const { token, query, body, method = "GET" } = options
    const base = publicEnv().api.http.replace(/\/$/, "")
    const url = new URL(`${base}/${path.replace(/^\//, "")}`)

    if (query) {
        for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && value !== null) {
                url.searchParams.set(key, String(value))
            }
        }
    }

    const doFetch = (authToken?: string) => {
        const headers: Record<string, string> = {
            "X-Tenant-ID": publicEnv().tenant.id,
        }
        if (authToken) {
            headers.Authorization = `Bearer ${authToken}`
        }
        if (body !== undefined) {
            headers["Content-Type"] = "application/json"
        }
        return fetch(url.toString(), {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        })
    }

    let res = await doFetch(token)

    // On 401, try a one-shot token refresh and retry (covers expired access tokens).
    if (res.status === 401 && token) {
        const fresh = await refreshAccessToken()
        if (fresh) {
            res = await doFetch(fresh)
        }
    }

    if (!res.ok) {
        throw new Error(`REST ${method} ${path} failed: ${res.status}`)
    }

    const json = (await res.json().catch(() => null)) as unknown
    // Unwrap RestTransformInterceptor envelope when present.
    if (
        json &&
        typeof json === "object" &&
        "data" in (json as Record<string, unknown>)
    ) {
        return (json as { data: T }).data
    }
    return json as T
}

/** Standard paginated envelope returned by list endpoints. */
export interface RestPaginated<T> {
    items: T[]
    meta: {
        page: number
        size: number
        total: number
        totalPages: number
    }
}

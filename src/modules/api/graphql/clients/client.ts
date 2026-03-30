import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client"
import {
    CombinedGraphQLErrors,
    CombinedProtocolErrors,
} from "@apollo/client/errors"
import { ErrorLink } from "@apollo/client/link/error"
import { createTimeoutLink } from "./timeout"
import { createRetryLink } from "./retry"
import { createHttpLink } from "./http"
import { defaultOptions } from "./options"

/**
 * Injects `Authorization: Bearer <token>` when a token exists (param or session storage).
 */
const createAccessTokenAuthLink = (token?: string) =>
    new ApolloLink((operation, forward) => {
        const accessToken = token
        if (accessToken) {
            operation.setContext(({ headers = {} }) => ({
                headers: {
                    ...headers,
                    authorization: `Bearer ${accessToken}`,
                },
            }))
        }
        return forward(operation)
    })

/**
 * Centralized logging for GraphQL, protocol, and network errors.
 */
const createErrorLink = () =>
    new ErrorLink(({ error }) => {
        if (CombinedGraphQLErrors.is(error)) {
            for (const gqlErr of error.errors) {
                if (
                    gqlErr.message === "Unauthorized"
                    || gqlErr.extensions?.code === "UNAUTHENTICATED"
                ) {
                    console.log("[GraphQL error]: Unauthorized")
                }
            }
            return
        }
        if (CombinedProtocolErrors.is(error)) {
            error.errors.forEach(({ message, extensions }) =>
                console.log(
                    `[Protocol error]: Message: ${message}, Extensions: ${JSON.stringify(
                        extensions
                    )}`
                )
            )
            return
        }
        console.error(`[Network error]: ${error.message}`)
    })

export interface CreateApolloClientOptions {
    /** When false, skips the bearer auth link entirely. */
    auth?: boolean
    /** When false, does not apply {@link defaultOptions} (caller may pass custom `defaultOptions`). */
    cache?: boolean
    /** Explicit bearer token; otherwise falls back to session storage when `auth` is true. */
    token?: string
    /** Forward cookies on same-origin or cross-site requests (see {@link createHttpLink}). */
    withCredentials?: boolean
    /** Additional headers passed to {@link createHttpLink}. */
    headers?: Record<string, string>
    /** Overrides default fetch/error policies for this client instance. */
    defaultOptions?: ApolloClient.DefaultOptions
}

/**
 * Builds an `ApolloClient` with retry, optional auth, error logging, timeout, and HTTP links.
 *
 * @param options - Link and cache configuration
 * @returns Configured client (each call returns a new instance)
 */
export const createApolloClient = (
    options: CreateApolloClientOptions
) => {
    const {
        auth = true,
        cache = true,
        token,
        withCredentials = false,
        headers = {},
        defaultOptions: customDefaultOptions,
    } = options

    const links: Array<ApolloLink> = [
        createRetryLink(),
    ]

    if (auth) {
        links.push(createAccessTokenAuthLink(token))
    }

    links.push(
        createErrorLink(),
        createTimeoutLink(),
        createHttpLink(withCredentials, headers)
    )

    const finalDefaultOptions = customDefaultOptions || (cache ? defaultOptions : undefined)

    return new ApolloClient({
        link: ApolloLink.from(links),
        cache: new InMemoryCache(),
        defaultOptions: finalDefaultOptions,
    })
}

/**
 * Same as {@link createApolloClient} with auth + credentials + no cache — common for sensitive calls.
 *
 * @param token - Bearer access token
 * @param headers - Extra headers (e.g. OTP or feature flags)
 */
export const createApolloClientAndHeaders = (
    token: string,
    headers: Record<string, string>
) => {
    return createApolloClient({
        token,
        headers,
        withCredentials: true,
        auth: true,
        cache: false,
    })
}

/** Anonymous client with cache disabled (suitable for public read-only probes). */
export const client = createApolloClient({
    auth: false,
    cache: false,
})

/** Anonymous client with explicit no-cache default options. */
export const noCacheClient = createApolloClient({
    auth: false,
    cache: false,
})

/** Anonymous client that includes cookies on requests. */
export const noCacheCredentialClient = createApolloClient({
    auth: false,
    cache: false,
    withCredentials: true,
})

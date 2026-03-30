import { publicEnv } from "@/resources/env"
import { RetryLink } from "@apollo/client/link/retry"

/**
 * Retries failed operations with backoff (env-driven delays and attempt cap).
 */
export const createRetryLink = () => {
    return new RetryLink({
        delay: {
            initial: publicEnv().graphql.initialRetryDelay,
            max: publicEnv().graphql.maxRetryDelay,
            jitter: true,
        },
        attempts: {
            max: publicEnv().graphql.maxRetry,
            retryIf: (error) => {
                return !!error
            },
        },
    })
}

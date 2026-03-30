import { ApolloClient } from "@apollo/client"

/**
 * Default Apollo policies: avoid stale cache for queries unless a caller overrides `defaultOptions`.
 */
export const defaultOptions: ApolloClient.DefaultOptions = {
    watchQuery: {
        fetchPolicy: "no-cache",
        errorPolicy: "ignore",
    },
    query: {
        fetchPolicy: "no-cache",
        errorPolicy: "all",
    },
}

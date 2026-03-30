import { HttpLink } from "@apollo/client"
import { publicEnv } from "@/resources/env"

/**
 * HTTP transport to the configured GraphQL endpoint.
 *
 * @param withCredentials - When true, sends cookies on cross-site requests (`credentials: "include"`).
 * @param headers - Extra static headers merged into each request.
 */
export const createHttpLink = (
    withCredentials = false, 
    headers: Record<string, string> = {}
) => {
    return new HttpLink({
        uri: `${publicEnv().api.graphql}`,
        credentials: withCredentials ? "include" : "same-origin",
        headers,
    })
}

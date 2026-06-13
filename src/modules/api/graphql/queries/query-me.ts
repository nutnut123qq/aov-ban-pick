import type { UserEntity } from "@/modules/types"
import { createApolloClient } from "../clients"
import { DocumentNode, gql } from "@apollo/client"

/** Inner `data` field after the global GraphQL response interceptor. */
export interface QueryMePayload {
    data: UserEntity | null
}

const query1 = gql`
  query Me {
    me {
      id
      email
      fullName
      avatar
    }
  }
`

export enum QueryMe {
    Query1 = "query1",
}

const queryMap: Record<QueryMe, DocumentNode> = {
    [QueryMe.Query1]: query1,
}
export interface QueryMeParams {
    query?: QueryMe
    token?: string
}

export interface QueryMeResponse {
    me: UserEntity | null
}

/**
 * Fetches the current user via Apollo.
 *
 * @param params - Document key, GraphQL variables, and optional bearer token
 * @returns Apollo query result; entity at `data.me`
 */
export const queryMe = async ({
    query = QueryMe.Query1,
    token,
}: QueryMeParams) => {
    const apollo = createApolloClient({
        auth: Boolean(token),
        cache: false,
        token,
    })

    const result = await apollo.query<QueryMeResponse>({
        query: queryMap[query],
    })

    const user = result.data?.me

    return {
        ...result,
        data: {
            me: user
                ? {
                    ...user,
                    createdAt: "",
                    updatedAt: "",
                    username: user.email ?? user.id,
                    keycloakId: user.id,
                    isDeleted: false,
                }
                : null,
        },
    }
}

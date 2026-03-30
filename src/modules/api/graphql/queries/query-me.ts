import type { UserEntity } from "@/modules/types"
import { createApolloClient } from "../clients"
import type { GraphQLResponse } from "../types"
import { DocumentNode, gql } from "@apollo/client"

/** Inner `data` field after the global GraphQL response interceptor. */
export interface QueryMePayload {
    data: UserEntity | null
}

const query1 = gql`
  query Me {
    me {
      success
      message
      error
      data {
        id
        email
        avatar
      }
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
    me: GraphQLResponse<QueryMePayload>
}

/**
 * Fetches the current user via Apollo.
 *
 * @param params - Document key, GraphQL variables, and optional bearer token
 * @returns Apollo query result; entity at `data.me.data.data`
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

    return apollo.query<QueryMeResponse>({
        query: queryMap[query],
    })
}

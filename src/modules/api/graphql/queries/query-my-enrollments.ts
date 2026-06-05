import { createApolloClient } from "../clients"
import type { GraphQLResponse } from "../types"
import { DocumentNode, gql } from "@apollo/client"
import type { EnrollmentEntity } from "@/modules/types"

/** Inner `data` field for the paginated `myEnrollments` query. */
export interface QueryMyEnrollmentsPayload {
    count: number
    data: Array<EnrollmentEntity>
}

const query1 = gql`
  query MyEnrollments {
    myEnrollments {
      count
      data {
        id
        status
        progress
        completedAt
        createdAt
        updatedAt
        courseId
        course {
          id
          title
          slug
          shortDescription
          thumbnailUrl
          originalPrice
          discountPrice
          level
          enrollmentCount
          rating
          isFeatured
          category {
            id
            name
          }
        }
      }
    }
  }
`

export enum QueryMyEnrollments {
    Query1 = "query1",
}

const queryMap: Record<QueryMyEnrollments, DocumentNode> = {
    [QueryMyEnrollments.Query1]: query1,
}

export interface QueryMyEnrollmentsResponse {
    myEnrollments: QueryMyEnrollmentsPayload
}

export interface QueryMyEnrollmentsParams {
    query?: QueryMyEnrollments
    token?: string
}

/**
 * Fetches the current user's enrollments via Apollo.
 *
 * @param params - Document key and optional bearer token
 * @returns Apollo query result; enrollments at `data.myEnrollments.data`
 */
export const queryMyEnrollments = async ({
    query = QueryMyEnrollments.Query1,
    token,
}: QueryMyEnrollmentsParams) => {
    const apollo = createApolloClient({
        auth: Boolean(token),
        cache: false,
        token,
    })

    return apollo.query<QueryMyEnrollmentsResponse>({
        query: queryMap[query],
    })
}

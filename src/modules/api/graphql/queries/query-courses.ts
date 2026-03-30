import type { CourseEntity } from "@/modules/types"
import { createApolloClient } from "../clients"
import {
    SortBy,
    SortOrder,
    type GraphQLResponse,
    type PaginationFilters,
} from "../types"
import { DocumentNode, gql } from "@apollo/client"

/** Inner `data` field for the paginated `courses` query. */
export interface QueryCoursesPayload {
    count: number
    data: Array<CourseEntity>
}

const query1 = gql`
  query Courses($request: CoursesRequest!) {
    courses(request: $request) {
      success
      message
      error
      data {
        count
        data {
          id
          createdAt
          updatedAt
          title
          slug
          description
          cdnUrl
        }
      }
    }
  }
`

export enum QueryCourses {
    Query1 = "query1",
}

const queryMap: Record<QueryCourses, DocumentNode> = {
    [QueryCourses.Query1]: query1,
}

/** Default list sort (title A→Z). */
export const defaultCoursesSorts = [
    {
        by: SortBy.Title,
        order: SortOrder.Asc,
    },
] as const

/** Apollo variables for `courses(input: CoursesInput!)`. */
export interface QueryCoursesVariables {
    request: {
        filters: PaginationFilters<SortBy>
    }
}

export interface QueryCoursesResponse {
    courses: GraphQLResponse<QueryCoursesPayload>
}

export interface QueryCoursesParams {
    query?: QueryCourses
    variables: QueryCoursesVariables
    token?: string
}

/**
 * Fetches a paginated course list via Apollo.
 *
 * @param params - Document key, GraphQL variables, optional bearer token
 * @returns Rows at `data.courses.data.data`, total at `data.courses.data.count`
 */
export const queryCourses = async ({
    query = QueryCourses.Query1,
    variables,
    token,
}: QueryCoursesParams) => {
    const apollo = createApolloClient({
        auth: Boolean(token),
        cache: false,
        token,
    })

    return apollo.query<QueryCoursesResponse>({
        query: queryMap[query],
        variables,
    })
}

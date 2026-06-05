import { createApolloClient } from "../clients"
import { DocumentNode, gql } from "@apollo/client"
import type { CourseSectionEntity } from "@/modules/types"

const query1 = gql`
  query CourseContent($request: CourseBySlugRequest!) {
    courseContent(request: $request) {
      id
      title
      description
      orderIndex
      chapters {
        id
        title
        description
        orderIndex
        lessons {
          id
          title
          description
          type
          duration
          orderIndex
          isFree
          content {
            videoUrl
            textContent
            quizId
            assignmentId
          }
          materials {
            id
            title
            type
            url
            size
            createdAt
          }
        }
      }
    }
  }
`

export enum QueryCourseContent {
    Query1 = "query1",
}

const queryMap: Record<QueryCourseContent, DocumentNode> = {
    [QueryCourseContent.Query1]: query1,
}

export interface QueryCourseContentVariables {
    request: {
        slug: string
    }
}

export interface QueryCourseContentResponse {
    courseContent: CourseSectionEntity[]
}

export interface QueryCourseContentParams {
    query?: QueryCourseContent
    variables: QueryCourseContentVariables
    token?: string
}

/**
 * Fetches course content tree (sections → chapters → lessons) via Apollo.
 *
 * @param params - Document key, GraphQL variables, optional bearer token
 * @returns Course content sections at `data.courseContent`
 */
export const queryCourseContent = async ({
    query = QueryCourseContent.Query1,
    variables,
    token,
}: QueryCourseContentParams) => {
    const apollo = createApolloClient({
        auth: Boolean(token),
        cache: false,
        token,
    })

    return apollo.query<QueryCourseContentResponse>({
        query: queryMap[query],
        variables,
    })
}

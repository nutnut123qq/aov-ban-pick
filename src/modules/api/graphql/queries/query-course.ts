import { CourseEntity } from "@/modules/types"
import { createApolloClient } from "../clients"
import { DocumentNode, gql } from "@apollo/client"

const query1 = gql`
  query Course($request: CourseRequestInput!) {
    course(request: $request) {
      id
      createdAt
      updatedAt
      title
      slug
      description
      shortDescription
      cdnUrl
      thumbnailUrl
      originalPrice
      discountPrice
      level
      enrollmentCount
      rating
      reviewCount
      isFeatured
      status
      estimatedMinutes
      publishedAt
      category {
        id
        name
      }
      pricingPhases {
        id
        price
        phase
        slotAvailable
        orderIndex
      }
      prerequisites {
        id
        content
      }
      valuePropositions {
        id
        content
        orderIndex
      }
      modules {
        id
        title
        description
        orderIndex
        contents {
          id
          orderIndex
          data
          createdAt
          updatedAt
        }
      }
      qnas {
        id
        question
        answer
        orderIndex
      }
    }
  }
`

const queryBySlug = gql`
  query CourseBySlug($request: CourseBySlugRequestInput!) {
    courseBySlug(request: $request) {
      id
      createdAt
      updatedAt
      title
      slug
      description
      shortDescription
      cdnUrl
      thumbnailUrl
      originalPrice
      discountPrice
      level
      enrollmentCount
      rating
      reviewCount
      isFeatured
      status
      estimatedMinutes
      publishedAt
      category {
        id
        name
      }
      pricingPhases {
        id
        price
        phase
        slotAvailable
        orderIndex
      }
      prerequisites {
        id
        content
      }
      valuePropositions {
        id
        content
        orderIndex
      }
      modules {
        id
        title
        description
        orderIndex
        contents {
          id
          orderIndex
          data
          createdAt
          updatedAt
        }
      }
      qnas {
        id
        question
        answer
        orderIndex
      }
    }
  }
`

export enum QueryCourse {
    Query1 = "query1",
    QueryBySlug = "queryBySlug",
}

const queryMap: Record<QueryCourse, DocumentNode> = {
    [QueryCourse.Query1]: query1,
    [QueryCourse.QueryBySlug]: queryBySlug,
}

/** Apollo variables for `course(input: CourseInput!)`. */
export interface QueryCourseVariables {
    request: {
      id: string
    }
}

export interface QueryCourseBySlugVariables {
    request: {
      slug: string
    }
}

export interface QueryCourseResponse {
    course: CourseEntity | null
}

export interface QueryCourseBySlugResponse {
    courseBySlug: CourseEntity | null
}

export interface QueryCourseParams {
    query?: QueryCourse
    variables: QueryCourseVariables | QueryCourseBySlugVariables
    token?: string
}

/**
 * Fetches one course by id or slug via Apollo.
 *
 * @param params - Document key, GraphQL variables, and optional bearer token
 * @returns Apollo query result; entity at `data.course`
 */
export const queryCourse = async ({
    query = QueryCourse.Query1,
    variables,
    token,
}: QueryCourseParams) => {
    const apollo = createApolloClient({
        auth: Boolean(token),
        cache: false,
        token,
    })

    return apollo.query<QueryCourseResponse | QueryCourseBySlugResponse>({
        query: queryMap[query],
        variables,
    })
}

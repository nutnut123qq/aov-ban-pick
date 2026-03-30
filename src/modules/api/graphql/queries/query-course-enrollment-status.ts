import { createApolloClient } from "../clients"
import type { GraphQLResponse } from "../types"
import { DocumentNode, gql } from "@apollo/client"

/** Payload inside `courseEnrollmentStatus.data` after the standard API wrapper. */
export interface CourseEnrollmentStatusData {
    enrollmentCount: number
    isEnrolled: boolean
}

const query1 = gql`
  query CourseEnrollmentStatus($request: CourseEnrollmentStatusRequest!) {
    courseEnrollmentStatus(request: $request) {
      success
      message
      error
      data {
        enrollmentCount
        isEnrolled
      }
    }
  }
`

export enum QueryCourseEnrollmentStatus {
    Query1 = "query1",
}

const queryMap: Record<QueryCourseEnrollmentStatus, DocumentNode> = {
    [QueryCourseEnrollmentStatus.Query1]: query1,
}

/** Variables for {@link CourseEnrollmentStatusRequest} on the schema. */
export interface QueryCourseEnrollmentStatusVariables {
    request: {
        courseId: string
    }
}

export interface QueryCourseEnrollmentStatusParams {
    query?: QueryCourseEnrollmentStatus
    variables: QueryCourseEnrollmentStatusVariables
    /** When set, `isEnrolled` reflects the current user; omit for anonymous (count only). */
    token?: string
}

export interface QueryCourseEnrollmentStatusResponse {
    courseEnrollmentStatus: GraphQLResponse<CourseEnrollmentStatusData>
}

/**
 * Enrollment summary for a course: total count and optional `isEnrolled` when a Bearer token is sent.
 *
 * Mirrors `ref/course-enrollment-status/course-enrollment-status.resolver.ts`.
 */
export const queryCourseEnrollmentStatus = async ({
    query = QueryCourseEnrollmentStatus.Query1,
    variables,
    token,
}: QueryCourseEnrollmentStatusParams) => {
    const apollo = createApolloClient({
        auth: Boolean(token),
        cache: false,
        token,
    })

    return apollo.query<QueryCourseEnrollmentStatusResponse>({
        query: queryMap[query],
        variables,
    })
}

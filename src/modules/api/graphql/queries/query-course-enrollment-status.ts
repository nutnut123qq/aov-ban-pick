import { createApolloClient } from "../clients"
import { DocumentNode, gql } from "@apollo/client"

/** Payload inside `courseEnrollmentStatus` returned by the resolver. */
export interface CourseEnrollmentStatusData {
    enrollmentCount: number
    isEnrolled: boolean
}

const query1 = gql`
  query CourseEnrollmentStatus($request: CourseEnrollmentStatusRequestInput!) {
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
    courseEnrollmentStatus: CourseEnrollmentStatusData
}

interface QueryCourseEnrollmentStatusRawResponse {
    courseEnrollmentStatus: {
        success: boolean
        message: string
        error?: string | null
        data?: CourseEnrollmentStatusData | null
    }
}

/**
 * Enrollment summary for a course: total count and optional `isEnrolled` when a Bearer token is sent.
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

    const result = await apollo.query<QueryCourseEnrollmentStatusRawResponse>({
        query: queryMap[query],
        variables,
    })

    return {
        ...result,
        data: {
            courseEnrollmentStatus: result.data?.courseEnrollmentStatus.data ?? {
                enrollmentCount: 0,
                isEnrolled: false,
            },
        },
    }
}

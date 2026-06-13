import type { PaymentType } from "@/modules/types"
import { createApolloClient } from "../clients"
import { DocumentNode, gql } from "@apollo/client"

/** Payload returned by `courseEnroll` mutation. */
export interface CourseEnrollData {
    checkoutUrl: string
    orderCode: string
    preflightTransactionId: string
    paymentLinkId: string
    amount: number
}

const mutation1 = gql`
  mutation CourseEnroll($request: CourseEnrollRequestInput!) {
    courseEnroll(request: $request) {
      success
      message
      error
      data {
        checkoutUrl
        orderCode
        preflightTransactionId
        paymentLinkId
        amount
      }
    }
  }
`

export enum MutationCourseEnroll {
    Mutation1 = "mutation1",
}

const mutationMap: Record<MutationCourseEnroll, DocumentNode> = {
    [MutationCourseEnroll.Mutation1]: mutation1,
}

/** Variables for {@link CourseEnrollRequest} on the schema. */
export interface MutateCourseEnrollVariables {
    request: {
        courseId: string
        paymentType: PaymentType
        payosReturnUrl?: string
        payosCancelUrl?: string
    }
}

export interface MutateCourseEnrollParams {
    mutation?: MutationCourseEnroll
    variables: MutateCourseEnrollVariables
    /** Required: mutation is guarded by Keycloak. */
    token: string
}

export interface MutateCourseEnrollResponse {
    courseEnroll: CourseEnrollData
}

interface MutateCourseEnrollRawResponse {
    courseEnroll: {
        success: boolean
        message: string
        error?: string | null
        data?: CourseEnrollData | null
    }
}

/**
 * Starts course checkout (PayOS or Sepay): creates preflight row and returns checkout URL / ids.
 */
export const mutateCourseEnroll = async ({
    mutation = MutationCourseEnroll.Mutation1,
    variables,
    token,
}: MutateCourseEnrollParams) => {
    const apollo = createApolloClient({
        auth: true,
        cache: false,
        token,
    })

    const result = await apollo.mutate<MutateCourseEnrollRawResponse>({
        mutation: mutationMap[mutation],
        variables,
    })

    const data = result.data?.courseEnroll.data

    return {
        ...result,
        data: data
            ? {
                courseEnroll: data,
            }
            : undefined,
    }
}

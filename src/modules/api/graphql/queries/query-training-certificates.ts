import { createApolloClient } from "../clients"
import { gql } from "@apollo/client"

export type CertificateStatus = "issued" | "revoked" | "expired"

/** Certificate record (matches backend `toCertificateResponse`). */
export interface CertificateEntity {
    id: string
    userId: string
    courseId: string | null
    programId: string | null
    templateId: string
    certificateNo: string
    issuedAt: string
    expiredAt: string | null
    status: CertificateStatus
    verifyToken: string
    pdfUrl: string | null
    revokedAt: string | null
    revokeReason: string | null
}

interface CertificatesListEnvelope {
    items: CertificateEntity[]
    meta: { page: number; size: number; total: number; totalPages: number }
}

const queryList = gql`
  query TrainingCertificatesList($query: JSON) {
    trainingCertificatesList(query: $query)
  }
`

const queryGet = gql`
  query TrainingCertificateGet($id: String!) {
    trainingCertificateGet(id: $id)
  }
`

interface ListData {
    trainingCertificatesList: CertificatesListEnvelope | null
}

interface GetData {
    trainingCertificateGet: CertificateEntity | null
}

/**
 * Lists certificates, optionally scoped to one learner (`userId`).
 */
export const listCertificates = async ({
    token,
    userId,
    page = 0,
    size = 50,
}: {
    token: string
    userId?: string
    page?: number
    size?: number
}): Promise<CertificateEntity[]> => {
    const apollo = createApolloClient({ auth: true, cache: false, token })
    const res = await apollo.query<ListData>({
        query: queryList,
        variables: {
            query: {
                userId,
                page,
                size,
                sortBy: "issuedAt",
                sortDir: "desc",
            },
        },
    })
    return res.data?.trainingCertificatesList?.items ?? []
}

/**
 * Fetches a single certificate by id.
 */
export const getCertificate = async ({
    token,
    id,
}: {
    token: string
    id: string
}): Promise<CertificateEntity | null> => {
    const apollo = createApolloClient({ auth: true, cache: false, token })
    const res = await apollo.query<GetData>({
        query: queryGet,
        variables: { id },
    })
    return res.data?.trainingCertificateGet ?? null
}

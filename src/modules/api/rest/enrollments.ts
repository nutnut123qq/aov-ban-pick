import { restRequest } from "./client"

/** Raw enrollment row from `GET /v1/training/enrollments` (matches `toEnrollmentResponse`). */
export interface TrainingEnrollmentRow {
    id: string
    userId: string
    courseId: string
    classId: string | null
    sourceType: string
    status: string
    enrolledAt: string | null
    startedAt: string | null
    completedAt: string | null
    expiredAt: string | null
    progressPercent: string | null
    lessonsCompleted: number | null
    lessonsTotal: number | null
    dueDate: string | null
    isOverdue: boolean
    assignedBy: string | null
    lastAccessedAt: string | null
}

interface EnrollmentsListEnvelope {
    items: TrainingEnrollmentRow[]
    meta: { page: number; size: number; totalItems: number; totalPages: number }
}

/**
 * Lists the current user's enrollments with assignment metadata
 * (`sourceType`, `dueDate`, `isOverdue`, lesson counts) that the GraphQL
 * `myEnrollments` query does not expose.
 */
export const listMyEnrollmentsRest = async ({
    token,
    userId,
    size = 200,
}: {
    token: string
    userId: string
    size?: number
}): Promise<TrainingEnrollmentRow[]> => {
    const res = await restRequest<EnrollmentsListEnvelope>(
        "training/enrollments",
        { token, query: { userId, page: 0, size } },
    )
    return res.items ?? []
}

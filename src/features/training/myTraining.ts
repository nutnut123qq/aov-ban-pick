import {
    queryMyEnrollments,
    getMyAccount,
    listMyEnrollmentsRest,
} from "@/modules/api"

/** Normalized enrollment that merges GraphQL course info with REST assignment metadata. */
export interface MergedEnrollment {
    id: string
    courseId: string
    classId: string | null
    courseTitle: string
    courseSlug: string | null
    thumbnailUrl: string | null
    category: string | null
    /** Normalized status from GraphQL: ENROLLED | COMPLETED | PENDING | DROPPED | REJECTED. */
    status: string
    /** Raw REST status: enrolled | in_progress | completed | … */
    rawStatus: string
    progress: number
    sourceType: string
    isAssigned: boolean
    dueDate: string | null
    isOverdue: boolean
    lessonsCompleted: number | null
    lessonsTotal: number | null
    completedAt: string | null
    lastAccessedAt: string | null
}

export interface MyTraining {
    userId: string | null
    fullName: string | null
    enrollments: MergedEnrollment[]
}

/**
 * Loads the current user's enrollments, merging:
 * - GraphQL `myEnrollments` → course title/slug/thumbnail, normalized status, progress.
 * - REST `/training/enrollments?userId` → sourceType, dueDate, isOverdue, lesson counts.
 *
 * Rows are matched by enrollment `id`. REST failures degrade gracefully (course list still shows).
 */
export const loadMyTraining = async (token: string): Promise<MyTraining> => {
    const account = await getMyAccount({ token }).catch(() => null)
    const userId = account?.id ?? null

    const [gqlRes, restRows] = await Promise.all([
        queryMyEnrollments({ token }).catch(() => null),
        userId
            ? listMyEnrollmentsRest({ token, userId }).catch(() => [])
            : Promise.resolve([]),
    ])

    const restById = new Map(restRows.map((r) => [r.id, r]))
    const gqlList = gqlRes?.data?.myEnrollments?.data ?? []

    const enrollments: MergedEnrollment[] = gqlList.map((e) => {
        const r = restById.get(e.id)
        return {
            id: e.id,
            courseId: e.courseId,
            classId: r?.classId ?? null,
            courseTitle: e.course?.title ?? "Khóa học",
            courseSlug: e.course?.slug ?? null,
            thumbnailUrl: e.course?.thumbnailUrl ?? null,
            category: e.course?.category?.name ?? null,
            status: e.status,
            rawStatus: r?.status ?? "",
            progress: e.progress ?? Number(r?.progressPercent ?? 0) ?? 0,
            sourceType: r?.sourceType ?? "self_enroll",
            isAssigned: r?.sourceType === "assigned",
            dueDate: r?.dueDate ?? null,
            isOverdue: r?.isOverdue ?? false,
            lessonsCompleted: r?.lessonsCompleted ?? null,
            lessonsTotal: r?.lessonsTotal ?? null,
            completedAt: e.completedAt ?? r?.completedAt ?? null,
            lastAccessedAt: r?.lastAccessedAt ?? null,
        }
    })

    return { userId, fullName: account?.fullName ?? null, enrollments }
}

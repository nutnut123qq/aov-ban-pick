import { createApolloClient } from "../clients"
import { gql } from "@apollo/client"

/** Lesson progress status (matches backend `LessonProgressStatus`). */
export type LessonProgressStatus =
    | "not_started"
    | "in_progress"
    | "completed"
    | "skipped"

/** One lesson-progress row for an enrollment (raw backend shape). */
export interface LessonProgressRow {
    id: string
    enrollmentId: string
    lessonId: string
    status: LessonProgressStatus
    progressPercent?: string | null
    completedAt?: string | null
    startedAt?: string | null
}

const queryList = gql`
  query TrainingEnrollmentLessonProgressesList($enrollmentId: String!, $query: JSON) {
    trainingEnrollmentLessonProgressesList(enrollmentId: $enrollmentId, query: $query)
  }
`

const mutationUpsert = gql`
  mutation TrainingEnrollmentLessonProgressUpsert(
    $enrollmentId: String!
    $lessonId: String!
    $input: JSON!
  ) {
    trainingEnrollmentLessonProgressUpsert(
      enrollmentId: $enrollmentId
      lessonId: $lessonId
      input: $input
    )
  }
`

interface ListData {
    trainingEnrollmentLessonProgressesList:
        | { data?: LessonProgressRow[]; count?: number }
        | LessonProgressRow[]
        | null
}

interface UpsertData {
    trainingEnrollmentLessonProgressUpsert: LessonProgressRow | null
}

/**
 * Lists lesson-progress rows for one enrollment. Normalises the paginated/array payload to an array.
 */
export const listLessonProgress = async ({
    enrollmentId,
    token,
}: {
    enrollmentId: string
    token: string
}): Promise<LessonProgressRow[]> => {
    const apollo = createApolloClient({
        auth: true,
        cache: false,
        token,
    })

    const res = await apollo.query<ListData>({
        query: queryList,
        variables: { enrollmentId, query: { size: 500 } },
    })

    const payload = res.data?.trainingEnrollmentLessonProgressesList
    if (!payload) return []
    if (Array.isArray(payload)) return payload
    return payload.data ?? []
}

/**
 * Creates or updates the learner's progress for a single lesson.
 */
export const upsertLessonProgress = async ({
    enrollmentId,
    lessonId,
    status,
    token,
}: {
    enrollmentId: string
    lessonId: string
    status: LessonProgressStatus
    token: string
}): Promise<LessonProgressRow | null> => {
    const apollo = createApolloClient({
        auth: true,
        cache: false,
        token,
    })

    const input: Record<string, unknown> = { status }
    if (status === "completed") {
        input.completedAt = new Date().toISOString()
        input.progressPercent = "100"
    }

    const res = await apollo.mutate<UpsertData>({
        mutation: mutationUpsert,
        variables: { enrollmentId, lessonId, input },
    })

    return res.data?.trainingEnrollmentLessonProgressUpsert ?? null
}

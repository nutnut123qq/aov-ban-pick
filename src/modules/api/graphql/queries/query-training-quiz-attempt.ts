import { createApolloClient } from "../clients"
import { gql } from "@apollo/client"

/** One answered question sent to `trainingQuizAttemptSubmit`. */
export interface QuizAnswerInput {
    questionId: string
    selectedOptionIds?: string[]
    answerText?: string
}

/** Result summary handed from the quiz page to the result page via sessionStorage. */
export interface QuizResultSummary {
    percentage: number
    earnedPoints: number
    totalPoints: number
    passed: boolean
    correctAnswers: number
    totalQuestions: number
    passingScore: number
}

/** sessionStorage key holding the latest {@link QuizResultSummary} for a quiz. */
export const quizResultStorageKey = (quizId: string) => `quiz-result-${quizId}`

/** Attempt row returned by start/submit (raw backend shape). */
export interface QuizAttemptResult {
    id: string
    quizId: string
    enrollmentId: string
    attemptNo: number
    status: string
    score?: string | null
    percentage?: string | null
    passed?: boolean | null
    startedAt?: string | null
    submittedAt?: string | null
}

/** Graded answer row returned alongside a submitted attempt. */
export interface QuizAttemptAnswerResult {
    id: string
    questionId: string
    selectedOptionIds?: string[] | null
    answerText?: string | null
    autoScore?: string | null
    manualScore?: string | null
}

export interface QuizAttemptEnvelope {
    attempt: QuizAttemptResult
    answers: QuizAttemptAnswerResult[]
}

const mutationStart = gql`
  mutation TrainingQuizAttemptStart($quizId: String!, $input: JSON!) {
    trainingQuizAttemptStart(quizId: $quizId, input: $input)
  }
`

const mutationSubmit = gql`
  mutation TrainingQuizAttemptSubmit($attemptId: String!, $input: JSON!) {
    trainingQuizAttemptSubmit(attemptId: $attemptId, input: $input)
  }
`

const queryAttemptGet = gql`
  query TrainingQuizAttemptGet($attemptId: String!) {
    trainingQuizAttemptGet(attemptId: $attemptId)
  }
`

interface StartData {
    trainingQuizAttemptStart: QuizAttemptResult | null
}

interface SubmitData {
    trainingQuizAttemptSubmit: QuizAttemptEnvelope | null
}

interface AttemptGetData {
    trainingQuizAttemptGet: QuizAttemptEnvelope | null
}

/**
 * Fetches a submitted attempt (server-side scored) + the learner's answers.
 * Used by the result page so the score can't be tampered via sessionStorage.
 */
export const getTrainingQuizAttempt = async ({
    attemptId,
    token,
}: {
    attemptId: string
    token: string
}): Promise<QuizAttemptEnvelope | null> => {
    const apollo = createApolloClient({ auth: true, cache: false, token })
    const res = await apollo.query<AttemptGetData>({
        query: queryAttemptGet,
        variables: { attemptId },
    })
    return res.data?.trainingQuizAttemptGet ?? null
}

/**
 * Starts a new quiz attempt for the learner's enrollment.
 *
 * @returns The created attempt (with `id`) or `null` on failure.
 */
export const startTrainingQuizAttempt = async ({
    quizId,
    enrollmentId,
    token,
}: {
    quizId: string
    enrollmentId: string
    token: string
}): Promise<QuizAttemptResult | null> => {
    const apollo = createApolloClient({
        auth: true,
        cache: false,
        token,
    })

    const res = await apollo.mutate<StartData>({
        mutation: mutationStart,
        variables: {
            quizId,
            input: { enrollmentId },
        },
    })

    return res.data?.trainingQuizAttemptStart ?? null
}

/**
 * Submits answers for an in-progress attempt; backend scores and returns the graded attempt + answers.
 *
 * @returns `{ attempt, answers }` (attempt has `score`, `percentage`, `passed`) or `null` on failure.
 */
export const submitTrainingQuizAttempt = async ({
    attemptId,
    answers,
    token,
}: {
    attemptId: string
    answers: QuizAnswerInput[]
    token: string
}): Promise<QuizAttemptEnvelope | null> => {
    const apollo = createApolloClient({
        auth: true,
        cache: false,
        token,
    })

    const res = await apollo.mutate<SubmitData>({
        mutation: mutationSubmit,
        variables: {
            attemptId,
            input: { answers },
        },
    })

    return res.data?.trainingQuizAttemptSubmit ?? null
}

import { createApolloClient } from "../clients"
import { DocumentNode, gql } from "@apollo/client"

export type QuizStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"
export type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "ESSAY" | "FILL_BLANK"
export type SurveyStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"
export type SurveyQuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT" | "RATING" | "MATRIX"

export interface QuizEntity {
    id: string
    title: string
    description?: string
    courseId: string
    course?: {
        id: string
        title: string
        slug: string
    }
    duration: number
    passingScore: number
    maxAttempts: number
    isRandomized: boolean
    showResults: boolean
    allowReview: boolean
    questions: QuizQuestionEntity[]
    status: QuizStatus
    attemptCount?: number
    averageScore?: number
    createdAt: string
    updatedAt: string
}

export interface QuizQuestionEntity {
    id: string
    quizId: string
    text: string
    type: QuestionType
    order: number
    points: number
    explanation?: string
    options?: QuizOptionEntity[]
}

export interface QuizOptionEntity {
    id: string
    questionId: string
    text: string
    order: number
    isCorrect: boolean
}

export interface SurveyEntity {
    id: string
    title: string
    description?: string
    courseId?: string
    course?: {
        id: string
        title: string
        slug: string
    }
    isAnonymous: boolean
    allowMultipleResponses: boolean
    showResults: boolean
    questions: SurveyQuestionEntity[]
    status: SurveyStatus
    responseCount?: number
    createdAt: string
    updatedAt: string
}

export interface SurveyQuestionEntity {
    id: string
    surveyId: string
    text: string
    type: SurveyQuestionType
    order: number
    isRequired: boolean
    options?: SurveyOptionEntity[]
}

export interface SurveyOptionEntity {
    id: string
    questionId: string
    text: string
    order: number
}

const queryQuizDetail = gql`
  query TrainingQuizDetail($id: String!) {
    trainingQuizDetail(id: $id)
  }
`

const querySurveyDetail = gql`
  query TrainingSurveyDetail($id: String!) {
    trainingSurveyDetail(id: $id)
  }
`

const mutationSurveySubmit = gql`
  mutation TrainingSurveySubmitResponse($id: String!, $input: JSON!) {
    trainingSurveySubmitResponse(id: $id, input: $input)
  }
`

export enum QueryTrainingAssessments {
    QuizDetail = "quizDetail",
    SurveyDetail = "surveyDetail",
    SurveySubmit = "surveySubmit",
}

const queryMap: Record<QueryTrainingAssessments, DocumentNode> = {
    [QueryTrainingAssessments.QuizDetail]: queryQuizDetail,
    [QueryTrainingAssessments.SurveyDetail]: querySurveyDetail,
    [QueryTrainingAssessments.SurveySubmit]: mutationSurveySubmit,
}

interface RawQuiz {
    id: string
    courseId?: string | null
    lessonId?: string | null
    title?: string | null
    description?: string | null
    durationMinutes?: number | string | null
    passScore?: number | string | null
    maxScore?: number | string | null
    maxAttempts?: number | null
    shuffleQuestions?: boolean | null
    status?: string | null
    createdAt?: string | null
    updatedAt?: string | null
}

interface RawQuizQuestion {
    id: string
    quizId: string
    questionType?: string | null
    content?: string | null
    explanation?: string | null
    points?: number | string | null
    sortOrder?: number | null
}

interface RawQuizAnswer {
    id: string
    questionId: string
    optionText?: string | null
    isCorrect?: boolean | null
    sortOrder?: number | null
}

interface RawQuizDetail {
    quiz: RawQuiz
    items: Array<{
        question: RawQuizQuestion
        answers: RawQuizAnswer[]
    }>
}

interface RawSurvey {
    id: string
    courseId?: string | null
    title?: string | null
    description?: string | null
    isAnonymous?: boolean | null
    status?: string | null
    createdAt?: string | null
    updatedAt?: string | null
}

interface RawSurveyQuestion {
    id: string
    surveyId: string
    questionType?: string | null
    title?: string | null
    isRequired?: boolean | null
    sortOrder?: number | null
}

interface RawSurveyOption {
    id: string
    questionId: string
    optionText?: string | null
    sortOrder?: number | null
}

interface RawSurveyDetail {
    survey: RawSurvey
    items: Array<{
        question: RawSurveyQuestion
        options: RawSurveyOption[]
    }>
}

interface QuizDetailData {
    trainingQuizDetail: RawQuizDetail | null
}

interface SurveyDetailData {
    trainingSurveyDetail: RawSurveyDetail | null
}

const mapQuizQuestionType = (type?: string | null): QuestionType => {
    switch (type) {
        case "multiple_choice":
            return "MULTIPLE_CHOICE"
        case "true_false":
            return "TRUE_FALSE"
        case "short_answer":
            return "ESSAY"
        case "fill_blank":
            return "FILL_BLANK"
        default:
            return "MULTIPLE_CHOICE"
    }
}

const mapSurveyQuestionType = (type?: string | null): SurveyQuestionType => {
    switch (type) {
        case "single_choice":
        case "boolean":
            return "SINGLE_CHOICE"
        case "multiple_choice":
            return "MULTIPLE_CHOICE"
        case "rating":
        case "nps":
            return "RATING"
        case "text":
            return "TEXT"
        default:
            return "TEXT"
    }
}

const mapQuiz = (detail: RawQuizDetail): QuizEntity => ({
    id: detail.quiz.id,
    title: detail.quiz.title ?? "Bài kiểm tra",
    description: detail.quiz.description ?? undefined,
    courseId: detail.quiz.courseId ?? "",
    course: detail.quiz.courseId
        ? {
            id: detail.quiz.courseId,
            title: "",
            slug: detail.quiz.courseId,
        }
        : undefined,
    duration: Number(detail.quiz.durationMinutes ?? 0) * 60,
    passingScore: Number(detail.quiz.passScore ?? 0),
    maxAttempts: detail.quiz.maxAttempts ?? 1,
    isRandomized: detail.quiz.shuffleQuestions ?? false,
    showResults: true,
    allowReview: true,
    questions: detail.items.map(({ question, answers }) => ({
        id: question.id,
        quizId: question.quizId,
        text: question.content ?? "",
        type: mapQuizQuestionType(question.questionType),
        order: question.sortOrder ?? 0,
        points: Number(question.points ?? 0),
        explanation: question.explanation ?? undefined,
        options: answers.map((answer) => ({
            id: answer.id,
            questionId: answer.questionId,
            text: answer.optionText ?? "",
            order: answer.sortOrder ?? 0,
            isCorrect: answer.isCorrect ?? false,
        })),
    })),
    status: (detail.quiz.status?.toUpperCase() as QuizStatus | undefined) ?? "PUBLISHED",
    createdAt: detail.quiz.createdAt ?? "",
    updatedAt: detail.quiz.updatedAt ?? "",
})

const mapSurvey = (detail: RawSurveyDetail): SurveyEntity => ({
    id: detail.survey.id,
    title: detail.survey.title ?? "Khảo sát",
    description: detail.survey.description ?? undefined,
    courseId: detail.survey.courseId ?? undefined,
    course: detail.survey.courseId
        ? {
            id: detail.survey.courseId,
            title: "",
            slug: detail.survey.courseId,
        }
        : undefined,
    isAnonymous: detail.survey.isAnonymous ?? false,
    allowMultipleResponses: false,
    showResults: false,
    questions: detail.items.map(({ question, options }) => ({
        id: question.id,
        surveyId: question.surveyId,
        text: question.title ?? "",
        type: mapSurveyQuestionType(question.questionType),
        order: question.sortOrder ?? 0,
        isRequired: question.isRequired ?? false,
        options: options.map((option) => ({
            id: option.id,
            questionId: option.questionId,
            text: option.optionText ?? "",
            order: option.sortOrder ?? 0,
        })),
    })),
    status: (detail.survey.status?.toUpperCase() as SurveyStatus | undefined) ?? "PUBLISHED",
    createdAt: detail.survey.createdAt ?? "",
    updatedAt: detail.survey.updatedAt ?? "",
})

export const queryTrainingQuiz = async ({
    id,
    token,
}: {
    id: string
    token: string
}) => {
    const apollo = createApolloClient({
        auth: true,
        cache: false,
        token,
    })

    const res = await apollo.query<QuizDetailData>({
        query: queryMap[QueryTrainingAssessments.QuizDetail],
        variables: { id },
    })

    const detail = res.data?.trainingQuizDetail
    return detail ? mapQuiz(detail) : null
}

export const submitTrainingSurvey = async ({
    id,
    token,
    details,
    enrollmentId,
}: {
    id: string
    token: string
    details: Array<{
        questionId: string
        selectedOptionIds?: string[]
        answerText?: string
        numericValue?: number
    }>
    enrollmentId?: string
}) => {
    const apollo = createApolloClient({
        auth: true,
        cache: false,
        token,
    })

    return apollo.mutate({
        mutation: queryMap[QueryTrainingAssessments.SurveySubmit],
        variables: {
            id,
            input: {
                enrollmentId,
                details,
            },
        },
    })
}

export const queryTrainingSurvey = async ({
    id,
    token,
}: {
    id: string
    token: string
}) => {
    const apollo = createApolloClient({
        auth: true,
        cache: false,
        token,
    })

    const res = await apollo.query<SurveyDetailData>({
        query: queryMap[QueryTrainingAssessments.SurveyDetail],
        variables: { id },
    })

    const detail = res.data?.trainingSurveyDetail
    return detail ? mapSurvey(detail) : null
}

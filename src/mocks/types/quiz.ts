// Quiz Types
export type QuizStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"
export type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "ESSAY" | "FILL_BLANK"
export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "GRADED"

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
    duration: number // seconds
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
    correctAnswer?: string
    // For essay/fill blank
    acceptableAnswers?: string[]
}

export interface QuizOptionEntity {
    id: string
    questionId: string
    text: string
    order: number
    isCorrect: boolean
}

export interface QuizAttemptEntity {
    id: string
    quizId: string
    quiz?: QuizEntity
    userId: string
    user?: {
        id: string
        username: string
        email: string
        firstName?: string
        lastName?: string
    }
    startedAt: string
    submittedAt?: string | null
    score?: number
    totalPoints: number
    earnedPoints?: number
    status: AttemptStatus
    answers: QuizAnswerEntity[]
    timeSpent: number
}

export interface QuizAnswerEntity {
    id: string
    attemptId: string
    questionId: string
    selectedOptionIds?: string[]
    textAnswer?: string
    isCorrect?: boolean
    points: number
    feedback?: string
}

// Survey Types
export type SurveyStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"
export type SurveyQuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT" | "RATING" | "MATRIX"

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

export interface SurveyResponseEntity {
    id: string
    surveyId: string
    userId: string
    user?: {
        id: string
        username: string
        email: string
    }
    answers: SurveyAnswerEntity[]
    submittedAt: string
}

export interface SurveyAnswerEntity {
    id: string
    responseId: string
    questionId: string
    selectedOptionIds?: string[]
    textAnswer?: string
    rating?: number
}

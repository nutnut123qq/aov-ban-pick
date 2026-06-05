// Program Types
export type ProgramStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"

export interface TrainingProgramEntity {
    id: string
    title: string
    slug: string
    description?: string
    shortDescription?: string
    thumbnail?: string | null
    price: number
    discountPrice?: number | null
    currency: string
    duration: number
    level?: string
    curriculumItems: CurriculumItemEntity[]
    status: ProgramStatus
    enrollmentCount: number
    courseCount: number
    isFeatured: boolean
    publishedAt?: string | null
    createdAt: string
    updatedAt: string
}

export interface CurriculumItemEntity {
    id: string
    programId: string
    courseId: string
    course?: {
        id: string
        title: string
        slug: string
        thumbnail?: string | null
        duration: number
        instructorIds: string[]
    }
    order: number
    isRequired: boolean
    estimatedDuration?: number
}

export interface LearningPathEntity {
    id: string
    title: string
    slug: string
    description?: string
    thumbnail?: string | null
    courses: LearningPathCourseEntity[]
    status: ProgramStatus
    enrollmentCount: number
    createdAt: string
    updatedAt: string
}

export interface LearningPathCourseEntity {
    id: string
    learningPathId: string
    courseId: string
    course?: {
        id: string
        title: string
        slug: string
        thumbnail?: string | null
        duration: number
    }
    order: number
    isRequired: boolean
}

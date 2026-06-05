import type { AbstractEntity } from "./abstract"

export interface LearningPathEntity {
    id: string
    title: string
    slug: string
    description?: string
    thumbnail?: string | null
    courses?: Array<{
        id: string
        title: string
        slug: string
        thumbnail?: string | null
        duration: number
    }>
    status: string
    enrollmentCount: number
    order: number
    courseCount: number
    createdAt: string
    updatedAt: string
}

export interface TrainingProgramEntity extends AbstractEntity {
    title: string
    description?: string
    shortDescription?: string
    slug: string
    thumbnail?: string | null
    price: number
    discountPrice?: number | null
    currency: string
    duration: number
    level?: string
    curriculumItems?: Array<{
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
    }>
    status: string
    enrollmentCount: number
    courseCount: number
    isFeatured: boolean
    publishedAt?: string | null
    paths?: Array<LearningPathEntity>
}

// Course Types
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"
export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED"

export interface CourseCategoryEntity {
    id: string
    name: string
    slug: string
    description?: string
    icon?: string
    parentId?: string | null
    order: number
    isActive: boolean
    courseCount: number
    createdAt: string
    updatedAt: string
}

export interface InstructorEntity {
    id: string
    userId: string
    user?: {
        id: string
        username: string
        email: string
        firstName?: string
        lastName?: string
        avatar?: string | null
    }
    bio?: string
    title?: string
    socialLinks?: {
        website?: string
        linkedin?: string
        twitter?: string
    }
    createdAt: string
}

export interface CourseEntity {
    id: string
    title: string
    slug: string
    description?: string
    shortDescription?: string
    thumbnail?: string | null
    previewVideoUrl?: string | null
    cdnUrl?: string | null
    price: number
    discountPrice?: number | null
    currency: string
    duration: number
    level: CourseLevel
    language?: string
    categoryId: string
    category?: CourseCategoryEntity
    instructorIds: string[]
    instructors?: InstructorEntity[]
    tags?: string[]
    requirements?: string[]
    outcomes?: string[]
    status: CourseStatus
    enrollmentCount: number
    rating?: number
    reviewCount: number
    isFeatured: boolean
    isPremium: boolean
    publishedAt?: string | null
    createdAt: string
    updatedAt: string
}

export interface CourseSectionEntity {
    id: string
    courseId: string
    title: string
    description?: string
    order: number
    isPublished: boolean
    chapters?: CourseChapterEntity[]
    createdAt: string
    updatedAt: string
}

export interface CourseChapterEntity {
    id: string
    sectionId: string
    title: string
    description?: string
    order: number
    isPublished: boolean
    lessons?: LessonEntity[]
    createdAt: string
    updatedAt: string
}

export interface LessonEntity {
    id: string
    chapterId: string
    courseId: string
    title: string
    description?: string
    type: "VIDEO" | "TEXT" | "QUIZ" | "ASSIGNMENT" | "LIVE"
    duration?: number
    order: number
    isFree: boolean
    isPublished: boolean
    content?: {
        videoUrl?: string
        textContent?: string
        quizId?: string
        assignmentId?: string
    }
    materials?: LessonMaterialEntity[]
    createdAt: string
    updatedAt: string
}

export interface LessonMaterialEntity {
    id: string
    lessonId: string
    title: string
    type: "PDF" | "DOCUMENT" | "IMAGE" | "LINK" | "CODE"
    url: string
    size?: number
    createdAt: string
}

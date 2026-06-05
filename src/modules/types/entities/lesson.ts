import type { AbstractEntity } from "./abstract"
import type { LessonMaterialEntity } from "./lesson-material"
import type { LessonType } from "@/modules/types/enums"

export interface LessonEntity extends AbstractEntity {
    chapterId: string
    courseId: string
    title: string
    description?: string
    type: LessonType
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
    materials?: Array<LessonMaterialEntity>
}

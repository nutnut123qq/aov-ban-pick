import type { AbstractEntity } from "./abstract"
import type { LessonEntity } from "./lesson"

export interface CourseChapterEntity extends AbstractEntity {
    sectionId: string
    title: string
    description?: string
    order: number
    isPublished: boolean
    lessons?: Array<LessonEntity>
}

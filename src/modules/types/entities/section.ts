import type { AbstractEntity } from "./abstract"
import type { CourseChapterEntity } from "./chapter"

export interface CourseSectionEntity extends AbstractEntity {
    courseId: string
    title: string
    description?: string
    order: number
    isPublished: boolean
    chapters?: Array<CourseChapterEntity>
}

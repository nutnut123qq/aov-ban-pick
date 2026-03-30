import type { AbstractEntity } from "./abstract"
import type { AdvancedContentEntity } from "./advanced-content"
import type { ContentEntity } from "./content"
import type { CourseEntity } from "./course"
import type { ExclusiveLessonVideoEntity } from "./exclusive-lesson-video"
import type { GeneralContentEntity } from "./general-content"
import type { OutcomeEntity } from "./outcome"
import type { SubmissionEntity } from "./submission"

/**
 * One module inside a course.
 */
export interface ModuleEntity extends AbstractEntity {
    /** The title of the module. */
    title: string
    /** The description of the module. */
    description: string | null
    /** The order index of the module. */
    orderIndex: number
    /** The course that the module belongs to. */
    course?: CourseEntity
    /** The general content of the module. */
    generalContent?: GeneralContentEntity
    /** The advanced content of the module. */
    advancedContent?: AdvancedContentEntity
    /** The contents of the module. */
    contents?: Array<ContentEntity>
    /** The exclusive lesson videos of the module. */
    exclusiveLessonVideos?: Array<ExclusiveLessonVideoEntity>
    /** The outcomes of the module. */
    outcomes?: Array<OutcomeEntity>
    /** The submissions of the module. */
    submissions?: Array<SubmissionEntity>
}

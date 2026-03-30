import type { AbstractEntity } from "./abstract"
import type { CourseEntity } from "./course"

/**
 * One bullet value-proposition line for a course (1:N from {@link CourseEntity}).
 */
export interface ValuePropositionEntity extends AbstractEntity {
    /** HTML or plain text line shown on the landing page. */
    content: string
    /** Display order (lower first). */
    orderIndex: number
    /** Owning course when nested in a full graph. */
    course?: CourseEntity
}

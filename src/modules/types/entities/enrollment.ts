import type { AbstractEntity } from "./abstract"
import type { CourseEntity } from "./course"
import type { UserEntity } from "./user"

/**
 * User enrolled in a course (join table).
 */
export interface EnrollmentEntity extends AbstractEntity {
    /** The user that is enrolled in the course. */
    user?: UserEntity
    /** The course that the user is enrolled in. */
    course?: CourseEntity
    /** The user ID. */
    userId: string
    /** The course ID. */
    courseId: string
}

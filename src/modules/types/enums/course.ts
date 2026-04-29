// Course-related types and enums

/**
 * Course difficulty levels
 */
export const CourseLevel = {
    BEGINNER: "BEGINNER",
    INTERMEDIATE: "INTERMEDIATE",
    ADVANCED: "ADVANCED",
} as const

export type CourseLevel = typeof CourseLevel[keyof typeof CourseLevel]

/**
 * Course status
 */
export const CourseStatus = {
    DRAFT: "DRAFT",
    PUBLISHED: "PUBLISHED",
    ARCHIVED: "ARCHIVED",
    PENDING_REVIEW: "PENDING_REVIEW",
} as const

export type CourseStatus = typeof CourseStatus[keyof typeof CourseStatus]

/**
 * Lesson types
 */
export const LessonType = {
    VIDEO: "VIDEO",
    TEXT: "TEXT",
    QUIZ: "QUIZ",
    ASSIGNMENT: "ASSIGNMENT",
    PROJECT: "PROJECT",
} as const

export type LessonType = typeof LessonType[keyof typeof LessonType]

/**
 * Enrollment status
 */
export const EnrollmentStatus = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    ENROLLED: "ENROLLED",
    DROPPED: "DROPPED",
    COMPLETED: "COMPLETED",
} as const

export type EnrollmentStatus = typeof EnrollmentStatus[keyof typeof EnrollmentStatus]

/**
 * Class status
 */
export const ClassStatus = {
    SCHEDULED: "SCHEDULED",
    ONGOING: "ONGOING",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
} as const

export type ClassStatus = typeof ClassStatus[keyof typeof ClassStatus]

/**
 * Class member role
 */
export const ClassMemberRole = {
    STUDENT: "STUDENT",
    INSTRUCTOR: "INSTRUCTOR",
    TEACHING_ASSISTANT: "TEACHING_ASSISTANT",
} as const

export type ClassMemberRole = typeof ClassMemberRole[keyof typeof ClassMemberRole]

/**
 * Class member status
 */
export const ClassMemberStatus = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
    DROPPED: "DROPPED",
    COMPLETED: "COMPLETED",
} as const

export type ClassMemberStatus = typeof ClassMemberStatus[keyof typeof ClassMemberStatus]

// Class Types
export type ClassStatus = "DRAFT" | "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED"
export type EnrollmentStatus = "PENDING" | "APPROVED" | "REJECTED" | "ENROLLED" | "DROPPED" | "COMPLETED"

export interface ClassEntity {
    id: string
    title: string
    description?: string
    courseId: string
    course?: {
        id: string
        title: string
        slug: string
        thumbnail?: string | null
    }
    instructorIds: string[]
    instructors?: {
        id: string
        userId: string
        user: {
            id: string
            username: string
            email: string
            firstName?: string
            lastName?: string
            avatar?: string | null
        }
    }[]
    startDate: string
    endDate: string
    maxStudents: number
    enrolledCount: number
    status: ClassStatus
    schedules: ClassScheduleEntity[]
    location?: string
    onlineLink?: string
    createdAt: string
    updatedAt: string
}

export interface ClassScheduleEntity {
    id: string
    classId: string
    dayOfWeek: number
    startTime: string
    endTime: string
    room?: string
    onlineLink?: string
}

export interface ClassMemberEntity {
    id: string
    classId: string
    userId: string
    user?: {
        id: string
        username: string
        email: string
        firstName?: string
        lastName?: string
        avatar?: string | null
    }
    role: "STUDENT" | "TEACHING_ASSISTANT"
    status: "ACTIVE" | "DROPPED" | "GRADUATED"
    enrolledAt: string
    droppedAt?: string | null
    completedAt?: string | null
}

export interface EnrollmentEntity {
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
    courseId: string
    course?: {
        id: string
        title: string
        slug: string
        thumbnail?: string | null
        duration: number
    }
    classId?: string
    class?: {
        id: string
        title: string
    }
    status: EnrollmentStatus
    progress: number
    enrolledAt: string
    completedAt?: string | null
    lastAccessedAt?: string | null
    createdAt: string
    updatedAt: string
}

export interface LessonProgressEntity {
    id: string
    enrollmentId: string
    lessonId: string
    lesson?: {
        id: string
        title: string
        type: string
        duration?: number
    }
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"
    progress: number
    timeSpent: number
    lastPosition?: number
    completedAt?: string | null
    createdAt: string
    updatedAt: string
}

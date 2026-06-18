import { restRequest } from "./client"

export type HealthStatus = "overdue" | "at_risk" | "on_track"

/** One learner row in team/learner reports. */
export interface LearnerRow {
    userId: string
    fullName: string
    email: string | null
    employeeCode: string | null
    departmentName: string | null
    enrollments: number
    completed: number
    inProgress: number
    overdue: number
    avgProgress: number
    lastActivity: string | null
    healthStatus: HealthStatus
}

/** `GET /v1/training/reports/my-team`. */
export interface MyTeamReport {
    isManager: boolean
    scope: {
        departments: { id: string; name: string }[]
        teams: { id: string; name: string }[]
    }
    summary: {
        totalLearners: number
        avgProgress: number
        totalEnrollments: number
        completed: number
        inProgress: number
        overdue: number
    }
    learners: LearnerRow[]
}

/** `GET /v1/training/reports/learners/:userId`. */
export interface LearnerProfile {
    user: {
        id: string
        fullName: string
        email: string | null
        employeeCode: string | null
        status: string
    }
    enrollments: {
        id: string
        courseId: string
        courseTitle: string
        status: string
        progressPercent: number
        lessonsCompleted: number
        lessonsTotal: number
        dueDate: string | null
        completedAt: string | null
        lastAccessedAt: string | null
    }[]
    quiz: { attempts: number; avgScore: number }
    attendance: { total: number; present: number; rate: number }
    certificatesIssued: number
}

/** Team report for the current user (managers see their scope; others get `isManager: false`). */
export const getMyTeamReport = ({ token }: { token: string }) =>
    restRequest<MyTeamReport>("training/reports/my-team", { token })

/** Detailed learning profile of one learner (manager drill-down). */
export const getLearnerProfile = ({
    token,
    userId,
}: {
    token: string
    userId: string
}) =>
    restRequest<LearnerProfile>(`training/reports/learners/${userId}`, { token })

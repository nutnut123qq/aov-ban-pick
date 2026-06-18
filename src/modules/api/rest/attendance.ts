import { restRequest } from "./client"

export type AttendanceStatus =
    | "present"
    | "absent"
    | "late"
    | "excused"
    | "online_present"

/** One attendance session of a class, with the current user's record status. */
export interface MyAttendanceSession {
    id: string
    classId: string
    title: string | null
    attendanceAt: string
    closeAt: string | null
    checkinMode: string | null
    myStatus: AttendanceStatus | null
    myCheckinAt: string | null
}

export interface MyClassAttendance {
    classId: string
    isMember: boolean
    sessions: MyAttendanceSession[]
}

/** Attendance sessions of a class + the learner's own check-in status. */
export const getMyClassAttendance = ({
    token,
    classId,
}: {
    token: string
    classId: string
}) =>
    restRequest<MyClassAttendance>(`training/classes/${classId}/my-attendance`, {
        token,
    })

/** Self check-in for an attendance session (idempotent). */
export const selfCheckIn = ({
    token,
    sessionId,
}: {
    token: string
    sessionId: string
}) =>
    restRequest<{ id: string; status: AttendanceStatus; checkinAt: string | null }>(
        `training/attendance-sessions/${sessionId}/check-in`,
        { token, method: "POST", body: {} },
    )

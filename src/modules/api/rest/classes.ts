import { restRequest } from "./client"

export interface TrainingClass {
    id: string
    code: string | null
    name: string
    description: string | null
    status: string
    createdAt: string
    updatedAt: string
}

export interface ClassSchedule {
    id: string
    classId: string
    title: string | null
    startTime: string
    endTime: string
    location: string | null
}

export interface ClassMember {
    id: string
    classId: string
    userId: string
    fullName: string | null
    email: string | null
    avatarUrl: string | null
    joinedAt: string | null
}

interface ListEnvelope<T> {
    items: T[]
}

/** Fetches a class by id. */
export const getClass = ({ token, id }: { token: string; id: string }) =>
    restRequest<TrainingClass>(`training/classes/${id}`, { token })

/** Lists schedule sessions of a class. */
export const listClassSchedules = async ({
    token,
    classId,
}: {
    token: string
    classId: string
}): Promise<ClassSchedule[]> => {
    const res = await restRequest<ListEnvelope<ClassSchedule>>(
        `training/classes/${classId}/schedules`,
        { token, query: { page: 0, size: 100 } },
    )
    return res.items ?? []
}

/** Lists members of a class. */
export const listClassMembers = async ({
    token,
    classId,
}: {
    token: string
    classId: string
}): Promise<ClassMember[]> => {
    const res = await restRequest<ListEnvelope<ClassMember>>(
        `training/classes/${classId}/members`,
        { token, query: { page: 0, size: 100 } },
    )
    return res.items ?? []
}

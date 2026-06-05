"use client"
import React, { PropsWithChildren, useMemo } from "react"
import { createContext } from "react"
import {
    useMutateCourseEnrollSwrCore,
    useQueryCourseEnrollmentStatusSwrCore,
    useQueryCourseSwrCore,
    useQueryCoursesSwrCore,
    useQueryMyEnrollmentsSwrCore,
    useQueryUserSwrCore,
} from "./core"

export interface SwrContextType {
    queryCourseSwr: ReturnType<typeof useQueryCourseSwrCore>;
    queryCourseEnrollmentStatusSwr: ReturnType<typeof useQueryCourseEnrollmentStatusSwrCore>;
    queryCoursesSwr: ReturnType<typeof useQueryCoursesSwrCore>;
    queryUserSwr: ReturnType<typeof useQueryUserSwrCore>;
    queryMyEnrollmentsSwr: ReturnType<typeof useQueryMyEnrollmentsSwrCore>;
    mutateCourseEnrollSwr: ReturnType<typeof useMutateCourseEnrollSwrCore>;
}

export const SwrContext = createContext<SwrContextType | null>(null)

export const SwrProvider = ({ children }: PropsWithChildren) => {
    const queryCourseSwr = useQueryCourseSwrCore()
    const queryCourseEnrollmentStatusSwr = useQueryCourseEnrollmentStatusSwrCore()
    const queryCoursesSwr = useQueryCoursesSwrCore()
    const queryUserSwr = useQueryUserSwrCore()
    const queryMyEnrollmentsSwr = useQueryMyEnrollmentsSwrCore()
    const mutateCourseEnrollSwr = useMutateCourseEnrollSwrCore()
    const values = useMemo(
        () => ({
            queryCourseSwr,
            queryCourseEnrollmentStatusSwr,
            queryCoursesSwr,
            queryUserSwr,
            queryMyEnrollmentsSwr,
            mutateCourseEnrollSwr,
        }),
        [
            queryCourseSwr,
            queryCourseEnrollmentStatusSwr,
            queryCoursesSwr,
            queryUserSwr,
            queryMyEnrollmentsSwr,
            mutateCourseEnrollSwr,
        ]
    )
    return (
        <SwrContext.Provider value={values}>
            {children}
        </SwrContext.Provider>
    )
}

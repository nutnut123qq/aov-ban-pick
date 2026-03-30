import { queryCourseEnrollmentStatus } from "@/modules/api"
import { useKeycloak } from "@/hooks/singleton"
import { useAppSelector } from "@/redux"
import useSWR from "swr"

/**
 * The core function to query course enrollment status with SWR.
 */
export const useQueryCourseEnrollmentStatusSwrCore = () => {
    const keycloak = useKeycloak()
    const courseId = useAppSelector((state) => state.course.id)
    const authenticated = Boolean(keycloak.data?.authenticated)
    /** The SWR. */
    const swr = useSWR(
        courseId && authenticated
            ? [
                "QUERY_COURSE_ENROLLMENT_STATUS_SWR",
                courseId,
                authenticated,
            ]
            : null,
        async () => {
            if (!courseId) {
                throw new Error("Course id not found")
            }
            const token = keycloak.data?.authenticated
                ? keycloak.data?.token
                : undefined
            const data = await queryCourseEnrollmentStatus({
                variables: {
                    request: { courseId },
                },
                token,
            })
            if (!data || !data.data) {
                throw new Error("Course enrollment status not found")
            }
            return data.data
        }
    )
    /** Return the SWR. */
    return swr
}

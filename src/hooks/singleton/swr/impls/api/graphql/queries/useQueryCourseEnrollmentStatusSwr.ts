import { SwrContext } from "../../../../SwrContext"
import { use } from "react"

export const useQueryCourseEnrollmentStatusSwr = () => {
    const { queryCourseEnrollmentStatusSwr } = use(SwrContext)!
    return queryCourseEnrollmentStatusSwr
}

import { SwrContext } from "../../../../SwrContext"
import { use } from "react"

export const useQueryCoursesSwr = () => {
    const { queryCoursesSwr } = use(SwrContext)!
    return queryCoursesSwr
}

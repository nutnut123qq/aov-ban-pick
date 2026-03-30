import { SwrContext } from "../../../../SwrContext"
import { use } from "react"

export const useQueryCourseSwr = () => {
    const { queryCourseSwr } = use(SwrContext)!
    return queryCourseSwr
}

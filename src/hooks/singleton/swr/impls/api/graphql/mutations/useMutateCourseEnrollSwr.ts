import { SwrContext } from "../../../../SwrContext"
import { use } from "react"

export const useMutateCourseEnrollSwr = () => {
    const { mutateCourseEnrollSwr } = use(SwrContext)!
    return mutateCourseEnrollSwr
}

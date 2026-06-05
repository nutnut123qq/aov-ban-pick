import { SwrContext } from "../../../../SwrContext"
import { use } from "react"

export const useQueryMyEnrollmentsSwr = () => {
    const { queryMyEnrollmentsSwr } = use(SwrContext)!
    return queryMyEnrollmentsSwr
}

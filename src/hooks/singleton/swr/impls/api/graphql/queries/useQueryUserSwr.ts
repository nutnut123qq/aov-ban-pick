import { SwrContext } from "../../../../SwrContext"
import { use } from "react"

export const useQueryUserSwr = () => {
    const { queryUserSwr } = use(SwrContext)!
    return queryUserSwr
}

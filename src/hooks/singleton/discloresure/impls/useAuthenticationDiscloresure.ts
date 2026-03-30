import { DiscloresureContext } from "../DiscloresureContext"
import { use } from "react"

export const useAuthenticationDisclosure = () => {
    const { authentication } = use(DiscloresureContext)!
    return authentication
}

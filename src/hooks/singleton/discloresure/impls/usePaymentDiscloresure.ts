import { DiscloresureContext } from "../DiscloresureContext"
import { use } from "react"

export const usePaymentDisclosure = () => {
    const { payment } = use(DiscloresureContext)!
    return payment
}

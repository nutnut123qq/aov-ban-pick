
import { useContext } from "react"
import { FormikContext } from "../FormikContext"

/**
 * Hook to use the sign in formik
 */
export const useSignInFormik = () => {
    const { signInFormik } = useContext(FormikContext)!
    return signInFormik
}
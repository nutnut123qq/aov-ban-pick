
import { useContext } from "react"
import { FormikContext } from "../FormikContext"

/**
 * Hook to use the sign up formik
 */
export const useSignUpFormik = () => {
    const { signUpFormik } = useContext(FormikContext)!
    return signUpFormik
}
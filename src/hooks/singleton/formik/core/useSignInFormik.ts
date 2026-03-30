import { useFormik } from "formik"
import * as Yup from "yup"

/**
 * Formik values for the sign in form
 */
export interface SignInFormikValues {
    email: string
    password: string
    rememberMe: boolean
}

/**
 * Initial values for the sign in form
 */
const initialValues: SignInFormikValues = {
    email: "",
    password: "",
    rememberMe: false,
}

/**
 * Validation schema for the sign in form
 */
const validationSchema = Yup.object({
    email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
    password: Yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters"),
    rememberMe: Yup.boolean(),
})

/**
 * Hook to use the sign in formik
 */
export const useSignInFormikCore = () =>
    useFormik<SignInFormikValues>({
        initialValues,
        validationSchema,
        onSubmit: (values) => {
            window.alert(JSON.stringify(values, null, 2))
        },
    })

import { useFormik } from "formik"
import * as Yup from "yup"

/**
 * Formik values for the sign up form
 */
export interface SignUpFormikValues {
    email: string
    password: string
    confirmPassword: string
    agreeToTerms: boolean
}

/**
 * Initial values for the sign up form
 */
const initialValues: SignUpFormikValues = {
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
}

/**
 * Validation schema for the sign up form
 */
const validationSchema = Yup.object({
    email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
    password: Yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters"),
    confirmPassword: Yup.string()
        .required("Please confirm your password")
        .oneOf([Yup.ref("password")], "Passwords must match"),
    agreeToTerms: Yup.boolean().oneOf(
        [true],
        "You must accept the terms and privacy policy"
    ),
})

/**
 * Hook to use the sign up formik
 */
export const useSignUpFormikCore = () =>
    useFormik<SignUpFormikValues>({
        initialValues,
        validationSchema,
        onSubmit: (values) => {
            window.alert(JSON.stringify(values, null, 2))
        },
    })

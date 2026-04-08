import { useFormik } from "formik"
import * as Yup from "yup"

import { loginWithKeycloak } from "@/services/auth"
import { publicEnv } from "@/resources/env"

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
 * Accepts either username or email (not restricted to Gmail)
 */
const validationSchema = Yup.object({
    email: Yup.string().required("Username or email is required"),
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
        onSubmit: async (values, { setSubmitting, setFieldError }) => {
            try {
                const data = await loginWithKeycloak(values.email, values.password)
                console.log(data)
                localStorage.setItem(
                    publicEnv().keycloak.tokenKey ?? "access_token",
                    data.access_token,
                )
                if (data.refresh_token) {
                    localStorage.setItem(
                        publicEnv().keycloak.refreshTokenKey ?? "refresh_token",
                        data.refresh_token,
                    )
                }

                globalThis.location.href = "/"
            } catch (error: unknown) {
                console.error("[auth] Login failed:", error)
                setFieldError(
                    "email",
                    "Invalid username/email or password",
                )
            } finally {
                setSubmitting(false)
            }
        },
    })

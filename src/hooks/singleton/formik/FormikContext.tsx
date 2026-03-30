"use client"
import React, { PropsWithChildren, useMemo } from "react"
import { createContext } from "react"
import {
    useSignInFormikCore,
    useSignUpFormikCore,
} from "./core"

export interface FormikContextType {
    signInFormik: ReturnType<typeof useSignInFormikCore>
    signUpFormik: ReturnType<typeof useSignUpFormikCore>
}

export const FormikContext = createContext<FormikContextType | null>(null)

// Lazy formik provider - only initializes hooks after mount
export const FormikProvider = ({ children }: PropsWithChildren) => {
    const signInFormik = useSignInFormikCore()
    const signUpFormik = useSignUpFormikCore()
    const value = useMemo(
        () => (
            {
                signInFormik,
                signUpFormik,
            }), [
            signInFormik,
            signUpFormik,
        ]
    )

    return (
        <FormikContext.Provider value={value}>
            {children}
        </FormikContext.Provider>
    )
}
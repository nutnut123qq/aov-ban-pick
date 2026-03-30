"use client"

import React, { type PropsWithChildren } from "react"
import { DiscloresureProvider } from "./discloresure"
import { KeycloakProvider } from "./keycloak"
import { SwrProvider } from "./swr"
import { FormikProvider } from "./formik"

export const SingletonHookProvider = ({ children }: PropsWithChildren) => {
    return (
        <DiscloresureProvider>
            <KeycloakProvider>
                <SwrProvider>
                    <FormikProvider>
                        {children}
                    </FormikProvider>
                </SwrProvider>
            </KeycloakProvider>
        </DiscloresureProvider>
    )
}

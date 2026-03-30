"use client"
import React, { PropsWithChildren, useMemo } from "react"
import { createContext } from "react"
import {
    useAuthenticationDisclosureCore,
    usePaymentDisclosureCore,
} from "./core"

export interface DiscloresureContextType {
    authentication: ReturnType<typeof useAuthenticationDisclosureCore>
    payment: ReturnType<typeof usePaymentDisclosureCore>
}

export const DiscloresureContext = createContext<DiscloresureContextType | null>(null)

export const DiscloresureProvider = ({ children }: PropsWithChildren) => {
    const authentication = useAuthenticationDisclosureCore()
    const payment = usePaymentDisclosureCore()
    const value = useMemo(() => ({
        authentication,
        payment,
    }), [
        authentication,
        payment,
    ])
    return (
        <DiscloresureContext.Provider value={value}>
            {children}
        </DiscloresureContext.Provider>
    )
}
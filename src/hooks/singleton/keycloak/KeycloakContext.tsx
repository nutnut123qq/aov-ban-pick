"use client"
import React, { PropsWithChildren, useMemo } from "react"
import { createContext } from "react"
import { useKeycloakCore } from "./core"

export interface KeycloakContextType {
    keycloakSwr: ReturnType<typeof useKeycloakCore>
}

export const KeycloakContext = createContext<KeycloakContextType | null>(null)

export const KeycloakProvider = ({ children }: PropsWithChildren) => {
    const keycloakSwr = useKeycloakCore()
    const value = useMemo(
        () => ({ keycloakSwr }),
        [keycloakSwr]
    )
    return (
        <KeycloakContext.Provider value={value}>
            {children}
        </KeycloakContext.Provider>
    )
}

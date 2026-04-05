
import React from "react"
import { SWRConfig } from "swr"

export const SwrProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <SWRConfig value={{
            provider: () => new Map(),
        }}>
            {children}
        </SWRConfig>
    )
}

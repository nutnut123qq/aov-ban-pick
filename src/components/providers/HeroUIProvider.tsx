"use client"
import React, { PropsWithChildren } from "react"
import { HeroUIProvider as Provider } from "@heroui/react"

export const HeroUIProvider = ({ children }: PropsWithChildren) => {
    return <Provider>{children}</Provider>
}

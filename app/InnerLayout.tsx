"use client"

import { SingletonHookProvider, UseEffects } from "@/hooks"
import Navbar from "@/layouts/Navbar"
import { SwrProvider } from "@/providers/SwrProvider"
import { ReduxProvider } from "@/redux"
import { ThemeProvider } from "@/providers/theme-provider"
import { Toast } from "@heroui/react"
import React, { PropsWithChildren, Suspense } from "react"

export const InnerLayout = ({ children }: PropsWithChildren) => {
    return (
        <Suspense>
            <ReduxProvider>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem={true}
                    storageKey="tedo-academy-theme"
                >
                    <SwrProvider>
                        <SingletonHookProvider>
                            <UseEffects />
                            <Navbar />
                            {children}
                        </SingletonHookProvider>
                        <Toast.Provider />
                    </SwrProvider>
                </ThemeProvider>
            </ReduxProvider>
        </Suspense>
    )
}

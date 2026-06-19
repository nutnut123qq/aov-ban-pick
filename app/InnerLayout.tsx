"use client"
    import {
        HeroUIProvider,
        NextThemesProvider,
        SwrProvider,
    } from "@/components"
import { ToastProvider } from "@heroui/react"
import React, { PropsWithChildren, Suspense } from "react"
import { ReduxProvider } from "@/redux"
import { ConditionalNavbar } from "@/components/ConditionalNavbar"

export const InnerLayout = ({ children }: PropsWithChildren) => {
    return (
        <Suspense>
            <NextThemesProvider
                defaultTheme="dark"
                storageKey="aov-theme"
            >
                <HeroUIProvider>
                    <ReduxProvider>
                        <SwrProvider>
                            <ConditionalNavbar>
                                {children}
                            </ConditionalNavbar>
                            <ToastProvider />
                        </SwrProvider>
                    </ReduxProvider>
                </HeroUIProvider>
            </NextThemesProvider>
        </Suspense>
    )
}

"use client"
    import {
        HeroUIProvider,
        NextThemesProvider,
        SwrProvider,
    } from "@/components"
import { ToastProvider } from "@heroui/react"
import React, { PropsWithChildren, Suspense } from "react"
import { SingletonHookProvider } from "@/hooks/singleton"
import { ReduxProvider } from "@/redux"
import { UseEffects } from "@/hooks"
import { ModalContainer } from "@/components/modals"
import { Navbar } from "@/components/layouts"

export const InnerLayout = ({ children }: PropsWithChildren) => {
    return (
        <Suspense>
            <NextThemesProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem={true}
                storageKey="tedo-theme"
            >
                <HeroUIProvider>
                    <ReduxProvider>
                        <SwrProvider>
                            <SingletonHookProvider>
                                <UseEffects />
                                <Navbar />
                                <ModalContainer />
                                {children}
                            </SingletonHookProvider>
                            <ToastProvider />
                        </SwrProvider>
                    </ReduxProvider>
                </HeroUIProvider>
            </NextThemesProvider>
        </Suspense>
    )
}
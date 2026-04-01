import React from "react"
import type { Metadata } from "next"
import { ReduxProvider } from "@/redux/ReduxProvider"
import { SingletonHookProvider } from "@/hooks/singleton"
import { ThemeProvider } from "@/providers/theme-provider"
import Navbar from "@/layouts/Navbar"

export const metadata: Metadata = {
    title: "StarCI Academy",
    description: "StarCI Academy frontend powered by TEDO UI",
}

const RootLayout = (
    {
        children,
    }: Readonly<{
        children: React.ReactNode
    }>
) => {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <ReduxProvider>
                    <SingletonHookProvider>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="light"
                        >
                            <Navbar />
                            {children}
                        </ThemeProvider>
                    </SingletonHookProvider>
                </ReduxProvider>
            </body>
        </html>
    )
}

export default RootLayout


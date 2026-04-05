import type { Metadata } from "next"
import { Figtree } from "next/font/google"
import "./globals.css"
import React, { PropsWithChildren } from "react"
import { NextIntlClientProvider } from "next-intl"
import { InnerLayout } from "./InnerLayout"

const figtree = Figtree({
    subsets: ["latin"],
    variable: "--font-figtree",
})

export const metadata: Metadata = {
    title: "Tedo Academy",
    description: "Tedo Academy is a platform for learning and growing",
}

const Layout = ({ children }: PropsWithChildren) => {
    return (
        <html lang="vi" suppressHydrationWarning>
            <body className={`${figtree.className} antialiased`}>
                <NextIntlClientProvider>
                    <InnerLayout>
                        <div className="p-6 max-w-[1024px] mx-auto">
                            {children}
                        </div>
                    </InnerLayout>
                </NextIntlClientProvider>
            </body>
        </html>
    )
}

export default Layout

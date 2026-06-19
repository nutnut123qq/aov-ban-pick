import type { Metadata } from "next"
import { Figtree, Geist } from "next/font/google"
import "./globals.css"
import React, { PropsWithChildren } from "react"
import { NextIntlClientProvider } from "next-intl"
import { InnerLayout } from "./InnerLayout"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const figtree = Figtree({
    subsets: ["latin"],
    variable: "--font-figtree",
})

export const metadata: Metadata = {
    title: "AOV DraftMind",
    description: "Trợ lý cấm/chọn Liên Quân Mobile — thống kê và gợi ý draft theo thời gian thực",
}

const Layout = ({ children }: PropsWithChildren) => {
    return (
        <html lang="vi" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
            <body suppressHydrationWarning className={`${figtree.className} antialiased`}>
                <NextIntlClientProvider>
                    <InnerLayout>
                        {children}
                    </InnerLayout>
                </NextIntlClientProvider>
            </body>
        </html>
    )
}

export default Layout

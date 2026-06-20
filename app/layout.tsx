import type { Metadata } from "next"
import type { Viewport } from "next"
import { Figtree, Geist } from "next/font/google"
import "./globals.css"
import React, { PropsWithChildren } from "react"

import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const figtree = Figtree({
    subsets: ["latin"],
    variable: "--font-figtree",
})

export const metadata: Metadata = {
    title: "AOV DraftMind",
    description: "Trợ lý cấm/chọn Liên Quân Mobile — thống kê và gợi ý draft theo thờigian thực",
}

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
} satisfies Viewport

const RootLayout = ({ children }: PropsWithChildren) => {
    return (
        <html lang="vi" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
            <body suppressHydrationWarning className={`${figtree.className} antialiased`}>
                {children}
            </body>
        </html>
    )
}

export default RootLayout

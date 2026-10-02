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

const description =
    "Trợ lý cấm/chọn Liên Quân Mobile — thống kê meta giải đấu, mô phỏng draft và gợi ý theo dữ liệu trận thật"

export const metadata: Metadata = {
    metadataBase: new URL("https://aov-ban-pick.vercel.app"),
    title: {
        default: "AOV DraftMind",
        template: "%s | AOV DraftMind",
    },
    description,
    keywords: ["Liên Quân Mobile", "AOV", "Arena of Valor", "ban pick", "draft", "meta", "Liên Quân"],
    openGraph: {
        title: "AOV DraftMind",
        description,
        url: "https://aov-ban-pick.vercel.app",
        siteName: "AOV DraftMind",
        locale: "vi_VN",
        type: "website",
        images: [{ url: "/og.png", width: 1200, height: 630, alt: "AOV DraftMind — mô phỏng cấm chọn Liên Quân" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "AOV DraftMind",
        description,
        images: ["/og.png"],
    },
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

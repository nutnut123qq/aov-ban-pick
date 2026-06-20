import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import React, { PropsWithChildren } from "react"

import { routing } from "@/i18n/routing"
import type { Locale } from "@/i18n/routing"
import { InnerLayout } from "../InnerLayout"

interface LocaleLayoutProps extends PropsWithChildren {
    params: Promise<{ locale: string }>
}

const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
    const { locale } = await params

    if (!routing.locales.includes(locale as Locale)) {
        notFound()
    }

    setRequestLocale(locale)
    const messages = await getMessages()

    return (
        <NextIntlClientProvider messages={messages}>
            <InnerLayout>
                {children}
            </InnerLayout>
        </NextIntlClientProvider>
    )
}

export default LocaleLayout

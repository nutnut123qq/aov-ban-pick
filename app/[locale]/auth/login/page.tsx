"use client"

import React, { useEffect, useState } from "react"
import { useKeycloak } from "@/hooks/singleton"
import { useRouter } from "@/i18n/navigation"

import { TedoButton } from "@/components/atomic"
import { useTranslations } from "next-intl"

const AuthLoginPage = () => {
    const keycloak = useKeycloak()
    const router = useRouter()
    const [isRedirecting, setIsRedirecting] = useState(false)
    const t = useTranslations()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsRedirecting(true)
        try {
            await keycloak.login()
        } finally {
            setIsRedirecting(false)
        }
    }

    const sessionActive =
        keycloak.isAuthenticated && Boolean(keycloak.token)

    useEffect(() => {
        if (keycloak.isLoading || !sessionActive) {
            return
        }
        router.replace("/")
    }, [keycloak.isLoading, sessionActive, router])

    return (
        <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
            <section className="w-full max-w-md rounded-2xl border border-default-200 bg-content1/60 p-8 shadow-sm backdrop-blur">
                <header className="mb-6 text-center">
                    <h1 className="text-2xl font-semibold">
                        {t("auth.loginPage.title")}
                    </h1>
                    <p className="mt-1 text-sm text-default-500">
                        {t("auth.loginPage.desc")}
                    </p>
                </header>

                {sessionActive ? (
                    <p className="text-center text-sm text-default-500">
                        {t("nav.redirectingHome")}
                    </p>
                ) : (
                    <form
                        className="space-y-4"
                        onSubmit={handleSubmit}
                    >
                        <TedoButton
                            type="submit"
                            className="w-full justify-center"
                            isDisabled={isRedirecting}
                        >
                            {t("auth.loginPage.submit")}
                        </TedoButton>
                    </form>
                )}
            </section>
        </main>
    )
}

export default AuthLoginPage

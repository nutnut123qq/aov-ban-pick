"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useKeycloak } from "@/hooks/singleton"
import { TedoButton } from "@/components/ui/TedoButton"
import { useAppSelector } from "@/redux/hooks"

const AuthLoginPage = () => {
    const keycloak = useKeycloak()
    const user = useAppSelector((state) => state.user.user)
    const [isRedirecting, setIsRedirecting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsRedirecting(true)
        try {
            await keycloak.login()
        } finally {
            setIsRedirecting(false)
        }
    }

    const tokenParsed = keycloak.keycloak?.tokenParsed as
        | { preferred_username?: string; email?: string; sub?: string }
        | undefined
    const username =
        user?.username ??
        tokenParsed?.preferred_username ??
        user?.email ??
        tokenParsed?.email ??
        tokenParsed?.sub ??
        null

    const sessionActive =
        keycloak.isAuthenticated && Boolean(keycloak.token)

    return (
        <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
            <section className="w-full max-w-md rounded-2xl border border-default-200 bg-content1/60 p-8 shadow-sm backdrop-blur">
                <header className="mb-6 text-center">
                    <h1 className="text-2xl font-semibold">
                        Đăng nhập Tedo
                    </h1>
                    <p className="mt-1 text-sm text-default-500">
                        Sử dụng tài khoản Keycloak được cấp để tiếp tục.
                    </p>
                </header>

                {sessionActive ? (
                    <div className="flex flex-col gap-3">
                        <Link href="/" className="w-full">
                            <TedoButton
                                className="w-full justify-center"
                                variant="outline"
                            >
                                Hồ sơ: {username ?? "Đã đăng nhập"}
                            </TedoButton>
                        </Link>
                        <TedoButton
                            className="w-full justify-center"
                            variant="outline"
                            onClick={() => {
                                void keycloak.logout()
                            }}
                        >
                            Đăng xuất
                        </TedoButton>
                    </div>
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
                            Đăng nhập với Keycloak
                        </TedoButton>
                    </form>
                )}
            </section>
        </main>
    )
}

export default AuthLoginPage

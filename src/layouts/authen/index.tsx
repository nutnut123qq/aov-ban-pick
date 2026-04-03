"use client"

import React from "react"
import { useKeycloak } from "@/hooks/singleton"
import { TedoButton } from "@/components/ui/TedoButton"

const LoginPage = () => {
    const keycloak = useKeycloak()

    const handleSubmit = async (e: React.FormEvent) => {
        console.log("login")
        e.preventDefault()
        await keycloak.login()
    }

    return (
        <main className="min-h-screen flex items-center justify-center">
            <section className="w-full max-w-md rounded-2xl border border-default-200 bg-content1/60 p-8 shadow-sm backdrop-blur">
                <header className="mb-6 text-center">
                    <h1 className="text-2xl font-semibold">
                        Đăng nhập StarCI Academy
                    </h1>
                    <p className="mt-1 text-sm text-default-500">
                        Sử dụng tài khoản Keycloak được cấp để tiếp tục.
                    </p>
                </header>

                <form
                    className="space-y-4"
                    onSubmit={handleSubmit}
                >
                    <TedoButton
                        type="submit"
                        className="w-full justify-center"
                    >
                        Đăng nhập với Keycloak
                    </TedoButton>
                </form>
            </section>
        </main>
    )
}

export default LoginPage

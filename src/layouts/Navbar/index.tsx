"use client"

import React from "react"
import Link from "next/link"
import { useAppSelector } from "@/redux/hooks"
import { TedoButton } from "@/components/ui/TedoButton"
import { useKeycloakCore } from "@/hooks/singleton/keycloak/core"

const Navbar = () => {
    const user = useAppSelector((state) => state.user.user)
    const authenticated = useAppSelector((state) => state.user.authenticated)

    const { data: keycloak } = useKeycloakCore()

    return (
        <nav className="flex items-center justify-between px-6 py-3 border-b border-default-200 bg-content1/70 backdrop-blur">
            <Link
                href="/"
                className="text-base font-semibold"
            >
                Tedo
            </Link>

            <div className="flex items-center gap-3">
                {authenticated && user ? (
                    <>
                        <span className="text-sm text-default-600">
                            {user.email ?? "Đã đăng nhập"}
                        </span>
                        <TedoButton
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                window.location.href = "/api/auth/logout"
                            }}
                        >
                            Đăng xuất
                        </TedoButton>
                    </>
                ) : (
                    <Link href="/auth/login">
                        <TedoButton size="sm">
                            Đăng nhập
                        </TedoButton>
                    </Link>
                )}
            </div>
        </nav>
    )
}

export default Navbar

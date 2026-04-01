


"use client"

import React from "react"
import Link from "next/link"
import { useAppSelector } from "@/redux/hooks"
import { useKeycloak } from "@/hooks/singleton"
import { TedoButton } from "@/components/ui/TedoButton"

const Navbar = () => {
    const {
        user,
        authenticated,
    } = useAppSelector((state) => state.user)
    const keycloak = useKeycloak()

    const handleLogout = async () => {
        if (keycloak.data) {
            await keycloak.data.logout()
        }
    }

    return (
        <nav className="flex items-center justify-between px-6 py-3 border-b border-default-200 bg-content1/70 backdrop-blur">
            <Link
                href="/"
                className="text-base font-semibold"
            >
                StarCI Academy
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
                            onClick={handleLogout}
                        >
                            Đăng xuất
                        </TedoButton>
                    </>
                ) : (
                    <Link href="/login">
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
"use client"

import React from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"

import { useAuthenticationDisclosure, useKeycloak } from "@/hooks/singleton"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import {
    AuthenticationModalTab,
    setAuthenticationModalTab,
} from "@/redux/slices"
import { setUser, setAuthenticated } from "@/redux/slices/user"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import { LogOut, ChevronDown } from "lucide-react"

interface NavLinkProps {
    href: string
    children: React.ReactNode
    isActive?: boolean
}

const NavLink = ({ href, children, isActive }: NavLinkProps) => (
    <Link
        href={href}
        className={`relative text-sm font-medium transition-colors hover:text-foreground ${
            isActive
                ? "text-foreground"
                : "text-muted-foreground"
        }`}
    >
        {children}
        {isActive && (
            <span className="absolute -bottom-0.5 inset-x-0 h-px rounded-full bg-foreground" />
        )}
    </Link>
)

export const Navbar = () => {
    const dispatch = useAppDispatch()
    const { onOpen } = useAuthenticationDisclosure()
    const { logout } = useKeycloak()
    const { user, authenticated } = useAppSelector((state) => state.user)
    const t = useTranslations()

    const displayName =
        user?.username ??
        user?.email ??
        t("nav.signedInFallback")

    const initialsSource = user?.username || displayName
    const avatarLetter =
        typeof initialsSource === "string" && initialsSource.length > 0
            ? initialsSource.trim().charAt(0).toUpperCase()
            : "?"

    const sessionActive = authenticated && Boolean(user)

    const handleLogout = async () => {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        dispatch(setUser(null))
        dispatch(setAuthenticated(false))
        document.cookie = "keycloak_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        document.cookie = "keycloak_token_expiry=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        try {
            await logout()
        } catch (err) {
            console.error("[auth] Keycloak logout failed:", err)
        }
    }

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-6 px-4 sm:px-6">
                {/* Brand */}
                <Link
                    href="/"
                    className="text-base font-semibold tracking-tight text-foreground shrink-0"
                >
                    {t("nav.brand")}
                </Link>

                {/* Center Nav Links */}
                <nav className="hidden sm:flex items-center gap-5" aria-label="Main navigation">
                    <NavLink href="/" isActive>
                        {t("nav.home")}
                    </NavLink>
                    <NavLink href="/khoa-hoc">
                        {t("nav.courses")}
                    </NavLink>
                    <NavLink href="#">
                        {t("nav.contact")}
                    </NavLink>
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    {sessionActive ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="flex h-9 max-w-[min(260px,70vw)] items-center gap-2 rounded-lg px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    aria-label={t("nav.userMenu.label")}
                                >
                                    <Avatar size="sm">
                                        <AvatarFallback className="text-xs">
                                            {avatarLetter}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden min-w-0 truncate sm:block">
                                        {displayName}
                                    </span>
                                    <ChevronDown className="hidden size-3.5 shrink-0 text-muted-foreground sm:block" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                    variant="destructive"
                                    className="gap-2"
                                    onSelect={() => {
                                        void handleLogout()
                                    }}
                                >
                                    <LogOut className="size-4" />
                                    {t("nav.logout")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button
                            size="sm"
                            onClick={() => {
                                dispatch(
                                    setAuthenticationModalTab(
                                        AuthenticationModalTab.SignIn
                                    )
                                )
                                onOpen()
                            }}
                        >
                            {t("nav.signIn")}
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}

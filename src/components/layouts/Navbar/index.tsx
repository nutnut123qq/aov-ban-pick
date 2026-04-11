"use client"

import React from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useLocale } from "@/hooks"
import { useRouter } from "@/i18n/navigation"

import { useAuthenticationDisclosure, useKeycloak } from "@/hooks/singleton"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import {
    AuthenticationModalTab,
    setAuthenticationModalTab,
} from "@/redux/slices"
import { setUser, setAuthenticated } from "@/redux/slices/user"
import { clearTokens } from "@/services/auth"

import { Button, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react"
import { LogOut, ChevronDown, Sun, Moon, Globe } from "lucide-react"

interface NavLinkProps {
    href: string
    children: React.ReactNode
    isActive?: boolean
}

const NavLink = ({ href, children, isActive }: NavLinkProps) => (
    <Link
        href={href}
        className={`relative text-sm font-medium transition-colors hover:text-foreground ${isActive
            ? "text-foreground"
            : "text-foreground-500"
            }`}
    >
        {children}
        {isActive && (
            <span className="absolute -bottom-0.5 inset-x-0 h-px rounded-full bg-foreground" />
        )}
    </Link>
)

const languages = [
    { code: "vi" as const, label: "Tiếng Việt", flag: "🇻🇳" },
    { code: "en" as const, label: "English", flag: "🇺🇸" },
]

export const Navbar = () => {
    const dispatch = useAppDispatch()
    const { onOpen } = useAuthenticationDisclosure()
    const { logout } = useKeycloak()
    const { user, authenticated } = useAppSelector((state) => state.user)
    const t = useTranslations()
    const locale = useLocale()
    const router = useRouter()

    const [isDark, setIsDark] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
        const isDarkMode = document.documentElement.classList.contains("dark")
        setIsDark(isDarkMode)
    }, [])

    const toggleTheme = () => {
        const root = document.documentElement
        if (isDark) {
            root.classList.remove("dark")
            localStorage.theme = "light"
        } else {
            root.classList.add("dark")
            localStorage.theme = "dark"
        }
        setIsDark(!isDark)
    }

    const handleLocaleChange = (newLocale: "en" | "vi") => {
        const pathname = globalThis.location?.pathname ?? "/"
        router.replace({ pathname: newLocale })
    }

    const displayName =
        user?.username ??
        user?.email ??
        t("nav.signedInFallback")

    const sessionActive = authenticated && Boolean(user)

    const handleLogout = async () => {
        clearTokens()
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

    const currentLang = languages.find((l) => l.code === locale) ?? languages[0]

    return (
        <header className="sticky top-0 z-40 w-full border-b border-divider bg-content1/80 backdrop-blur-md supports-backdrop-filter:bg-content1/60">
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
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
                    {/* Language Switcher */}
                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <Button
                                variant="flat"
                                size="sm"
                                radius="lg"
                                className="gap-1.5 h-9 px-2.5 text-small font-medium bg-content2 hover:bg-content3 transition-colors border border-divider text-foreground-600"
                            >
                                <Globe className="size-4" />
                                <span className="hidden sm:inline">{currentLang.code.toUpperCase()}</span>
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="Language selection"
                            selectionMode="single"
                            selectedKeys={new Set([locale])}
                            onSelectionChange={(keys) => {
                                const selected = Array.from(keys)[0] as "en" | "vi"
                                if (selected) handleLocaleChange(selected)
                            }}
                            itemClasses={{
                                base: "gap-2",
                            }}
                        >
                            {languages.map((lang) => (
                                <DropdownItem
                                    key={lang.code}
                                    startContent={
                                        <span className="text-base">{lang.flag}</span>
                                    }
                                >
                                    {lang.label}
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>

                    {/* Theme Toggle */}
                    {mounted && (
                        <Button
                            variant="flat"
                            isIconOnly
                            size="sm"
                            radius="lg"
                            className="h-9 w-9 bg-content2 hover:bg-content3 transition-colors border border-divider"
                            onPress={toggleTheme}
                            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {isDark
                                ? <Sun className="size-4 text-foreground-600" />
                                : <Moon className="size-4 text-foreground-600" />
                            }
                        </Button>
                    )}

                    {sessionActive ? (
                        <Dropdown placement="bottom-end">
                            <DropdownTrigger>
                                <Button
                                    variant="flat"
                                    radius="lg"
                                    className="h-9 max-w-[min(200px,60vw)] gap-2 px-2 text-small font-medium bg-content2 hover:bg-content3 transition-colors border border-divider text-foreground"
                                >
                                    <Avatar
                                        size="sm"
                                        name={displayName}
                                        className="text-tiny"
                                    />
                                    <span className="hidden min-w-0 truncate sm:block">
                                        {displayName}
                                    </span>
                                    <ChevronDown className="size-3.5 shrink-0 text-foreground-500" />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                aria-label="User menu"
                                className="w-48"
                            >
                                <DropdownItem
                                    key="logout"
                                    className="text-danger"
                                    color="danger"
                                    startContent={<LogOut className="size-4" />}
                                    onPress={handleLogout}
                                >
                                    {t("nav.logout")}
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    ) : (
                        <Button
                            color="primary"
                            size="sm"
                            radius="lg"
                            onPress={() => {
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

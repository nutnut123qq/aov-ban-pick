"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    LogOut,
    Sun,
    Moon,
    Globe,
    BookOpen,
    User,
    Settings,
    GraduationCap,
    Menu,
    X,
    Award,
    CalendarDays,
    Library,
    LayoutDashboard,
    ClipboardList,
    UserCog,
    Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { NotificationBell } from "./NotificationBell"

const languages = [
    { code: "vi" as const, label: "Tiếng Việt", flag: "VN" },
    { code: "en" as const, label: "English", flag: "EN" },
]

interface NavLinkProps {
    href: string
    children: React.ReactNode
    onClick?: () => void
}

const NavLink = ({ href, children, onClick }: NavLinkProps) => {
    const pathname = usePathname()

    // Check if a path is active
    const isActiveLink = (path: string) => {
        if (path === "/") {
            return pathname === "/" || pathname === "/vi" || pathname === "/en"
        }
        return pathname?.includes(path)
    }

    const active = isActiveLink(href)

    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                "relative whitespace-nowrap text-sm font-medium transition-colors hover:text-foreground py-2 px-2.5 rounded-lg",
                active
                    ? "text-foreground bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
        >
            {children}
            {active && (
                <span className="absolute bottom-0 inset-x-3 h-0.5 rounded-full bg-primary" />
            )}
        </Link>
    )
}

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
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

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

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    const currentLang = languages.find((l) => l.code === locale) ?? languages[0]

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                {/* Brand */}
                <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground shrink-0"
                >
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground">
                        <GraduationCap className="size-5" />
                    </div>
                    <span className="hidden sm:block">{t("nav.brand")}</span>
                </Link>

                {/* Center Nav Links - Desktop */}
                <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
                    <NavLink href="/">
                        {t("nav.home")}
                    </NavLink>
                    <NavLink href="/courses">
                        {t("nav.courses")}
                    </NavLink>
                    <NavLink href="/programs">
                        Chương trình
                    </NavLink>
                    <NavLink href="/my-learning">
                        Khóa học của tôi
                    </NavLink>
                    {sessionActive && (
                        <NavLink href="/assigned">
                            Được giao
                        </NavLink>
                    )}
                    <NavLink href="/calendar">
                        Lịch
                    </NavLink>
                    <NavLink href="/library">
                        Thư viện
                    </NavLink>
                    <NavLink href="/communities">
                        Cộng đồng
                    </NavLink>
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Language Switcher */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 h-9 px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
                            >
                                <Globe className="size-4" />
                                <span className="hidden lg:inline">{currentLang.code.toUpperCase()}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            {languages.map((lang) => (
                                <DropdownMenuItem
                                    key={lang.code}
                                    onClick={() => handleLocaleChange(lang.code)}
                                    className={cn(
                                        "cursor-pointer",
                                        currentLang.code === lang.code && "bg-accent"
                                    )}
                                >
                                    <span className="mr-2 font-medium">{lang.flag}</span>
                                    {lang.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Theme Toggle */}
                    {mounted && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-foreground"
                            onClick={toggleTheme}
                            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {isDark ? (
                                <Sun className="size-4" />
                            ) : (
                                <Moon className="size-4" />
                            )}
                        </Button>
                    )}

                    {/* Notifications */}
                    {sessionActive && <NotificationBell />}

                    {sessionActive ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="gap-2 h-9 px-2 text-sm font-medium hover:bg-accent"
                                >
                                    <Avatar size="sm" className="size-7">
                                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                            {getInitials(displayName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden lg:block max-w-[120px] truncate">
                                        {displayName}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="px-2 py-1.5">
                                    <p className="text-sm font-medium">{displayName}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {user?.email}
                                    </p>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <Link href="/dashboard" className="flex items-center gap-2">
                                        <LayoutDashboard className="size-4" />
                                        Bảng điều khiển
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <Link href="/profile" className="flex items-center gap-2">
                                        <User className="size-4" />
                                        Hồ sơ
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <Link href="/my-learning" className="flex items-center gap-2">
                                        <BookOpen className="size-4" />
                                        Khóa học của tôi
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <Link href="/certificates" className="flex items-center gap-2">
                                        <Award className="size-4" />
                                        Chứng chỉ
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <Link href="/team" className="flex items-center gap-2">
                                        <UserCog className="size-4" />
                                        Nhóm của tôi
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <Link href="/settings" className="flex items-center gap-2">
                                        <Settings className="size-4" />
                                        Cài đặt
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="cursor-pointer text-destructive focus:text-destructive"
                                >
                                    <LogOut className="size-4 mr-2" />
                                    {t("nav.logout")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button
                            variant="default"
                            size="sm"
                            className="h-9 px-4 font-medium"
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

                    {/* Mobile Menu Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden h-9 w-9"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className="size-5" />
                        ) : (
                            <Menu className="size-5" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-border/50 bg-background">
                    <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
                        {sessionActive && (
                            <NavLink href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                <span className="inline-flex items-center gap-2">
                                    <LayoutDashboard className="size-4" />
                                    Bảng điều khiển
                                </span>
                            </NavLink>
                        )}
                        <NavLink href="/" onClick={() => setMobileMenuOpen(false)}>
                            {t("nav.home")}
                        </NavLink>
                        <NavLink href="/courses" onClick={() => setMobileMenuOpen(false)}>
                            {t("nav.courses")}
                        </NavLink>
                        <NavLink href="/programs" onClick={() => setMobileMenuOpen(false)}>
                            Chương trình
                        </NavLink>
                        <NavLink href="/my-learning" onClick={() => setMobileMenuOpen(false)}>
                            Khóa học của tôi
                        </NavLink>
                        {sessionActive && (
                            <NavLink href="/assigned" onClick={() => setMobileMenuOpen(false)}>
                                <span className="inline-flex items-center gap-2">
                                    <ClipboardList className="size-4" />
                                    Được giao
                                </span>
                            </NavLink>
                        )}
                        <NavLink href="/calendar" onClick={() => setMobileMenuOpen(false)}>
                            <span className="inline-flex items-center gap-2">
                                <CalendarDays className="size-4" />
                                Lịch sự kiện
                            </span>
                        </NavLink>
                        <NavLink href="/library" onClick={() => setMobileMenuOpen(false)}>
                            <span className="inline-flex items-center gap-2">
                                <Library className="size-4" />
                                Thư viện
                            </span>
                        </NavLink>
                        <NavLink href="/certificates" onClick={() => setMobileMenuOpen(false)}>
                            <span className="inline-flex items-center gap-2">
                                <Award className="size-4" />
                                Chứng chỉ
                            </span>
                        </NavLink>
                        <NavLink href="/communities" onClick={() => setMobileMenuOpen(false)}>
                            <span className="inline-flex items-center gap-2">
                                <Users className="size-4" />
                                Cộng đồng
                            </span>
                        </NavLink>
                    </nav>
                </div>
            )}
        </header>
    )
}

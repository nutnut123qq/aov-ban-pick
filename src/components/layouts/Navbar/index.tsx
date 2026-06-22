"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { useLocale } from "@/hooks"
import { useRouter } from "@/i18n/navigation"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
    Sun,
    Moon,
    Globe,
    GraduationCap,
    Menu,
    X,
    LayoutDashboard,
    Swords,
    BarChart3,
    FilePlus2,
    Trophy,
} from "lucide-react"
import { cn } from "@/lib/utils"

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

    // Check if a path is active. Strips the locale prefix (/vi, /en) then
    // matches by full segment so "/draft" does not also light up "/draft-input".
    const isActiveLink = (path: string) => {
        if (!pathname) return false
        const stripped = pathname.replace(/^\/(en|vi)(?=\/|$)/, "") || "/"
        if (path === "/") {
            return stripped === "/"
        }
        return stripped === path || stripped.startsWith(`${path}/`)
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
        router.replace({ pathname: newLocale })
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
                    <NavLink href="/dashboard">
                        {t("nav.dashboard")}
                    </NavLink>
                    <NavLink href="/draft">
                        {t("nav.draft")}
                    </NavLink>
                    <NavLink href="/meta">
                        {t("nav.meta")}
                    </NavLink>
                    <NavLink href="/matches">
                        {t("nav.matches")}
                    </NavLink>
                    <NavLink href="/draft-input">
                        {t("nav.draftInput")}
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
                                className="gap-2 h-11 px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
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
                            className="h-11 w-11 text-muted-foreground hover:text-foreground"
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

                    {/* Mobile Menu Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden h-11 w-11"
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
                        <NavLink href="/" onClick={() => setMobileMenuOpen(false)}>
                            {t("nav.home")}
                        </NavLink>
                        <NavLink href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                            <span className="inline-flex items-center gap-2">
                                <LayoutDashboard className="size-4" />
                                {t("nav.dashboard")}
                            </span>
                        </NavLink>
                        <NavLink href="/draft" onClick={() => setMobileMenuOpen(false)}>
                            <span className="inline-flex items-center gap-2">
                                <Swords className="size-4" />
                                {t("nav.draft")}
                            </span>
                        </NavLink>
                        <NavLink href="/meta" onClick={() => setMobileMenuOpen(false)}>
                            <span className="inline-flex items-center gap-2">
                                <BarChart3 className="size-4" />
                                {t("nav.meta")}
                            </span>
                        </NavLink>
                        <NavLink href="/matches" onClick={() => setMobileMenuOpen(false)}>
                            <span className="inline-flex items-center gap-2">
                                <Trophy className="size-4" />
                                {t("nav.matches")}
                            </span>
                        </NavLink>
                        <NavLink href="/draft-input" onClick={() => setMobileMenuOpen(false)}>
                            <span className="inline-flex items-center gap-2">
                                <FilePlus2 className="size-4" />
                                {t("nav.draftInput")}
                            </span>
                        </NavLink>
                    </nav>
                </div>
            )}
        </header>
    )
}

"use client"

import { useAuthenticationDisclosure, useKeycloak } from "@/hooks/singleton"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import {
    AuthenticationModalTab,
    setAuthenticationModalTab,
} from "@/redux/slices"
import {
    Navbar as HeroUINavbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    Link,
    Button,
    Avatar,
} from "@heroui/react"
import {
    TedoDropdown,
    TedoDropdownTrigger,
    TedoDropdownMenu,
    TedoDropdownItem,
} from "@/components/atomic"
import { ChevronDown } from "lucide-react"
import React from "react"
import { useTranslations } from "next-intl"
import { setUser, setAuthenticated } from "@/redux/slices/user"

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

    const initialsSource =
        user?.username ||
        displayName
    const avatarLetter =
        typeof initialsSource === "string" && initialsSource.length > 0
            ? initialsSource.trim().charAt(0).toUpperCase()
            : "?"

    const sessionActive = authenticated && Boolean(user)

    const handleLogout = async () => {
        // Clear localStorage tokens
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")

        // Clear Redux state
        dispatch(setUser(null))
        dispatch(setAuthenticated(false))

        // Clear cookies (for middleware)
        document.cookie = "keycloak_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        document.cookie = "keycloak_token_expiry=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

        // Try to logout from Keycloak (if connected)
        try {
            await logout()
        } catch (err) {
            console.error("[auth] Keycloak logout failed:", err)
        }
    }

    return (
        <HeroUINavbar shouldHideOnScroll>
            <NavbarBrand>
                <div className="font-bold text-inherit">{t("nav.brand")}</div>
            </NavbarBrand>
            <NavbarContent className="hidden sm:flex gap-4" justify="center">
                <NavbarItem>
                    <Link color="foreground" href="/">
                        {t("nav.home")}
                    </Link>
                </NavbarItem>
                <NavbarItem isActive>
                    <Link aria-current="page" href="/khoa-hoc">
                        {t("nav.courses")}
                    </Link>
                </NavbarItem>
                <NavbarItem>
                    <Link color="foreground" href="#">
                        {t("nav.contact")}
                    </Link>
                </NavbarItem>
            </NavbarContent>
            <NavbarContent justify="end" className="shrink-0">
                <NavbarItem className="shrink-0">
                    {sessionActive ? (
                        <TedoDropdown placement="bottom-end">
                            <TedoDropdownTrigger>
                                <Button
                                    variant="light"
                                    className="!inline-flex h-10 min-h-10 max-w-[min(260px,70vw)] shrink-0 !flex-row flex-nowrap items-center gap-2 px-2"
                                    startContent={
                                        <Avatar
                                            size="sm"
                                            name={displayName}
                                            className="h-8 w-8 shrink-0 text-tiny"
                                            getInitials={() => avatarLetter}
                                        />
                                    }
                                    endContent={
                                        <ChevronDown
                                            className="h-4 w-4 shrink-0 text-default-500"
                                            aria-hidden
                                        />
                                    }
                                >
                                    <span className="min-w-0 truncate text-left text-sm font-medium">
                                        {displayName}
                                    </span>
                                </Button>
                            </TedoDropdownTrigger>
                            <TedoDropdownMenu
                                aria-label={t("nav.userMenu.label")}
                            >
                                <TedoDropdownItem
                                    key="logout"
                                    className="text-danger"
                                    color="danger"
                                    onPress={() => {
                                        void handleLogout()
                                    }}
                                >
                                    {t("nav.logout")}
                                </TedoDropdownItem>
                            </TedoDropdownMenu>
                        </TedoDropdown>
                    ) : (
                        <Button
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
                </NavbarItem>
            </NavbarContent>
        </HeroUINavbar>
    )
}
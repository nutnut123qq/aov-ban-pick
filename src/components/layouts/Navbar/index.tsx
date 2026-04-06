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

type TokenParsedLike = {
    name?: string
    preferred_username?: string
    email?: string
    sub?: string
}

export const Navbar = () => {
    const dispatch = useAppDispatch()
    const { onOpen } = useAuthenticationDisclosure()
    const {
        keycloak,
        isLoading: keycloakLoading,
        isAuthenticated,
        token,
        logout,
    } = useKeycloak()
    const user = useAppSelector((state) => state.user.user)
    const t = useTranslations()

    const tokenParsed = keycloak?.tokenParsed as TokenParsedLike | undefined
    const displayName =
        (typeof tokenParsed?.name === "string" && tokenParsed.name.trim()
            ? tokenParsed.name.trim()
            : null) ??
        user?.username ??
        (typeof tokenParsed?.preferred_username === "string"
            ? tokenParsed.preferred_username
            : null) ??
        user?.email ??
        tokenParsed?.email ??
        t("nav.signedInFallback")

    const initialsSource =
        (typeof tokenParsed?.name === "string" && tokenParsed.name) ||
        user?.username ||
        tokenParsed?.preferred_username ||
        displayName
    const avatarLetter =
        typeof initialsSource === "string" && initialsSource.length > 0
            ? initialsSource.trim().charAt(0).toUpperCase()
            : "?"

    const sessionActive = isAuthenticated && Boolean(token)

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
                    {keycloakLoading ? (
                        <Button isDisabled variant="flat">
                            …
                        </Button>
                    ) : sessionActive ? (
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
                                        void logout()
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
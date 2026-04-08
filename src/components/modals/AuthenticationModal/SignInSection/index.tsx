"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
    TedoInput,
    TedoDivider,
    TedoButton,
    TedoCheckbox,
    TedoLink,
} from "../../../atomic"
import { Spacer } from "@heroui/react"
import { GoogleIcon } from "../../../svg"
import { useAppDispatch } from "@/redux"

import { useTranslations } from "next-intl"
import {
    AuthenticationModalTab,
    setAuthenticationModalTab,
} from "@/redux/slices"
import { useKeycloak, useAuthenticationDisclosure } from "@/hooks/singleton"
import { EyeClosedIcon, EyeIcon, LogIn } from "lucide-react"
import { AuthModalBody } from "../AuthModalBody"
import { loginWithKeycloak, type LoginResponse } from "@/services/auth"
import { setUser, setAuthenticated } from "@/redux/slices/user"
import type { UserEntity } from "@/modules/types"
import { jwtDecode } from "jwt-decode"

interface KeycloakTokenPayload {
    sub?: string
    email?: string
    preferred_username?: string
    given_name?: string
    family_name?: string
    name?: string
    exp?: number
}

const createUserFromToken = (payload: KeycloakTokenPayload): UserEntity => {
    const now = new Date()
    return {
        id: payload.sub ?? "",
        createdAt: now,
        updatedAt: now,
        username: payload.preferred_username ?? payload.email ?? payload.sub ?? "",
        email: payload.email ?? null,
        keycloakId: payload.sub ?? "",
        isDeleted: false,
    }
}

export const SignInSection = () => {
    const [showPassword, setShowPassword] = useState(false)
    const { isLoading: keycloakLoading, login: redirectToKeycloak } =
        useKeycloak()
    const dispatch = useAppDispatch()
    const router = useRouter()
    const t = useTranslations()
    const { onClose } = useAuthenticationDisclosure()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [rememberMe, setRememberMe] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        if (!email.trim()) {
            setError(t("auth.signIn.email.required"))
            setIsSubmitting(false)
            return
        }

        if (!password.trim()) {
            setError(t("auth.signIn.password.required"))
            setIsSubmitting(false)
            return
        }

        try {
            const data: LoginResponse = await loginWithKeycloak(email, password)

            localStorage.setItem("access_token", data.access_token)
            if (data.refresh_token) {
                localStorage.setItem("refresh_token", data.refresh_token)
            }

            const tokenParsed = jwtDecode<KeycloakTokenPayload>(data.access_token)
            if (tokenParsed) {
                const user = createUserFromToken(tokenParsed)
                console.log(user)
                dispatch(setUser(user))
                dispatch(setAuthenticated(true))
            }

            onClose()
            void router.push("/")
        } catch (err: unknown) {
            console.error("[auth] Login failed:", err)
            setError("Invalid username/email or password")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AuthModalBody>
            <TedoButton
                type="button"
                variant="bordered"
                className="h-10 min-h-10 w-full !flex flex-row flex-nowrap items-center justify-center gap-2 text-sm"
                isDisabled={keycloakLoading}
                startContent={
                    <span
                        aria-hidden
                        className="flex size-5 shrink-0 items-center justify-center"
                    >
                        <GoogleIcon className="size-5 shrink-0 block" />
                    </span>
                }
                onPress={() => {
                    void redirectToKeycloak({ idpHint: "google" }).catch(
                        (err: unknown) => {
                            console.error(
                                "[auth] Google sign-in redirect failed",
                                err,
                            )
                        },
                    )
                }}
            >
                {t("auth.signIn.google")}
            </TedoButton>
            <Spacer y={2} />
            <TedoButton
                type="button"
                variant="bordered"
                className="h-10 min-h-10 w-full !flex flex-row flex-nowrap items-center justify-center gap-2 text-sm"
                isDisabled={keycloakLoading}
                startContent={
                    <span
                        aria-hidden
                        className="flex size-5 shrink-0 items-center justify-center"
                    >
                        <LogIn className="size-5 shrink-0 stroke-[2]" />
                    </span>
                }
                onPress={() => {
                    void redirectToKeycloak().catch((err: unknown) => {
                        console.error(
                            "[auth] Keycloak sign-in redirect failed",
                            err,
                        )
                    })
                }}
            >
                {t("auth.signIn.keycloak")}
            </TedoButton>
            <Spacer y={3} />
            <TedoDivider />
            <Spacer y={3} />
            <form onSubmit={handleSubmit} className="flex flex-col gap-0">
                <TedoInput
                    isRequired
                    labelPlacement="outside-top"
                    variant="bordered"
                    type="text"
                    label={t("auth.signIn.email.label")}
                    placeholder={t("auth.signIn.email.placeholder")}
                    value={email}
                    onValueChange={setEmail}
                />
                <Spacer y={3} />
                <TedoInput
                    isRequired
                    labelPlacement="outside-top"
                    variant="bordered"
                    type={showPassword ? "text" : "password"}
                    label={t("auth.signIn.password.label")}
                    placeholder={t("auth.signIn.password.placeholder")}
                    value={password}
                    onValueChange={setPassword}
                    endContent={
                        <TedoLink
                            as="button"
                            type="button"
                            className="mr-1 flex items-center justify-center rounded-md p-1 text-foreground-500 outline-none transition-opacity hover:opacity-80"
                            aria-label={
                                showPassword ? t("auth.signIn.password.hide") : t("auth.signIn.password.show")
                            }
                            onPress={() => setShowPassword((s) => !s)}
                        >
                            {showPassword ? (
                                <EyeIcon className="h-4 w-4" />
                            ) : (
                                <EyeClosedIcon className="h-4 w-4" />
                            )}
                        </TedoLink>
                    }
                />
                <Spacer y={3} />
                {error && (
                    <>
                        <div className="text-sm text-danger mb-2">{error}</div>
                        <Spacer y={1} />
                    </>
                )}
                <div className="flex justify-between">
                    <div className="flex items-center gap-1.5">
                        <TedoCheckbox
                            size="sm"
                            aria-label={t("auth.signIn.rememberMe")}
                            isSelected={rememberMe}
                            onValueChange={setRememberMe}
                        />
                        <div className="text-xs text-foreground-500">
                            {t("auth.signIn.rememberMe")}
                        </div>
                    </div>
                    <TedoLink className="text-xs">{t("auth.signIn.forgotPassword")}</TedoLink>
                </div>
                <Spacer y={3} />
                <TedoButton
                    type="submit"
                    color="primary"
                    fullWidth
                    isLoading={isSubmitting}
                >
                    {t("auth.signIn.submit")}
                </TedoButton>
            </form>
            <Spacer y={3} />
            <div className="flex justify-center items-center gap-1">
                <div className="text-xs text-foreground-500">
                    {t("auth.signIn.noAccount")}
                </div>
                <TedoLink
                    className="text-xs"
                    onPress={() =>
                        dispatch(
                            setAuthenticationModalTab(
                                AuthenticationModalTab.SignUp
                            )
                        )
                    }
                >
                    {t("auth.signIn.signUp")}
                </TedoLink>
            </div>
        </AuthModalBody>
    )
}

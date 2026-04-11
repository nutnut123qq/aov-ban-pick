"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { GoogleIcon } from "../../../svg"
import { useAppDispatch } from "@/redux"
import { useTranslations } from "next-intl"
import {
    AuthenticationModalTab,
    setAuthenticationModalTab,
} from "@/redux/slices"
import { useKeycloak, useAuthenticationDisclosure } from "@/hooks/singleton"
import { EyeIcon, EyeClosedIcon } from "@phosphor-icons/react"
import { LogIn, ArrowRight } from "lucide-react"
import { AuthModalBody } from "../AuthModalBody"
import { loginWithKeycloak, saveTokens, type LoginResponse } from "@/services/auth"
import { setUser, setAuthenticated } from "@/redux/slices/user"
import type { UserEntity } from "@/modules/types"
import { jwtDecode } from "jwt-decode"

import { Button, Input } from "@heroui/react"

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
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.SyntheticEvent) => {
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

            saveTokens(data)

            const tokenParsed = jwtDecode<KeycloakTokenPayload>(data.access_token)
            if (tokenParsed) {
                const user = createUserFromToken(tokenParsed)
                console.log(user)
                dispatch(setUser(user))
                dispatch(setAuthenticated(true))
            }

            onClose()
            router.push("/")
        } catch (err: unknown) {
            console.error("[auth] Login failed:", err)
            setError("Invalid username/email or password")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AuthModalBody className="p-0!">
            <div className="px-6 pb-6 pt-2">
                <div className="bg-content1 rounded-2xl border border-divider shadow-medium p-6 space-y-6">
                    {/* Social login */}
                    <div className="space-y-3">
                        <Button
                            type="button"
                            variant="flat"
                            className="w-full h-11 text-small font-medium bg-content2 hover:bg-content3 transition-colors border border-divider rounded-xl"
                            onPress={async () => {
                                await redirectToKeycloak({ idpHint: "google" }).catch(
                                    (err: unknown) => {
                                        console.error("[auth] Google sign-in redirect failed", err)
                                    },
                                )
                            }}
                            isLoading={keycloakLoading}
                        >
                            <GoogleIcon className="size-5 shrink-0" />
                            {t("auth.signIn.google")}
                        </Button>

                        <Button
                            type="button"
                            variant="flat"
                            className="w-full h-11 text-small font-medium bg-content2 hover:bg-content3 transition-colors border border-divider rounded-xl"
                            onPress={async () => {
                                await redirectToKeycloak().catch((err: unknown) => {
                                    console.error("[auth] Keycloak sign-in redirect failed", err)
                                })
                            }}
                            isLoading={keycloakLoading}
                        >
                            <LogIn className="size-5 shrink-0" />
                            {t("auth.signIn.keycloak")}
                        </Button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-divider" />
                        <span className="text-tiny text-foreground-400 font-medium uppercase tracking-widest">
                            or
                        </span>
                        <div className="h-px flex-1 bg-divider" />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            id="signin-email"
                            type="text"
                            // label={t("auth.signIn.email.label")}
                            placeholder={t("auth.signIn.email.placeholder")}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            classNames={{
                                base: "max-w-full",
                                label: "text-small font-medium text-foreground",
                                input: "text-small",
                                inputWrapper: "h-12 min-h-12 rounded-xl shadow-sm",
                            }}
                        />

                        <Input
                            id="signin-password"
                            type={showPassword ? "text" : "password"}
                            // label={t("auth.signIn.password.label")}
                            placeholder={t("auth.signIn.password.placeholder")}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            endContent={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-foreground-400 hover:text-foreground transition-colors cursor-pointer"
                                    aria-label={showPassword ? t("auth.signIn.password.hide") : t("auth.signIn.password.show")}
                                >
                                    {showPassword
                                        ? <EyeClosedIcon className="w-4 h-4" />
                                        : <EyeIcon className="w-4 h-4" />
                                    }
                                </button>
                            }
                            classNames={{
                                base: "max-w-full",
                                label: "text-small font-medium text-foreground",
                                input: "text-small",
                                inputWrapper: "h-12 min-h-12 pr-1 rounded-xl shadow-sm",
                            }}
                        />

                        {/* Error */}
                        {error && (
                            <div className="p-3 rounded-xl bg-danger-50 border border-danger-100">
                                <p className="text-tiny text-danger">{error}</p>
                            </div>
                        )}

                        {/* Forgot password link */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="text-tiny text-primary font-medium underline-offset-4 hover:underline"
                            >
                                {t("auth.signIn.forgotPassword")}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            color="primary"
                            className="w-full h-12 font-medium shadow-md hover:shadow-lg transition-shadow rounded-xl"
                            isLoading={isSubmitting}
                        >
                            {!isSubmitting && (
                                <>
                                    {t("auth.signIn.submit")}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="flex items-center justify-center gap-x-1.5 pt-2 text-tiny border-t border-divider">
                        <span className="text-foreground-400">{t("auth.signIn.noAccount")}</span>
                        <button
                            type="button"
                            className="font-semibold text-primary underline-offset-4 hover:underline"
                            onClick={() => dispatch(setAuthenticationModalTab(AuthenticationModalTab.SignUp))}
                        >
                            {t("auth.signIn.signUp")}
                        </button>
                    </div>
                </div>
            </div>
        </AuthModalBody>
    )
}

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
import { EyeClosedIcon, EyeIcon, LogIn, ArrowRight } from "lucide-react"
import { AuthModalBody } from "../AuthModalBody"
import { loginWithKeycloak, type LoginResponse } from "@/services/auth"
import { setUser, setAuthenticated } from "@/redux/slices/user"
import type { UserEntity } from "@/modules/types"
import { jwtDecode } from "jwt-decode"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

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
            <div className="space-y-6 px-6 pb-6 pt-5">
                <div className="space-y-2.5">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-11 w-full gap-2 border-border/80 bg-background font-normal"
                        onClick={async () => {
                            await redirectToKeycloak({ idpHint: "google" }).catch(
                                (err: unknown) => {
                                    console.error("[auth] Google sign-in redirect failed", err)
                                },
                            )
                        }}
                        disabled={keycloakLoading}
                    >
                        <GoogleIcon className="size-5 shrink-0" />
                        {t("auth.signIn.google")}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        className="h-11 w-full gap-2 border-border/80 bg-background font-normal"
                        onClick={async () => {
                            await redirectToKeycloak().catch((err: unknown) => {
                                console.error("[auth] Keycloak sign-in redirect failed", err)
                            })
                        }}
                        disabled={keycloakLoading}
                    >
                        <LogIn className="size-5 shrink-0" />
                        {t("auth.signIn.keycloak")}
                    </Button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        or
                    </span>
                    <div className="h-px flex-1 bg-border" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="signin-email" className="text-sm font-medium">
                                {t("auth.signIn.email.label")}
                            </Label>
                            <Input
                                id="signin-email"
                                type="text"
                                placeholder={t("auth.signIn.email.placeholder")}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-11 bg-background"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="signin-password" className="text-sm font-medium">
                                {t("auth.signIn.password.label")}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="signin-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t("auth.signIn.password.placeholder")}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-11 bg-background pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={showPassword ? t("auth.signIn.password.hide") : t("auth.signIn.password.show")}
                                >
                                    {showPassword ? <EyeClosedIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        {/* Remember & Forgot */}
                        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                            <div className="flex min-w-0 items-center gap-2">
                                <Checkbox
                                    id="signin-remember"
                                    checked={rememberMe}
                                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                                />
                                <Label htmlFor="signin-remember" className="cursor-pointer text-sm text-muted-foreground">
                                    {t("auth.signIn.rememberMe")}
                                </Label>
                            </div>
                            <button
                                type="button"
                                className="shrink-0 text-sm text-primary underline-offset-4 hover:underline"
                            >
                                {t("auth.signIn.forgotPassword")}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            className="h-11 w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {t("auth.signIn.submit")}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                </form>

                <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 border-t border-border/60 pt-5 text-center text-sm">
                    <span className="text-muted-foreground">{t("auth.signIn.noAccount")}</span>
                    <button
                        type="button"
                        className="font-medium text-primary underline-offset-4 hover:underline"
                        onClick={() => dispatch(setAuthenticationModalTab(AuthenticationModalTab.SignUp))}
                    >
                        {t("auth.signIn.signUp")}
                    </button>
                </div>
            </div>
        </AuthModalBody>
    )
}
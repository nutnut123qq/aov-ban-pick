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
import { publicEnv } from "@/resources/env"
import { Eye, EyeOff } from "lucide-react"
import { LogIn, ArrowRight, Mail, Lock } from "lucide-react"
import { AuthModalBody } from "../AuthModalBody"
import { loginWithKeycloak, saveTokens, type LoginResponse } from "@/services/auth"
import { setUser, setAuthenticated } from "@/redux/slices/user"
import type { UserEntity } from "@/modules/types"
import { jwtDecode } from "jwt-decode"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

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
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
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
                <div className="bg-card rounded-2xl border border-border shadow-lg p-6 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-1">
                        <h2 className="text-xl font-semibold tracking-tight">
                            Welcome back
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Sign in to continue learning
                        </p>
                    </div>

                    {/* Social login */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 text-sm font-medium"
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
                            Google
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 text-sm font-medium"
                            onClick={async () => {
                                await redirectToKeycloak().catch((err: unknown) => {
                                    console.error("[auth] Keycloak sign-in redirect failed", err)
                                })
                            }}
                            disabled={keycloakLoading}
                        >
                            <LogIn className="size-5 shrink-0" />
                            Keycloak
                        </Button>
                    </div>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-3 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="signin-email" className="text-sm font-medium">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                <Input
                                    id="signin-email"
                                    type="text"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-11 pl-10 rounded-lg"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="signin-password" className="text-sm font-medium">
                                    Password
                                </Label>
                                <Button
                                    type="button"
                                    variant="link"
                                    className="h-auto p-0 text-xs text-primary hover:underline"
                                    onClick={() => {
                                        const { url, realm, clientId } = publicEnv().keycloak
                                        const redirect = encodeURIComponent(
                                            typeof window !== "undefined" ? window.location.origin : "",
                                        )
                                        window.open(
                                            `${url}/realms/${realm}/login-actions/reset-credentials?client_id=${clientId}&redirect_uri=${redirect}`,
                                            "_blank",
                                            "noopener",
                                        )
                                    }}
                                >
                                    Quên mật khẩu?
                                </Button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                <Input
                                    id="signin-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-11 pl-10 pr-10 rounded-lg"
                                    disabled={isSubmitting}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="size-4" />
                                    ) : (
                                        <Eye className="size-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 font-medium shadow-md hover:shadow-lg transition-shadow"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="animate-pulse">Signing in...</span>
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="size-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="flex items-center justify-center gap-x-1.5 pt-2 text-sm border-t border-border">
                        <span className="text-muted-foreground">Don't have an account?</span>
                        <Button
                            type="button"
                            variant="link"
                            className="h-auto p-0 text-sm font-semibold text-primary hover:underline"
                            onClick={() => dispatch(setAuthenticationModalTab(AuthenticationModalTab.SignUp))}
                        >
                            Sign up
                        </Button>
                    </div>
                </div>
            </div>
        </AuthModalBody>
    )
}

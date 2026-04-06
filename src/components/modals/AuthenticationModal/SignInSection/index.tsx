"use client"
import React, { useState } from "react"
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
import { useSignInFormik } from "@/hooks/singleton"
import { useKeycloak } from "@/hooks/singleton"
import { EyeClosedIcon, EyeIcon, LogIn } from "lucide-react"
import { AuthModalBody } from "../AuthModalBody"

export const SignInSection = () => {
    const [showPassword, setShowPassword] = useState(false)
    const { isLoading: keycloakLoading, login: redirectToKeycloak } =
        useKeycloak()
    const dispatch = useAppDispatch()
    const t = useTranslations()
    const {
        values,
        errors,
        touched,
        setFieldValue,
        setFieldTouched,
        isSubmitting,
    } = useSignInFormik()

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
            <TedoInput
                isRequired
                labelPlacement="outside-top"
                variant="bordered"
                type="email"
                label={t("auth.signIn.email.label")}
                placeholder={t("auth.signIn.email.placeholder")}
                name="email"
                value={values.email}
                onValueChange={(email) => setFieldValue("email", email)}
                onBlur={() => setFieldTouched("email", true)}
                isInvalid={!!(touched.email && errors.email)}
                errorMessage={touched.email ? errors.email : undefined}
            />
            <Spacer y={3} />
            <TedoInput
                isRequired
                labelPlacement="outside-top"
                variant="bordered"
                type={showPassword ? "text" : "password"}
                label={t("auth.signIn.password.label")}
                placeholder={t("auth.signIn.password.placeholder")}
                name="password"
                value={values.password}
                onValueChange={(password) => setFieldValue("password", password)}
                onBlur={() => setFieldTouched("password", true)}
                isInvalid={!!(touched.password && errors.password)}
                errorMessage={touched.password ? errors.password : undefined}
                endContent={
                    <TedoLink
                        as="button"
                        className="mr-1 flex items-center justify-center rounded-md p-1 text-foreground-500 outline-none transition-opacity hover:opacity-80"
                        aria-label={
                            showPassword ? t("auth.signIn.password.hide") : t("auth.signIn.password.show")
                        }
                        onClick={() => setShowPassword((s) => !s)}
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
            <div className="flex justify-between">
                <div className="flex items-center gap-1.5">
                    <TedoCheckbox
                        size="sm"
                        aria-label={t("auth.signIn.rememberMe")}
                        isSelected={values.rememberMe}
                        onValueChange={(rememberMe) => setFieldValue("rememberMe", rememberMe)}
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

"use client"
import React, { useState } from "react"
import {
    TedoModalBody,
    TedoInput,
    TedoButton,
    TedoLink,
    TedoCheckbox,
} from "../../../atomic"
import { Spacer } from "@heroui/react"
import { useAppDispatch } from "@/redux"
import {
    AuthenticationModalTab,
    setAuthenticationModalTab,
} from "@/redux/slices"
import { EyeIcon, EyeClosedIcon } from "@phosphor-icons/react"
import { useSignUpFormik } from "@/hooks/singleton"
import { useTranslations } from "next-intl"

export const SignUpSection = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const dispatch = useAppDispatch()
    const t = useTranslations()
    const {
        values,
        errors,
        touched,
        setFieldValue,
        setFieldTouched,
        isSubmitting,
    } = useSignUpFormik()

    return (
        <TedoModalBody>
            <TedoInput
                isRequired
                type="email"
                label={t("auth.signUp.email.label")}
                placeholder={t("auth.signUp.email.placeholder")}
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
                label={t("auth.signUp.password.label")}
                placeholder={t("auth.signUp.password.placeholder")}
                type={showPassword ? "text" : "password"}
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
                            showPassword ? t("auth.signUp.password.hide") : t("auth.signUp.password.show")
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
            <TedoInput
                isRequired
                type={showConfirmPassword ? "text" : "password"}
                label={t("auth.signUp.confirmPassword.label")}
                placeholder={t("auth.signUp.confirmPassword.placeholder")}
                name="confirmPassword"
                value={values.confirmPassword}
                onValueChange={(v) => setFieldValue("confirmPassword", v)}
                onBlur={() => setFieldTouched("confirmPassword", true)}
                isInvalid={
                    !!(touched.confirmPassword && errors.confirmPassword)
                }
                errorMessage={
                    touched.confirmPassword
                        ? errors.confirmPassword
                        : undefined
                }
                endContent={
                    <button
                        type="button"
                        className="mr-1 flex items-center justify-center rounded-md p-1 text-foreground-500 outline-none transition-opacity hover:opacity-80"
                        aria-label={
                            showConfirmPassword
                                ? t("auth.signUp.confirmPassword.hide")
                                : t("auth.signUp.confirmPassword.show")
                        }
                        onClick={() => setShowConfirmPassword((s) => !s)}
                    >
                        {showConfirmPassword ? (
                            <EyeIcon className="h-4 w-4" />
                        ) : (
                            <EyeClosedIcon className="h-4 w-4" />
                        )}
                    </button>
                }
            />
            <Spacer y={3} />
            <div className="flex flex-col gap-1">
                <div className="flex items-start gap-1.5">
                    <TedoCheckbox
                        size="sm"
                        className="mt-0.5"
                        aria-label={t("auth.signUp.agreeToTerms.aria")}
                        isSelected={values.agreeToTerms}
                        isInvalid={
                            !!(touched.agreeToTerms && errors.agreeToTerms)
                        }
                        onValueChange={(v) => {
                            setFieldValue("agreeToTerms", v)
                            setFieldTouched("agreeToTerms", true)
                        }}
                    />
                    <div className="text-xs text-foreground-500">
                        {t("auth.signUp.agreeToTerms.prefix")}{" "}
                        <TedoLink className="text-xs">
                            {t("auth.signUp.agreeToTerms.terms")}
                        </TedoLink>{" "}
                        {t("auth.signUp.agreeToTerms.and")}{" "}
                        <TedoLink className="text-xs">
                            {t("auth.signUp.agreeToTerms.privacy")}
                        </TedoLink>
                    </div>
                </div>
                {touched.agreeToTerms && errors.agreeToTerms ? (
                    <p className="pl-6 text-xs text-danger">
                        {errors.agreeToTerms}
                    </p>
                ) : null}
            </div>
            <Spacer y={3} />
            <TedoButton
                type="submit"
                color="primary"
                fullWidth
                isLoading={isSubmitting}
            >
                {t("auth.signUp.submit")}
            </TedoButton>
            <Spacer y={3} />
            <div className="flex justify-center items-center gap-1">
                <div className="text-xs text-foreground-500">
                    {t("auth.signUp.haveAccount")}
                </div>
                <TedoLink
                    className="text-xs"
                    onPress={() =>
                        dispatch(
                            setAuthenticationModalTab(
                                AuthenticationModalTab.SignIn
                            )
                        )
                    }
                >
                    {t("auth.signUp.signIn")}
                </TedoLink>
            </div>
        </TedoModalBody>
    )
}
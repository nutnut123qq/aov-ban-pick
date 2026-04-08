"use client"
import React, { useState } from "react"
import { useAppDispatch } from "@/redux"
import {
    AuthenticationModalTab,
    setAuthenticationModalTab,
} from "@/redux/slices"
import { EyeIcon, EyeClosedIcon } from "@phosphor-icons/react"
import { useSignUpFormik } from "@/hooks/singleton"
import { useTranslations } from "next-intl"
import { AuthModalBody } from "../AuthModalBody"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight } from "lucide-react"

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
        <AuthModalBody className="p-0!">
            <div className="space-y-4 px-6 pb-6 pt-5">
                <form className="space-y-4">
                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="signup-email" className="text-sm font-medium">
                                {t("auth.signUp.email.label")}
                            </Label>
                            <Input
                                id="signup-email"
                                type="email"
                                placeholder={t("auth.signUp.email.placeholder")}
                                value={values.email}
                                onChange={(e) => setFieldValue("email", e.target.value)}
                                onBlur={() => setFieldTouched("email", true)}
                                className={cn(
                                    "h-11 bg-background",
                                    touched.email && errors.email && "border-destructive"
                                )}
                            />
                            {touched.email && errors.email && (
                                <p className="text-xs text-destructive">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="signup-password" className="text-sm font-medium">
                                {t("auth.signUp.password.label")}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="signup-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t("auth.signUp.password.placeholder")}
                                    value={values.password}
                                    onChange={(e) => setFieldValue("password", e.target.value)}
                                    onBlur={() => setFieldTouched("password", true)}
                                    className={cn(
                                        "h-11 bg-background pr-10",
                                        touched.password && errors.password && "border-destructive"
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={showPassword ? t("auth.signUp.password.hide") : t("auth.signUp.password.show")}
                                >
                                    {showPassword ? <EyeClosedIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                </button>
                            </div>
                            {touched.password && errors.password && (
                                <p className="text-xs text-destructive">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="signup-confirm" className="text-sm font-medium">
                                {t("auth.signUp.confirmPassword.label")}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="signup-confirm"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder={t("auth.signUp.confirmPassword.placeholder")}
                                    value={values.confirmPassword}
                                    onChange={(e) => setFieldValue("confirmPassword", e.target.value)}
                                    onBlur={() => setFieldTouched("confirmPassword", true)}
                                    className={cn(
                                        "h-11 bg-background pr-10",
                                        touched.confirmPassword && errors.confirmPassword && "border-destructive"
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={showConfirmPassword ? t("auth.signUp.confirmPassword.hide") : t("auth.signUp.confirmPassword.show")}
                                >
                                    {showConfirmPassword ? <EyeClosedIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                </button>
                            </div>
                            {touched.confirmPassword && errors.confirmPassword && (
                                <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Terms */}
                        <div className="space-y-1">
                            <div className="flex items-start gap-2">
                                <Checkbox
                                    id="signup-terms"
                                    checked={values.agreeToTerms}
                                    onCheckedChange={(checked) => {
                                        setFieldValue("agreeToTerms", checked === true)
                                        setFieldTouched("agreeToTerms", true)
                                    }}
                                    className="mt-0.5"
                                />
                                <Label htmlFor="signup-terms" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                                    {t("auth.signUp.agreeToTerms.prefix")}{" "}
                                    <button type="button" className="text-primary hover:underline">
                                        {t("auth.signUp.agreeToTerms.terms")}
                                    </button>{" "}
                                    {t("auth.signUp.agreeToTerms.and")}{" "}
                                    <button type="button" className="text-primary hover:underline">
                                        {t("auth.signUp.agreeToTerms.privacy")}
                                    </button>
                                </Label>
                            </div>
                            {touched.agreeToTerms && errors.agreeToTerms && (
                                <p className="text-xs text-destructive pl-6">{errors.agreeToTerms}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            className="h-11 w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {t("auth.signUp.submit")}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                </form>

                <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 border-t border-border/60 pt-5 text-center text-sm">
                    <span className="text-muted-foreground">{t("auth.signUp.haveAccount")}</span>
                    <button
                        type="button"
                        className="font-medium text-primary underline-offset-4 hover:underline"
                        onClick={() => dispatch(setAuthenticationModalTab(AuthenticationModalTab.SignIn))}
                    >
                        {t("auth.signUp.signIn")}
                    </button>
                </div>
            </div>
        </AuthModalBody>
    )
}
"use client"

import React, { useEffect, useRef } from "react"
import { Button, cn } from "@heroui/react"
import { X } from "lucide-react"
import { useAuthenticationDisclosure } from "@/hooks/singleton"
import { useAppSelector } from "@/redux"
import { AuthenticationModalTab } from "@/redux/slices"
import { SignInSection } from "./SignInSection"
import { SignUpSection } from "./SignUpSection"
import { useTranslations } from "next-intl"
import { AuthModalStaticHeader } from "./AuthModalStaticHeader"

export const AuthenticationModal = () => {
    const { isOpen, onClose: closeDisclosure } = useAuthenticationDisclosure()
    const authenticationModalTab = useAppSelector(
        (state) => state.tabs.authenticationModalTab
    )
    const isSignIn = authenticationModalTab === AuthenticationModalTab.SignIn
    const t = useTranslations()
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const el = dialogRef.current
        if (!el) return
        if (isOpen) {
            if (!el.open) {
                el.showModal()
            }
        } else if (el.open) {
            el.close()
        }
    }, [isOpen])

    const titleId = "auth-modal-title"
    const descriptionId = isSignIn
        ? "auth-modal-desc-signin"
        : "auth-modal-desc-signup"

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className={cn(
                "fixed inset-0 z-[200000] m-0 h-full max-h-none w-full max-w-none",
                "border-0 bg-transparent p-0",
                "open:flex open:items-center open:justify-center",
                "[&::backdrop]:bg-black/50"
            )}
            onClose={() => closeDisclosure()}
        >
            <div
                className="flex min-h-full w-full items-center justify-center p-6"
                onClick={() => closeDisclosure()}
                role="presentation"
            >
                <div
                    className={cn(
                        "relative isolate z-0 w-full max-w-xs overflow-hidden rounded-large",
                        "border border-default-200 bg-background text-foreground",
                        "shadow-large ring-1 ring-default-200",
                        "outline-none"
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Button
                        type="button"
                        isIconOnly
                        variant="light"
                        size="sm"
                        radius="full"
                        aria-label="Close"
                        className="absolute end-2 top-2 z-10 min-w-8 text-foreground-500"
                        onPress={() => closeDisclosure()}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    {isSignIn ? (
                        <>
                            <AuthModalStaticHeader
                                titleId={titleId}
                                descriptionId={descriptionId}
                                title={t("auth.signIn.title")}
                                description={t("auth.signIn.desc")}
                            />
                            <SignInSection />
                        </>
                    ) : (
                        <>
                            <AuthModalStaticHeader
                                titleId={titleId}
                                descriptionId={descriptionId}
                                title={t("auth.signUp.title")}
                                description={t("auth.signUp.desc")}
                            />
                            <SignUpSection />
                        </>
                    )}
                </div>
            </div>
        </dialog>
    )
}

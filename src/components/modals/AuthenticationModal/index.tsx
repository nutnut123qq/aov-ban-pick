"use client"

import React from "react"
import {
    TedoModal,
    TedoModalContent,
    TedoModalHeader,
} from "../../atomic"
import { useAuthenticationDisclosure } from "@/hooks/singleton"
import { useAppSelector } from "@/redux"
import { AuthenticationModalTab } from "@/redux/slices"
import { SignInSection } from "./SignInSection"
import { SignUpSection } from "./SignUpSection"
import { useTranslations } from "next-intl"

export const AuthenticationModal = () => {
    const { isOpen, onOpenChange } = useAuthenticationDisclosure()
    const authenticationModalTab = useAppSelector((state) => state.tabs.authenticationModalTab)
    const isSignIn = authenticationModalTab === AuthenticationModalTab.SignIn
    const t = useTranslations()

    return (
        <TedoModal
            isOpen={isOpen}
            size="xs"
            onOpenChange={onOpenChange}
            scrollBehavior="inside"
        >
            <TedoModalContent>
                {isSignIn ? (
                    <>
                        <TedoModalHeader
                            title={t("auth.signIn.title")}
                            description={t("auth.signIn.desc")}
                        />
                        <SignInSection />
                    </>
                ) : (
                    <>
                        <TedoModalHeader
                            title={t("auth.signUp.title")}
                            description={t("auth.signUp.desc")}
                        />
                        <SignUpSection />
                    </>
                )}
            </TedoModalContent>
        </TedoModal>
    )
}

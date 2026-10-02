"use client"
import React from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { Swords, BarChart3, ShieldBan, FilePlus2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const FeatureCard = ({
    icon: Icon,
    title,
    description,
    href,
}: {
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string
    href: string
}) => (
    <Link href={href}>
        <Card className="h-full transition-colors hover:bg-muted/40">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    </Link>
)

const DashboardPage = () => {
    const t = useTranslations("dashboard")

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="container mx-auto max-w-5xl px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl font-bold mb-1">{t("title")} 👋</h1>
                    <p className="text-sm text-muted-foreground">
                        {t("subtitle")}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FeatureCard
                        icon={Swords}
                        title={t("cards.draftSimTitle")}
                        description={t("cards.draftSimDesc")}
                        href="/draft"
                    />
                    <FeatureCard
                        icon={BarChart3}
                        title={t("cards.metaTitle")}
                        description={t("cards.metaDesc")}
                        href="/meta"
                    />
                    <FeatureCard
                        icon={ShieldBan}
                        title={t("cards.globalBanTitle")}
                        description={t("cards.globalBanDesc")}
                        href="/draft"
                    />
                    <FeatureCard
                        icon={FilePlus2}
                        title={t("cards.draftInputTitle")}
                        description={t("cards.draftInputDesc")}
                        href="/draft-input"
                    />
                </div>
            </div>
        </div>
    )
}

export default DashboardPage


"use client"
import React from "react"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { Database, BarChart3, AlertTriangle, RefreshCw } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAovData } from "@/modules/aov/useAovData"

const StatCell = ({ value, label }: { value: number; label: string }) => (
    <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-center">
        <div className="text-2xl font-bold tabular-nums">{value.toLocaleString()}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
    </div>
)

const AboutPage = () => {
    const t = useTranslations("about")
    const { data } = useAovData()

    const stats = React.useMemo(() => {
        if (!data) return null
        const matches = data.series.reduce((n, s) => n + s.matches.length, 0)
        const tournaments = new Map<string, number>()
        for (const s of data.series) {
            tournaments.set(s.tournament_name, (tournaments.get(s.tournament_name) ?? 0) + s.matches.length)
        }
        return {
            tournaments,
            series: data.series.length,
            matches,
            heroes: data.heroes.length,
        }
    }, [data])

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="container mx-auto max-w-3xl px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-6"
                >
                    <h1 className="text-2xl font-bold mb-1">{t("title")}</h1>
                    <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
                </motion.div>

                <div className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-3 pb-2">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                                <Database className="w-5 h-5 text-primary" />
                            </div>
                            <CardTitle className="text-base">{t("sourceTitle")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-sm text-muted-foreground">{t("sourceBody")}</p>
                            <a
                                href="https://liquipedia.net/arenaofvalor"
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-primary hover:underline"
                            >
                                liquipedia.net/arenaofvalor ↗
                            </a>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center gap-3 pb-2">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                                <BarChart3 className="w-5 h-5 text-primary" />
                            </div>
                            <CardTitle className="text-base">{t("coverageTitle")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {stats ? (
                                <>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <StatCell value={stats.tournaments.size} label={t("statTournaments")} />
                                        <StatCell value={stats.series} label={t("statSeries")} />
                                        <StatCell value={stats.matches} label={t("statMatches")} />
                                        <StatCell value={stats.heroes} label={t("statHeroes")} />
                                    </div>
                                    <ul className="space-y-1">
                                        {[...stats.tournaments.entries()].map(([name, count]) => (
                                            <li
                                                key={name}
                                                className="flex items-center justify-between text-sm"
                                            >
                                                <span>{name}</span>
                                                <span className="text-muted-foreground tabular-nums">
                                                    {count} {t("statMatches")}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">…</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center gap-3 pb-2">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                            </div>
                            <CardTitle className="text-base">{t("limitsTitle")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                <li>{t("limit1")}</li>
                                <li>{t("limit2")}</li>
                                <li>{t("limit3")}</li>
                                <li>{t("limit4")}</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center gap-3 pb-2">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                                <RefreshCw className="w-5 h-5 text-primary" />
                            </div>
                            <CardTitle className="text-base">{t("updateTitle")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{t("updateBody")}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default AboutPage

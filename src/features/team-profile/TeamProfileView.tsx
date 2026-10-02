"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { ArrowLeft, CalendarDays, Trophy, Users } from "lucide-react"

import { teamDisplayName } from "@/modules/aov/leagues"
import { getTeamDetail } from "@/modules/aov/teamStats"
import { useAovData } from "@/modules/aov/useAovData"
import type { HeroManifest } from "@/modules/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface TeamProfileViewProps {
    /** `team_id` lấy từ route param. */
    teamId: string
}

/** Cỡ mẫu tối thiểu của combo — khớp ngưỡng trong getTeamDetail. */
const COMBO_MIN_GAMES = 3

/** Định dạng tỉ lệ 0..1 thành "62.5%". */
const pct = (value: number): string => `${(value * 100).toFixed(1)}%`

/** Chuyển chuỗi YYYY-MM-DD thành Date địa phương (tránh lệch múi giờ). */
const parseDate = (value: string): Date | null => {
    if (!value) return null
    const [y, m, d] = value.split("-").map(Number)
    if (!y || !m || !d) return null
    return new Date(y, m - 1, d)
}

/** Định dạng ngày theo locale hiện tại. */
const formatDate = (value: string, locale: string): string => {
    const d = parseDate(value)
    if (!d) return value
    return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" }).format(d)
}

/** Trang hồ sơ đội: record, pool tướng, combo, theo mùa, đối đầu, series gần nhất. */
export const TeamProfileView = ({ teamId }: TeamProfileViewProps) => {
    const t = useTranslations("team")
    const tHero = useTranslations("hero")
    const tMatches = useTranslations("matches")
    const tMeta = useTranslations("meta")
    const locale = useLocale()
    const { data, error, isLoading } = useAovData()

    const detail = useMemo(
        () => (data ? getTeamDetail(data.series, teamId) : null),
        [data, teamId],
    )
    const heroBySlug = useMemo(
        () => new Map((data?.heroes ?? []).map((h) => [h.slug, h])),
        [data],
    )

    const backLink = (
        <Button variant="outline" size="sm" asChild className="gap-1">
            <Link href={`/${locale}/matches`}>
                <ArrowLeft className="h-4 w-4" />
                {t("backToMatches")}
            </Link>
        </Button>
    )

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
                <div className="container mx-auto max-w-5xl space-y-4 px-4 py-8">
                    {backLink}
                    <Skeleton className="h-10 w-64" />
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 w-full" />
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
                <div className="container mx-auto max-w-5xl space-y-4 px-4 py-8">
                    {backLink}
                    <p className="text-center text-sm text-destructive">
                        {tMatches("error")}: {String(error.message ?? error)}
                    </p>
                </div>
            </div>
        )
    }

    if (!detail) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
                <div className="container mx-auto max-w-5xl space-y-4 px-4 py-8">
                    {backLink}
                    <Card>
                        <CardContent className="py-12 text-center text-sm text-muted-foreground">
                            {t("notFound")}
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    const seriesLost = detail.seriesPlayed - detail.seriesWon

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="container mx-auto max-w-5xl space-y-6 px-4 py-8">
                <header>
                    {backLink}
                    <h1 className="mt-3 flex items-center gap-2 text-2xl font-bold">
                        <Users className="h-6 w-6 text-primary" />
                        {teamDisplayName(detail.teamId)}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t("seriesWl", { w: detail.seriesWon, l: seriesLost })}
                        {" · "}
                        {t("gameWl", { w: detail.gameWon, l: detail.gameLost })}
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card className="lg:col-span-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">
                                {t("heroPool")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 pb-2">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-4">
                                            {tMatches("filter.hero")}
                                        </TableHead>
                                        <TableHead className="w-20 text-center">
                                            {tHero("picks")}
                                        </TableHead>
                                        <TableHead className="w-20 text-center">
                                            {tHero("winRate")}
                                        </TableHead>
                                        <TableHead className="w-20 text-center">
                                            {t("bansByTeam")}
                                        </TableHead>
                                        <TableHead className="w-20 pr-4 text-center">
                                            {t("bansAgainst")}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {detail.heroPool.map((h) => (
                                        <TableRow key={h.heroId}>
                                            <TableCell className="pl-4 font-medium">
                                                <HeroCell
                                                    slug={h.heroId}
                                                    heroBySlug={heroBySlug}
                                                />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {h.picks}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {h.picks > 0 ? pct(h.wins / h.picks) : "—"}
                                            </TableCell>
                                            <TableCell className="text-center text-muted-foreground">
                                                {h.bansByTeam}
                                            </TableCell>
                                            <TableCell className="pr-4 text-center text-muted-foreground">
                                                {h.bansAgainst}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">
                                {t("combos")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {detail.combos.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {tMeta("pairEmpty", { min: COMBO_MIN_GAMES })}
                                </p>
                            ) : (
                                detail.combos.map((c) => (
                                    <div
                                        key={`${c.a}|${c.b}`}
                                        className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
                                    >
                                        <span className="flex min-w-0 items-center gap-1.5 text-sm font-medium">
                                            <HeroCell slug={c.a} heroBySlug={heroBySlug} small />
                                            <span className="text-muted-foreground">+</span>
                                            <HeroCell slug={c.b} heroBySlug={heroBySlug} small />
                                        </span>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {c.n} · {pct(c.n > 0 ? c.wins / c.n : 0)}
                                        </span>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">
                                {t("opponents")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {detail.opponents.map((o) => (
                                <div
                                    key={o.teamId}
                                    className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                                >
                                    <Link
                                        href={`/${locale}/teams/${o.teamId}`}
                                        className="truncate font-medium hover:underline"
                                    >
                                        {teamDisplayName(o.teamId)}
                                    </Link>
                                    <span className="shrink-0 text-muted-foreground">
                                        {o.won}-{o.lost}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">
                                {t("seasons")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 pb-2">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-4">
                                            {tMatches("filter.tournament")}
                                        </TableHead>
                                        <TableHead className="w-24 text-center">
                                            {tMatches("standings.series")}
                                        </TableHead>
                                        <TableHead className="w-24 pr-4 text-center">
                                            {tMatches("standings.games")}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {detail.seasons.map((s) => (
                                        <TableRow key={s.tournamentName}>
                                            <TableCell className="pl-4 font-medium">
                                                {s.tournamentName}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {s.seriesWon}-{s.seriesLost}
                                            </TableCell>
                                            <TableCell className="pr-4 text-center text-muted-foreground">
                                                {s.gameWon}-{s.gameLost}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">
                                {t("recentMatches")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {detail.recent.map((s) => {
                                const oppId =
                                    s.team_blue_id === detail.teamId
                                        ? s.team_red_id
                                        : s.team_blue_id
                                const won = s.winner_team_id === detail.teamId
                                return (
                                    <div
                                        key={s.id}
                                        className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                                    >
                                        <div className="flex min-w-0 items-center gap-2">
                                            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                            <span className="shrink-0 text-muted-foreground">
                                                {formatDate(s.played_at, locale)}
                                            </span>
                                            <span className="truncate">
                                                {s.tournament_name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">vs</span>
                                            <Link
                                                href={`/${locale}/teams/${oppId}`}
                                                className="font-medium hover:underline"
                                            >
                                                {teamDisplayName(oppId)}
                                            </Link>
                                            <span
                                                className={cn(
                                                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                                                    won
                                                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                                        : "bg-rose-500/15 text-rose-600 dark:text-rose-400",
                                                )}
                                            >
                                                <Trophy className="h-3 w-3" />
                                                {teamDisplayName(s.winner_team_id)}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

interface HeroCellProps {
    slug: string
    heroBySlug: Map<string, HeroManifest>
    /** Icon nhỏ — dùng trong hàng combo. */
    small?: boolean
}

/** Ô tướng: icon + tên hiển thị, fallback slug khi thiếu trong manifest. */
const HeroCell = ({ slug, heroBySlug, small }: HeroCellProps) => {
    const hero = heroBySlug.get(slug)
    const size = small ? "h-6 w-6" : "h-8 w-8"
    return (
        <span className="flex min-w-0 items-center gap-2">
            {hero ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={`/images/heroes/${hero.file}`}
                    alt={hero.name}
                    className={cn(size, "shrink-0 rounded object-cover")}
                />
            ) : (
                <span
                    className={cn(
                        size,
                        "flex shrink-0 items-center justify-center rounded bg-muted text-xs text-muted-foreground",
                    )}
                >
                    ?
                </span>
            )}
            <span className="truncate">{hero?.name ?? slug}</span>
        </span>
    )
}

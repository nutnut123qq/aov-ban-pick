"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { ArrowLeft, Swords, Trophy } from "lucide-react"

import { LANE_LABELS } from "@/modules/aov/lanes"
import { useAovData } from "@/modules/aov/useAovData"
import type { DraftAction, Match, Series, TeamSide } from "@/modules/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/** Trang duyệt các cặp đấu → ván đấu → chi tiết cấm/chọn. */
export const MatchesView = () => {
    const t = useTranslations("matches")
    const { data, isLoading, error } = useAovData()
    const [selectedSeries, setSelectedSeries] = useState<Series | null>(null)
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)

    const heroBySlug = useMemo(
        () => new Map((data?.heroes ?? []).map((h) => [h.slug, h])),
        [data],
    )

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
                <div className="container mx-auto max-w-5xl px-4 py-8">
                    <LoadingState />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
                <div className="container mx-auto max-w-5xl px-4 py-8">
                    <p className="text-center text-sm text-destructive">
                        {t("error")}: {String(error.message ?? error)}
                    </p>
                </div>
            </div>
        )
    }

    const series = data?.series ?? []

    if (selectedMatch && selectedSeries) {
        return (
            <MatchDraftView
                series={selectedSeries}
                match={selectedMatch}
                heroBySlug={heroBySlug}
                onBack={() => setSelectedMatch(null)}
            />
        )
    }

    if (selectedSeries) {
        return (
            <SeriesDetailView
                series={selectedSeries}
                onBack={() => setSelectedSeries(null)}
                onSelectMatch={(m) => {
                    setSelectedMatch(m)
                }}
            />
        )
    }

    return <SeriesListView series={series} onSelect={setSelectedSeries} />
}

interface SeriesListViewProps {
    series: Array<Series>
    onSelect: (s: Series) => void
}

/** Danh sách các cặp đấu (series). */
const SeriesListView = ({ series, onSelect }: SeriesListViewProps) => {
    const t = useTranslations("matches")

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="container mx-auto max-w-5xl px-4 py-8">
                <header className="mb-6">
                    <h1 className="flex items-center gap-2 text-2xl font-bold">
                        <Swords className="h-6 w-6 text-primary" />
                        {t("title")}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
                </header>

                {series.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-sm text-muted-foreground">
                            {t("noData")}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {series.map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => onSelect(s)}
                                className="text-left transition-transform hover:scale-[1.01]"
                            >
                                <Card className="h-full cursor-pointer hover:border-primary">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            {s.tournament_name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between gap-2 text-lg font-bold">
                                            <span className={cn("truncate", sideColor("blue"))}>
                                                {teamDisplayName(s.team_blue_id)}
                                            </span>
                                            <span className="text-muted-foreground">vs</span>
                                            <span className={cn("truncate", sideColor("red"))}>
                                                {teamDisplayName(s.team_red_id)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>
                                                {s.format} · {s.matches.length}{" "}
                                                {t("matchCount", { count: s.matches.length })}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Trophy className="h-3 w-3" />
                                                {teamDisplayName(s.winner_team_id)}
                                            </span>
                                        </div>
                                        {s.played_at && (
                                            <p className="text-xs text-muted-foreground">{s.played_at}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

interface SeriesDetailViewProps {
    series: Series
    onBack: () => void
    onSelectMatch: (m: Match) => void
}

/** Danh sách các ván trong một series. */
const SeriesDetailView = ({ series, onBack, onSelectMatch }: SeriesDetailViewProps) => {
    const t = useTranslations("matches")

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="container mx-auto max-w-4xl px-4 py-8">
                <header className="mb-6 flex flex-wrap items-center gap-3">
                    <Button variant="outline" size="sm" onClick={onBack} className="gap-1">
                        <ArrowLeft className="h-4 w-4" />
                        {t("back")}
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">
                            <span className={sideColor("blue")}>{teamDisplayName(series.team_blue_id)}</span>
                            {" vs "}
                            <span className={sideColor("red")}>{teamDisplayName(series.team_red_id)}</span>
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {series.tournament_name} · {series.format} · {series.played_at}
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {series.matches.map((m) => (
                        <button
                            key={m.van_number}
                            type="button"
                            onClick={() => onSelectMatch(m)}
                            className="text-left"
                        >
                            <Card className="cursor-pointer hover:border-primary">
                                <CardContent className="space-y-3 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold">
                                            {t("vanNumber", { number: m.van_number })}
                                        </span>
                                        {m.is_blind_pick && (
                                            <span className="text-xs text-muted-foreground">{t("blindPick")}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between gap-2 text-sm font-medium">
                                        <span className={cn("truncate", sideColor("blue"))}>
                                            {teamDisplayName(m.team_blue_id)}
                                        </span>
                                        <span className="text-muted-foreground">vs</span>
                                        <span className={cn("truncate", sideColor("red"))}>
                                            {teamDisplayName(m.team_red_id)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="inline-flex items-center gap-1">
                                            <Trophy className="h-3 w-3" />
                                            {teamDisplayName(m.winner_team_id)}
                                        </span>
                                        {m.duration_seconds !== undefined && (
                                            <span>{formatDuration(m.duration_seconds)}</span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

interface MatchDraftViewProps {
    series: Series
    match: Match
    heroBySlug: Map<string, { name: string; file: string }>
    onBack: () => void
}

/** Chi tiết cấm/chọn của một ván. */
const MatchDraftView = ({ match, heroBySlug, onBack }: MatchDraftViewProps) => {
    const t = useTranslations("matches")

    const sortedActions = useMemo(
        () =>
            [...match.draft_actions].sort((a, b) => {
                if (a.turn_number !== b.turn_number) return a.turn_number - b.turn_number
                return (a.pick_index ?? 0) - (b.pick_index ?? 0)
            }),
        [match.draft_actions],
    )

    const phases = [
        { key: "ban1", label: t("banPhase", { number: 1 }), turns: [1, 2, 3, 4] },
        { key: "pick1", label: t("pickPhase", { number: 1 }), turns: [5, 6, 7, 8] },
        { key: "ban2", label: t("banPhase", { number: 2 }), turns: [9, 10, 11, 12] },
        { key: "pick2", label: t("pickPhase", { number: 2 }), turns: [13, 14, 15] },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="container mx-auto max-w-4xl px-4 py-8">
                <header className="mb-6 flex flex-wrap items-center gap-3">
                    <Button variant="outline" size="sm" onClick={onBack} className="gap-1">
                        <ArrowLeft className="h-4 w-4" />
                        {t("back")}
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">{t("vanNumber", { number: match.van_number })}</h1>
                        <p className="text-sm text-muted-foreground">
                            <span className={sideColor("blue")}>{teamDisplayName(match.team_blue_id)}</span>
                            {" vs "}
                            <span className={sideColor("red")}>{teamDisplayName(match.team_red_id)}</span>
                            {" · "}
                            {t("winner")}: {teamDisplayName(match.winner_team_id)}
                        </p>
                    </div>
                </header>

                <div className="space-y-6">
                    {phases.map((phase) => {
                        const actions = sortedActions.filter((a) => phase.turns.includes(a.turn_number))
                        if (actions.length === 0) return null
                        return (
                            <Card key={phase.key}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">{phase.label}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                                        {actions.map((a, i) => (
                                            <DraftActionCard
                                                key={`${a.turn_number}-${a.pick_index ?? i}`}
                                                action={a}
                                                heroBySlug={heroBySlug}
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

interface DraftActionCardProps {
    action: DraftAction
    heroBySlug: Map<string, { name: string; file: string }>
}

/** Một ô cấm/chọn trong bảng draft. */
const DraftActionCard = ({ action, heroBySlug }: DraftActionCardProps) => {
    const t = useTranslations("matches")
    const hero = heroBySlug.get(action.hero_id)
    const isBan = action.action_type === "ban"

    return (
        <div
            className={cn(
                "flex flex-col items-center gap-2 rounded-lg border p-3",
                action.team_side === "blue" ? "border-blue-500/30 bg-blue-500/5" : "border-red-500/30 bg-red-500/5",
                isBan && "opacity-70",
            )}
        >
            {hero ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={`/images/heroes/${hero.file}`}
                    alt={hero.name}
                    className={cn("h-12 w-12 rounded object-cover", isBan && "grayscale")}
                />
            ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                    ?
                </div>
            )}
            <div className="text-center text-xs">
                <p className={cn("font-medium", isBan ? "text-destructive" : "text-foreground")}>
                    {hero?.name ?? action.hero_id}
                </p>
                <p className="text-muted-foreground">
                    {isBan
                        ? t("ban")
                        : `${t("pick")}${action.lane_position ? ` · ${LANE_LABELS[action.lane_position]}` : ""}`}
                </p>
                <p className={cn("text-[10px] font-semibold uppercase", sideColor(action.team_side))}>
                    {action.team_side === "blue" ? t("blue") : t("red")}
                </p>
            </div>
        </div>
    )
}

/** Hiển thị tên đội từ team_id (bỏ prefix "team_"). */
const teamDisplayName = (teamId: string): string => {
    const raw = teamId.replace(/^team_/, "")
    return raw.toUpperCase()
}

/** Màu theo phe. */
const sideColor = (side: TeamSide): string =>
    side === "blue" ? "text-blue-600 dark:text-blue-400" : "text-rose-600 dark:text-rose-400"

/** Định dạng thờ lượng ván. */
const formatDuration = (seconds: number): string => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
}

/** Khung chờ khi đang tải. */
const LoadingState = () => (
    <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
        ))}
    </div>
)

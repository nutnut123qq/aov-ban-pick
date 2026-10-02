"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { MonitorPlay, Swords, Users } from "lucide-react"

import {
    getHeroDetail,
    useAovData,
    type HeroGameRef,
    type HeroPairStat,
} from "@/modules/aov"
import { teamDisplayName } from "@/modules/aov/leagues"
import type { HeroManifest } from "@/modules/types"
import { Badge } from "@/components/ui/badge"
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

/** Định dạng tỉ lệ 0..1 thành "62.5%". */
const pct = (value: number): string => `${(value * 100).toFixed(1)}%`

/** WR >= 60% xanh, < 45% đỏ, còn lại trung tính. */
const wrColor = (wr: number): string =>
    wr >= 0.6
        ? "text-emerald-600 dark:text-emerald-400"
        : wr < 0.45
          ? "text-rose-600 dark:text-rose-400"
          : "text-foreground"

/** Định dạng ngày theo locale hiện tại; giữ nguyên chuỗi nếu không parse được. */
const formatDate = (value: string, locale: string): string => {
    const [y, m, d] = value.split("-").map(Number)
    if (!y || !m || !d) return value
    return new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(y, m - 1, d))
}

/** Trang chi tiết tướng: stats theo lane/giải, đồng đội & kèo, trận gần nhất. */
export const HeroDetailView = () => {
    const t = useTranslations("hero")
    const tMeta = useTranslations("meta")
    const tMatches = useTranslations("matches")
    const tLane = useTranslations("lanes")
    const tCommon = useTranslations("common")
    const locale = useLocale()
    const router = useRouter()
    const { slug } = useParams<{ slug: string }>()

    const { data, error, isLoading } = useAovData()

    const heroBySlug = useMemo(
        () => new Map((data?.heroes ?? []).map((h) => [h.slug, h])),
        [data],
    )
    const hero = heroBySlug.get(slug) ?? null
    const detail = useMemo(
        () => (data ? getHeroDetail(data.series, slug) : null),
        [data, slug],
    )

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="container mx-auto max-w-5xl px-4 py-8">
                <Link
                    href="/meta"
                    className="mb-4 inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    {t("backToMeta")}
                </Link>

                {isLoading && <LoadingState />}

                {error && (
                    <Card>
                        <CardContent className="py-8 text-center text-sm text-destructive">
                            {tCommon("error")}: {String(error.message ?? error)}
                        </CardContent>
                    </Card>
                )}

                {!isLoading && !error && !detail && (
                    <Card>
                        <CardContent className="py-12 text-center text-sm text-muted-foreground">
                            {t("notFound")}
                        </CardContent>
                    </Card>
                )}

                {!isLoading && !error && detail && (
                    <>
                        <Card className="mb-6">
                            <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
                                {hero?.file ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={`/images/heroes/${hero.file}`}
                                        alt={hero.name}
                                        className="h-20 w-20 shrink-0 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="h-20 w-20 shrink-0 rounded-lg bg-muted" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <h1 className="truncate text-2xl font-bold">
                                        {hero?.name ?? slug}
                                    </h1>
                                    <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                                        <span className="text-muted-foreground">
                                            {t("picks")}:{" "}
                                            <span className="font-semibold tabular-nums text-foreground">
                                                {detail.picks}
                                            </span>
                                        </span>
                                        <span className="text-muted-foreground">
                                            {t("bans")}:{" "}
                                            <span className="font-semibold tabular-nums text-foreground">
                                                {detail.bans}
                                            </span>
                                        </span>
                                        <span className="text-muted-foreground">
                                            {t("winRate")}:{" "}
                                            <span
                                                className={cn(
                                                    "font-semibold tabular-nums",
                                                    wrColor(
                                                        detail.picks
                                                            ? detail.wins / detail.picks
                                                            : 0,
                                                    ),
                                                )}
                                            >
                                                {pct(
                                                    detail.picks
                                                        ? detail.wins / detail.picks
                                                        : 0,
                                                )}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">{t("byLane")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>{tMeta("position")}</TableHead>
                                                <TableHead className="text-right">
                                                    {t("picks")}
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    {t("winRate")}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {detail.byLane.map((l) => (
                                                <TableRow key={l.lane}>
                                                    <TableCell>{tLane(l.lane)}</TableCell>
                                                    <TableCell className="text-right tabular-nums">
                                                        {l.picks}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span
                                                            className={cn(
                                                                "font-semibold tabular-nums",
                                                                wrColor(
                                                                    l.picks
                                                                        ? l.wins / l.picks
                                                                        : 0,
                                                                ),
                                                            )}
                                                        >
                                                            {pct(
                                                                l.picks
                                                                    ? l.wins / l.picks
                                                                    : 0,
                                                            )}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">
                                        {t("byTournament")}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>{tMeta("tournament")}</TableHead>
                                                <TableHead className="text-right">
                                                    {t("picks")}
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    {t("bans")}
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    {t("winRate")}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {detail.byTournament.map((s) => (
                                                <TableRow key={s.tournamentName}>
                                                    <TableCell className="max-w-40 truncate">
                                                        {s.tournamentName}
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums">
                                                        {s.picks}
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums text-muted-foreground">
                                                        {s.bans}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span
                                                            className={cn(
                                                                "font-semibold tabular-nums",
                                                                wrColor(
                                                                    s.picks
                                                                        ? s.wins / s.picks
                                                                        : 0,
                                                                ),
                                                            )}
                                                        >
                                                            {pct(
                                                                s.picks
                                                                    ? s.wins / s.picks
                                                                    : 0,
                                                            )}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Users className="h-4 w-4 text-primary" />
                                        {t("teammates")}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <PairList rows={detail.teammates} heroBySlug={heroBySlug} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Swords className="h-4 w-4 text-primary" />
                                        {tMeta("matchupTitle")}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <section>
                                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t("beats")}
                                        </h3>
                                        <PairList rows={detail.beats} heroBySlug={heroBySlug} />
                                    </section>
                                    <section>
                                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t("losesTo")}
                                        </h3>
                                        <PairList
                                            rows={detail.losesTo}
                                            heroBySlug={heroBySlug}
                                        />
                                    </section>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="mt-6">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">
                                    {t("recentGames")}{" "}
                                    <span className="font-normal text-muted-foreground">
                                        · {t("gamesCount", { count: detail.games.length })}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="divide-y">
                                    {detail.games.map((g) => (
                                        <GameRow
                                            key={`${g.seriesId}|${g.vanNumber}|${g.teamSide}`}
                                            game={g}
                                            locale={locale}
                                            vanLabel={tMatches("vanNumber", {
                                                number: g.vanNumber,
                                            })}
                                            vodLabel={t("watchVod")}
                                            onOpen={() => router.push("/matches")}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    )
}

interface PairListProps {
    /** Các cặp đã sort sẵn từ getHeroDetail. */
    rows: Array<HeroPairStat>
    /** Map slug → manifest để lấy icon + tên hiển thị. */
    heroBySlug: Map<string, HeroManifest>
}

/** List cặp tướng: icon + tên + số ván + WR%. */
const PairList = ({ rows, heroBySlug }: PairListProps) => {
    const t = useTranslations("hero")
    if (rows.length === 0) {
        return (
            <p className="py-4 text-center text-sm text-muted-foreground">
                {t("pairEmpty")}
            </p>
        )
    }
    return (
        <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
            {rows.map((r) => {
                const h = heroBySlug.get(r.heroId)
                const wr = r.n ? r.wins / r.n : 0
                return (
                    <div
                        key={r.heroId}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 odd:bg-muted/40"
                    >
                        <span className="flex min-w-0 flex-1 items-center gap-1.5">
                            {h?.file ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={`/images/heroes/${h.file}`}
                                    alt={h.name}
                                    className="h-7 w-7 shrink-0 rounded object-cover"
                                />
                            ) : (
                                <div className="h-7 w-7 shrink-0 rounded bg-muted" />
                            )}
                            <span className="truncate text-sm font-medium">
                                {h?.name ?? r.heroId}
                            </span>
                        </span>
                        <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                            {r.n}
                        </span>
                        <span
                            className={cn(
                                "w-14 shrink-0 text-right text-sm font-semibold tabular-nums",
                                wrColor(wr),
                            )}
                        >
                            {pct(wr)}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

interface GameRowProps {
    /** Ref một ván có hero được pick. */
    game: HeroGameRef
    /** Locale hiện tại để format ngày. */
    locale: string
    /** Nhãn "Ván n" đã dịch sẵn. */
    vanLabel: string
    /** Nhãn nút VOD đã dịch sẵn. */
    vodLabel: string
    /** Điều hướng khi click row (→ /matches). */
    onOpen: () => void
}

/** Một dòng trận gần nhất: W/L + đối thủ + giải/ngày + nút VOD. */
const GameRow = ({ game, locale, vanLabel, vodLabel, onOpen }: GameRowProps) => (
    <div
        role="link"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
            if (e.key === "Enter") onOpen()
        }}
        className="flex cursor-pointer items-center gap-3 px-2 py-2.5 transition-colors hover:bg-muted/50"
    >
        <Badge
            variant="outline"
            className={cn(
                "w-6 justify-center font-bold",
                game.won
                    ? "border-emerald-600/40 text-emerald-600 dark:text-emerald-400"
                    : "border-rose-600/40 text-rose-600 dark:text-rose-400",
            )}
        >
            {game.won ? "W" : "L"}
        </Badge>
        <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">
                vs {teamDisplayName(game.opponentTeamId)}
            </div>
            <div className="truncate text-xs text-muted-foreground">
                {game.tournamentName} · {vanLabel} · {formatDate(game.playedAt, locale)}
            </div>
        </div>
        {game.vodUrl && (
            <a
                href={game.vodUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
            >
                <MonitorPlay className="h-3.5 w-3.5" />
                {vodLabel}
            </a>
        )}
    </div>
)

/** Khung chờ khi đang tải dữ liệu. */
const LoadingState = () => (
    <div className="space-y-6">
        <Card>
            <CardContent className="flex items-center gap-4 py-5">
                <Skeleton className="h-20 w-20 rounded-lg" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
            </CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                    <CardContent className="space-y-3 py-6">
                        {Array.from({ length: 4 }).map((__, j) => (
                            <Skeleton key={j} className="h-8 w-full" />
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
)

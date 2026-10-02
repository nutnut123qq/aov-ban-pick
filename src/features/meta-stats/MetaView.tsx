"use client"
import { type ReactNode, useMemo, useState } from "react"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { BarChart3, FilePlus2, Search } from "lucide-react"

import {
    aggregateMeta,
    clamp01,
    getTally,
    LANE_OPTIONS,
    useAovData,
    type MetaRow,
} from "@/modules/aov"
import type { HeroManifest, Lane } from "@/modules/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { TournamentMultiSelect } from "@/components/TournamentMultiSelect"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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

const ALL = "all"

/** Mẫu tối thiểu để một cặp tướng lên bảng combo/kèo — dưới mức này quá nhiễu. */
const MIN_PAIR_GAMES = 8
const MAX_PAIR_ROWS = 20

/** Định dạng tỉ lệ 0..1 thành "62.5%". */
const pct = (value: number): string => `${(value * 100).toFixed(1)}%`

/** "61% / 48%" cho WR theo bên Xanh/Đỏ; "—" khi mẫu một bên (hoặc cả hai) <5. */
const blueRedText = (row: MetaRow): string => {
    if (row.wrBlue === null && row.wrRed === null) return "—"
    const b = row.wrBlue === null ? "—" : `${(row.wrBlue * 100).toFixed(0)}%`
    const r = row.wrRed === null ? "—" : `${(row.wrRed * 100).toFixed(0)}%`
    return `${b} / ${r}`
}

/** Icon sắp xếp cho header bảng. */
const renderSortIcon = (
    sort: { column: string | null; direction: "asc" | "desc" },
    column: string,
): ReactNode => {
    if (sort.column !== column) {
        return <span className="text-muted-foreground/40">↕</span>
    }
    return sort.direction === "asc" ? <span>▲</span> : <span>▼</span>
}

/** Trang thống kê Meta: WR/PR/BR theo patch + lane, kèm cỡ mẫu. */
export const MetaView = () => {
    const t = useTranslations("meta")
    const tCommon = useTranslations("common")
    const tLane = useTranslations("lanes")

    const { data, error, isLoading } = useAovData()
    const [tournaments, setTournaments] = useState<Array<string>>([])
    const [lane, setLane] = useState<Lane | typeof ALL>(ALL)
    const [query, setQuery] = useState("")
    const [sort, setSort] = useState<{
        column: "picks" | "winRate" | "pickRate" | "banRate" | null
        direction: "asc" | "desc"
    }>({ column: null, direction: "desc" })

    const result = useMemo(() => {
        if (!data) return null
        return aggregateMeta(data.series, data.heroes, {
            patchId: ALL,
            lane: lane as Lane | "all",
            tournamentNames: tournaments,
        })
    }, [data, lane, tournaments])

    const rows = useMemo(() => {
        if (!result) return []
        let filtered = result.rows
        const q = query.trim().toLowerCase()
        if (q) filtered = filtered.filter((r) => r.heroName.toLowerCase().includes(q))
        if (sort.column) {
            const col = sort.column
            const dir = sort.direction === "asc" ? 1 : -1
            filtered = [...filtered].sort((a, b) => {
                if (a[col] < b[col]) return -1 * dir
                if (a[col] > b[col]) return 1 * dir
                return b.picks - a.picks
            })
        }
        return filtered
    }, [result, query, sort])

    const heroBySlug = useMemo(
        () => new Map((data?.heroes ?? []).map((h) => [h.slug, h])),
        [data],
    )

    /** Bảng đếm cặp (cùng bên + đối đầu) — reuse getTally của engine gợi ý, cùng bộ lọc giải. */
    const pairRows = useMemo(() => {
        if (!data) return { synergy: [] as Array<PairRow>, matchup: [] as Array<PairRow> }
        const filtered = data.series.filter(
            (s) => tournaments.length === 0 || tournaments.includes(s.tournament_name),
        )
        const tally = getTally(filtered, tournaments.join("|"))

        const synergy: Array<PairRow> = [...tally.pair.entries()]
            .filter(([, c]) => c.n >= MIN_PAIR_GAMES)
            .map(([k, c]) => {
                const [a, b] = k.split("+")
                return { a, b, n: c.n, wr: clamp01(c.wins / c.n) }
            })
            .sort((x, y) => y.wr - x.wr || y.n - x.n)
            .slice(0, MAX_PAIR_ROWS)

        // matchup key `a|b` lưu cả 2 chiều; chỉ giữ chiều thắng (wr ≥ 0.5) để khỏi trùng.
        const matchup: Array<PairRow> = [...tally.matchup.entries()]
            .filter(([, c]) => c.n >= MIN_PAIR_GAMES && c.wins * 2 > c.n)
            .map(([k, c]) => {
                const [a, b] = k.split("|")
                return { a, b, n: c.n, wr: clamp01(c.wins / c.n) }
            })
            .sort((x, y) => y.wr - x.wr || y.n - x.n)
            .slice(0, MAX_PAIR_ROWS)

        return { synergy, matchup }
    }, [data, tournaments])

    const toggleSort = (column: "picks" | "winRate" | "pickRate" | "banRate") => {
        setSort((prev) => {
            if (prev.column === column) {
                return { column, direction: prev.direction === "asc" ? "desc" : "asc" }
            }
            return { column, direction: "desc" }
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="container mx-auto max-w-5xl px-4 py-8">
                <header className="mb-6">
                    <h1 className="flex items-center gap-2 text-2xl font-bold">
                        <BarChart3 className="h-6 w-6 text-primary" />
                        {t("title")}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t("description")}
                    </p>
                </header>

                {isLoading && <LoadingState />}

                {error && (
                    <Card>
                        <CardContent className="py-8 text-center text-sm text-destructive">
                            {tCommon("error")}: {String(error.message ?? error)}
                        </CardContent>
                    </Card>
                )}

                {!isLoading && !error && result && (
                    <>
                        <Card className="mb-6">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">{t("filterTitle")}</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">{t("tournament")}</Label>
                                    <TournamentMultiSelect
                                        tournaments={result.tournaments}
                                        selected={tournaments}
                                        onChange={setTournaments}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">{t("searchHero")}</Label>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder={t("searchPlaceholder")}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {result.totalMatches === 0 ? (
                            <EmptyState />
                        ) : (
                            <>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">
                                        {t("rowsHeader", {
                                            rowCount: rows.length,
                                            matchCount: result.totalMatches,
                                        })}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {rows.length === 0 ? (
                                        <p className="py-6 text-center text-sm text-muted-foreground">
                                            {t("noMatch")}
                                        </p>
                                    ) : (
                                        <>
                                            <div className="hidden lg:block overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>{t("hero")}</TableHead>
                                                            <TableHead>
                                                                <div className="flex flex-col gap-1">
                                                                    <span>{t("position")}</span>
                                                                    <Select
                                                                        value={lane}
                                                                        onValueChange={(v) =>
                                                                            setLane(v as Lane | typeof ALL)
                                                                        }
                                                                    >
                                                                        <SelectTrigger className="h-8 text-xs">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value={ALL}>
                                                                                {t("allPositions")}
                                                                            </SelectItem>
                                                                            {LANE_OPTIONS.map((l) => (
                                                                                <SelectItem key={l.value} value={l.value}>
                                                                                    {tLane(l.value)}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </TableHead>
                                                            <TableHead className="text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleSort("picks")}
                                                                    className="inline-flex items-center gap-1"
                                                                >
                                                                    {t("matchesCount")}{" "}
                                                                    {renderSortIcon(sort, "picks")}
                                                                </button>
                                                            </TableHead>
                                                            <TableHead className="text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleSort("winRate")}
                                                                    className="inline-flex items-center gap-1"
                                                                >
                                                                    {t("winRate")}{" "}
                                                                    {renderSortIcon(sort, "winRate")}
                                                                </button>
                                                            </TableHead>
                                                            <TableHead className="text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleSort("pickRate")}
                                                                    className="inline-flex items-center gap-1"
                                                                >
                                                                    {t("pickRate")}{" "}
                                                                    {renderSortIcon(sort, "pickRate")}
                                                                </button>
                                                            </TableHead>
                                                            <TableHead className="text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleSort("banRate")}
                                                                    className="inline-flex items-center gap-1"
                                                                >
                                                                    {t("banRate")}{" "}
                                                                    {renderSortIcon(sort, "banRate")}
                                                                </button>
                                                            </TableHead>
                                                            <TableHead className="text-right">
                                                                {t("blueRedWr")}
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {rows.map((row) => (
                                                            <StatRow key={`${row.heroId}|${row.lane}`} row={row} />
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                            <div className="grid gap-3 lg:hidden">
                                                {rows.map((row) => (
                                                    <StatCard key={`${row.heroId}|${row.lane}`} row={row} />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <PairTable
                                    title={t("synergyTitle")}
                                    rows={pairRows.synergy}
                                    heroBySlug={heroBySlug}
                                    separator="with"
                                />
                                <PairTable
                                    title={t("matchupTitle")}
                                    rows={pairRows.matchup}
                                    heroBySlug={heroBySlug}
                                    separator="vs"
                                />
                            </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

interface PairRow {
    /** hero_id tướng thứ nhất. */
    a: string
    /** hero_id tướng thứ hai. */
    b: string
    /** Số ván cặp này xuất hiện cùng/đối nhau. */
    n: number
    /** WR của cặp (synergy) hoặc của `a` khi gặp `b` (matchup). */
    wr: number
}

/** Bảng cặp tướng: icon 2 bên + số ván + WR, scroll trong khung cố định. */
const PairTable = ({
    title,
    rows,
    heroBySlug,
    separator,
}: {
    title: string
    rows: Array<PairRow>
    heroBySlug: Map<string, HeroManifest>
    separator: "with" | "vs"
}) => {
    const t = useTranslations("meta")
    const locale = useLocale()
    const heroCell = (slug: string) => {
        const h = heroBySlug.get(slug)
        return (
            <Link
                href={`/${locale}/heroes/${slug}`}
                className="flex min-w-0 items-center gap-1.5 hover:underline"
            >
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
                <span className="truncate text-sm font-medium">{h?.name ?? slug}</span>
            </Link>
        )
    }
    const wrColor = (wr: number) =>
        wr >= 0.6
            ? "text-emerald-600 dark:text-emerald-400"
            : wr < 0.45
              ? "text-rose-600 dark:text-rose-400"
              : "text-foreground"

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {rows.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        {t("pairEmpty", { min: MIN_PAIR_GAMES })}
                    </p>
                ) : (
                    <div className="max-h-96 space-y-1 overflow-y-auto pr-1">
                        {rows.map((r) => (
                            <div
                                key={`${r.a}|${r.b}`}
                                className="flex items-center gap-2 rounded-md px-2 py-1.5 odd:bg-muted/40"
                            >
                                <div className="grid min-w-0 flex-1 grid-cols-[1fr_auto_1fr] items-center gap-2">
                                    {heroCell(r.a)}
                                    <span className="text-xs text-muted-foreground">
                                        {separator === "vs" ? "vs" : "+"}
                                    </span>
                                    {heroCell(r.b)}
                                </div>
                                <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                                    {r.n}
                                </span>
                                <span
                                    className={cn(
                                        "w-14 shrink-0 text-right text-sm font-semibold tabular-nums",
                                        wrColor(r.wr),
                                    )}
                                >
                                    {pct(r.wr)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

/** Một dòng tướng + lane trong bảng thống kê. */
const StatRow = ({ row }: { row: MetaRow }) => {
    const tLane = useTranslations("lanes")
    const locale = useLocale()
    const wrColor =
        row.winRate > 0.52
            ? "text-emerald-600 dark:text-emerald-400"
            : row.winRate < 0.48
              ? "text-rose-600 dark:text-rose-400"
              : "text-foreground"

    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-2">
                    {row.heroFile ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={`/images/heroes/${row.heroFile}`}
                            alt={row.heroName}
                            className="h-8 w-8 rounded object-cover"
                        />
                    ) : (
                        <div className="h-8 w-8 rounded bg-muted" />
                    )}
                    <Link
                        href={`/${locale}/heroes/${row.heroId}`}
                        className="font-medium hover:underline"
                    >
                        {row.heroName}
                    </Link>
                </div>
            </TableCell>
            <TableCell className="text-muted-foreground">{tLane(row.lane)}</TableCell>
            <TableCell className="text-right tabular-nums">{row.picks}</TableCell>
            <TableCell className="text-right">
                <div className={cn("font-semibold tabular-nums", wrColor)}>{pct(row.winRate)}</div>
            </TableCell>
            <TableCell className="text-right tabular-nums">{pct(row.pickRate)}</TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
                {pct(row.banRate)}
            </TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
                {blueRedText(row)}
            </TableCell>
        </TableRow>
    )
}

/** Một dòng tướng + lane dạng card cho mobile. */
const StatCard = ({ row }: { row: MetaRow }) => {
    const t = useTranslations("meta")
    const tLane = useTranslations("lanes")
    const locale = useLocale()
    const wrColor =
        row.winRate > 0.52
            ? "text-emerald-600 dark:text-emerald-400"
            : row.winRate < 0.48
              ? "text-rose-600 dark:text-rose-400"
              : "text-foreground"

    return (
        <div className="flex items-center gap-3 rounded-lg border p-3">
            {row.heroFile ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={`/images/heroes/${row.heroFile}`}
                    alt={row.heroName}
                    className="h-12 w-12 rounded object-cover"
                />
            ) : (
                <div className="h-12 w-12 rounded bg-muted" />
            )}
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <Link
                        href={`/${locale}/heroes/${row.heroId}`}
                        className="truncate font-medium hover:underline"
                    >
                        {row.heroName}
                    </Link>
                    <span className="text-xs text-muted-foreground">{tLane(row.lane)}</span>
                </div>
                <div className="mt-1 grid grid-cols-3 gap-2 text-sm">
                    <div>
                        <p className="text-xs text-muted-foreground">{t("matchesCount")}</p>
                        <span className="tabular-nums">{row.picks}</span>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{t("winRate")}</p>
                        <span className={cn("font-semibold tabular-nums", wrColor)}>{pct(row.winRate)}</span>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{t("pickBanRate")}</p>
                        <span className="tabular-nums">{pct(row.pickRate)} / {pct(row.banRate)}</span>
                    </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                    {t("blueRedWr")}: <span className="tabular-nums">{blueRedText(row)}</span>
                </p>
            </div>
        </div>
    )
}

/** Khung chờ khi đang tải dữ liệu. */
const LoadingState = () => (
    <Card>
        <CardContent className="space-y-3 py-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
            ))}
        </CardContent>
    </Card>
)

/** Hiện khi chưa có ván nào trong dữ liệu — dẫn người dùng đi nhập liệu. */
const EmptyState = () => {
    const t = useTranslations("meta")
    return (
        <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <FilePlus2 className="h-10 w-10 text-muted-foreground" />
                <div>
                    <p className="font-medium">{t("emptyTitle")}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t("emptyDesc")}
                    </p>
                </div>
                <Button asChild>
                    <Link href="/draft-input">{t("goToInput")}</Link>
                </Button>
            </CardContent>
        </Card>
    )
}

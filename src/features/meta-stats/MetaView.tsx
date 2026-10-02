"use client"
import { type ReactNode, useMemo, useState } from "react"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { BarChart3, FilePlus2, Search } from "lucide-react"

import {
    aggregateMeta,
    clamp01,
    getDurationStats,
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
import { CompareTable, type CompareRow } from "./CompareTable"

const ALL = "all"

/** Mẫu tối thiểu để một cặp tướng lên bảng combo/kèo — dưới mức này quá nhiễu. */
const MIN_PAIR_GAMES = 8
/** Mẫu tối thiểu cho bảng duo theo cặp lane (nhỏ hơn combo vì cắt theo lane). */
const MIN_DUO_GAMES = 5
/** Tổng pick tối thiểu của một tướng để hiện phân bố phase — dưới mức này "—". */
const MIN_PHASE_PICKS = 10
/** Mẫu tối thiểu mỗi bên để tính delta WR trong chế độ so sánh. */
const MIN_COMPARE_SAMPLE = 5
const MAX_PAIR_ROWS = 20

/**
 * Mọi cặp lane C(5,2) theo thứ tự LANE_OPTIONS (= LANE_ORDER bên stats layer).
 * `value` = `${laneA}|${laneB}` — trùng prefix của key `tally.duoLane`.
 */
const LANE_PAIRS: Array<{ value: string; a: Lane; b: Lane }> = (() => {
    const lanes = LANE_OPTIONS.map((o) => o.value)
    const pairs: Array<{ value: string; a: Lane; b: Lane }> = []
    for (let i = 0; i < lanes.length; i++) {
        for (let j = i + 1; j < lanes.length; j++) {
            pairs.push({ value: `${lanes[i]}|${lanes[j]}`, a: lanes[i], b: lanes[j] })
        }
    }
    return pairs
})()

/** Định dạng tỉ lệ 0..1 thành "62.5%". */
const pct = (value: number): string => `${(value * 100).toFixed(1)}%`

/** Định dạng giây thành "12′34″". */
const formatSec = (sec: number): string => {
    const m = Math.floor(sec / 60)
    const s = Math.round(sec - m * 60)
    return `${m}′${String(s).padStart(2, "0")}″`
}

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
    const [compare, setCompare] = useState(false)
    const [tournamentsA, setTournamentsA] = useState<Array<string>>([])
    const [tournamentsB, setTournamentsB] = useState<Array<string>>([])
    // Mặc định cặp Rừng × Giữa — duo phổ biến nhất.
    const [duoPair, setDuoPair] = useState("rung|giua")
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

    /** Series sau khi lọc giải — dùng chung cho tally và thống kê duration. */
    const filteredSeries = useMemo(() => {
        if (!data) return []
        return data.series.filter(
            (s) => tournaments.length === 0 || tournaments.includes(s.tournament_name),
        )
    }, [data, tournaments])

    /** Bảng đếm của engine gợi ý trên tập đã lọc — nguồn cho combo/kèo/duo/phase. */
    const metaTally = useMemo(
        () => getTally(filteredSeries, tournaments.join("|")),
        [filteredSeries, tournaments],
    )

    /** Thống kê thời lượng trên tập đã lọc — `metaAvgSec` là chuẩn nhanh/chậm. */
    const durationStats = useMemo(() => getDurationStats(filteredSeries), [filteredSeries])
    const metaAvgSec = durationStats.metaAvgSec

    /** Bảng đếm cặp (cùng bên + đối đầu) — reuse getTally của engine gợi ý, cùng bộ lọc giải. */
    const pairRows = useMemo(() => {
        const tally = metaTally

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
    }, [metaTally])

    /** Top cặp tướng cùng bên trong cặp lane đang chọn (key `laneA|laneB|heroA+heroB`). */
    const duoRows = useMemo(() => {
        const prefix = `${duoPair}|`
        return [...metaTally.duoLane.entries()]
            .filter(([k, c]) => k.startsWith(prefix) && c.n >= MIN_DUO_GAMES)
            .map(([k, c]) => {
                const [a, b] = k.slice(prefix.length).split("+")
                return { a, b, n: c.n, wr: clamp01(c.wins / c.n) }
            })
            .sort((x, y) => y.wr - x.wr || y.n - x.n)
            .slice(0, MAX_PAIR_ROWS)
    }, [metaTally, duoPair])

    /** Phân bố phase pick (early/mid/late) theo hero — dạng text "40/35/25" + tooltip. */
    const phaseInfoByHero = useMemo(() => {
        const totals = new Map<string, { e: number; m: number; l: number }>()
        for (const [k, c] of metaTally.phasePick) {
            const sep = k.lastIndexOf("|")
            const heroId = k.slice(0, sep)
            const phase = k.slice(sep + 1)
            const cur = totals.get(heroId) ?? { e: 0, m: 0, l: 0 }
            if (phase === "early") cur.e += c.n
            else if (phase === "mid") cur.m += c.n
            else if (phase === "late") cur.l += c.n
            totals.set(heroId, cur)
        }
        const map = new Map<string, { text: string; title: string }>()
        for (const [heroId, rec] of totals) {
            const total = rec.e + rec.m + rec.l
            if (total < MIN_PHASE_PICKS) continue
            const e = Math.round((rec.e / total) * 100)
            const m = Math.round((rec.m / total) * 100)
            const l = Math.round((rec.l / total) * 100)
            map.set(heroId, {
                text: `${e}/${m}/${l}`,
                title: `${t("phaseEarly")} ${e}% · ${t("phaseMid")} ${m}% · ${t("phaseLate")} ${l}%`,
            })
        }
        return map
    }, [metaTally, t])

    /** Join meta của 2 bộ giải A/B theo `${heroId}|${lane}` — chỉ tính khi compare bật. */
    const compareRows = useMemo((): Array<CompareRow> => {
        if (!data || !compare) return []
        const base = { patchId: ALL, lane: lane as Lane | "all" }
        const resA = aggregateMeta(data.series, data.heroes, {
            ...base,
            tournamentNames: tournamentsA,
        })
        const resB = aggregateMeta(data.series, data.heroes, {
            ...base,
            tournamentNames: tournamentsB,
        })
        const mapA = new Map(resA.rows.map((r) => [`${r.heroId}|${r.lane}`, r]))
        const mapB = new Map(resB.rows.map((r) => [`${r.heroId}|${r.lane}`, r]))
        const keys = new Set([...mapA.keys(), ...mapB.keys()])
        const q = query.trim().toLowerCase()

        const rows: Array<CompareRow> = []
        for (const key of keys) {
            const a = mapA.get(key)
            const b = mapB.get(key)
            const heroName = a?.heroName ?? b?.heroName ?? ""
            if (q && !heroName.toLowerCase().includes(q)) continue
            const hasSample =
                a != null && b != null && a.picks >= MIN_COMPARE_SAMPLE && b.picks >= MIN_COMPARE_SAMPLE
            rows.push({
                key,
                heroId: a?.heroId ?? b?.heroId ?? "",
                heroName,
                heroFile: a?.heroFile ?? b?.heroFile ?? null,
                lane: (a?.lane ?? b?.lane) as Lane,
                a: a ? { n: a.picks, wr: a.winRate } : null,
                b: b ? { n: b.picks, wr: b.winRate } : null,
                delta: hasSample ? a.winRate - b.winRate : null,
            })
        }
        // |delta| giảm dần; dòng thiếu mẫu (delta null) xếp cuối, tie-break theo tổng pick.
        rows.sort(
            (x, y) =>
                (y.delta === null ? -1 : Math.abs(y.delta)) -
                    (x.delta === null ? -1 : Math.abs(x.delta)) ||
                (y.a?.n ?? 0) + (y.b?.n ?? 0) - ((x.a?.n ?? 0) + (x.b?.n ?? 0)),
        )
        return rows
    }, [data, compare, lane, tournamentsA, tournamentsB, query])

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
                                {compare ? (
                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-muted-foreground">
                                                {t("compareA")}
                                            </Label>
                                            <TournamentMultiSelect
                                                tournaments={result.tournaments}
                                                selected={tournamentsA}
                                                onChange={setTournamentsA}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-muted-foreground">
                                                {t("compareB")}
                                            </Label>
                                            <TournamentMultiSelect
                                                tournaments={result.tournaments}
                                                selected={tournamentsB}
                                                onChange={setTournamentsB}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground">{t("tournament")}</Label>
                                        <TournamentMultiSelect
                                            tournaments={result.tournaments}
                                            selected={tournaments}
                                            onChange={setTournaments}
                                        />
                                    </div>
                                )}
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
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">
                                        {t("compareTitle")}
                                    </Label>
                                    <Button
                                        type="button"
                                        variant={compare ? "default" : "outline"}
                                        className="w-full"
                                        onClick={() => setCompare((v) => !v)}
                                    >
                                        {t("compareEnable")}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {compare ? (
                            <CompareTable rows={compareRows} />
                        ) : result.totalMatches === 0 ? (
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
                                                            <TableHead className="text-right">
                                                                {t("durationTitle")}
                                                            </TableHead>
                                                            <TableHead className="text-right">
                                                                {t("phaseTitle")}
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {rows.map((row) => (
                                                            <StatRow
                                                                key={`${row.heroId}|${row.lane}`}
                                                                row={row}
                                                                metaAvgSec={metaAvgSec}
                                                                phase={phaseInfoByHero.get(row.heroId) ?? null}
                                                            />
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                            <div className="grid gap-3 lg:hidden">
                                                {rows.map((row) => (
                                                    <StatCard
                                                        key={`${row.heroId}|${row.lane}`}
                                                        row={row}
                                                        metaAvgSec={metaAvgSec}
                                                        phase={phaseInfoByHero.get(row.heroId) ?? null}
                                                    />
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

                            <PairTable
                                className="mt-6"
                                title={t("duoLanesTitle")}
                                desc={t("duoLanesDesc")}
                                control={
                                    <Select value={duoPair} onValueChange={setDuoPair}>
                                        <SelectTrigger className="h-8 w-48 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LANE_PAIRS.map((p) => (
                                                <SelectItem key={p.value} value={p.value}>
                                                    {tLane(p.a)} × {tLane(p.b)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                }
                                rows={duoRows}
                                heroBySlug={heroBySlug}
                                separator="with"
                                minN={MIN_DUO_GAMES}
                            />
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
    desc,
    control,
    rows,
    heroBySlug,
    separator,
    minN = MIN_PAIR_GAMES,
    className,
}: {
    title: string
    /** Mô tả nhỏ dưới title (tuỳ chọn). */
    desc?: string
    /** Control phụ đặt cạnh title (vd select cặp lane). */
    control?: ReactNode
    rows: Array<PairRow>
    heroBySlug: Map<string, HeroManifest>
    separator: "with" | "vs"
    /** Ngưỡng mẫu tối thiểu để hiện trong thông báo empty. */
    minN?: number
    className?: string
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
        <Card className={className}>
            <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <CardTitle className="text-base">{title}</CardTitle>
                        {desc && (
                            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                        )}
                    </div>
                    {control}
                </div>
            </CardHeader>
            <CardContent>
                {rows.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        {t("pairEmpty", { min: minN })}
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

/** Phân bố phase pick đã format sẵn: text "40/35/25" + tooltip giải thích. */
interface PhaseInfo {
    /** Dạng "E/M/L" phần trăm. */
    text: string
    /** Tooltip title attr: `phaseEarly/phaseMid/phaseLate` kèm %. */
    title: string
}

/** Một dòng tướng + lane trong bảng thống kê. */
const StatRow = ({
    row,
    metaAvgSec,
    phase,
}: {
    row: MetaRow
    /** TB giây/ván của toàn meta (chuẩn gắn tag nhanh/chậm); 0 = chưa có data duration. */
    metaAvgSec: number
    /** Phân bố phase của hero; null khi tổng pick < ngưỡng. */
    phase: PhaseInfo | null
}) => {
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
            <TableCell className="text-right tabular-nums">
                {row.avgWinSec === null ? (
                    <span className="text-muted-foreground">—</span>
                ) : (
                    <div className="flex flex-col items-end">
                        <span>{formatSec(row.avgWinSec)}</span>
                        {metaAvgSec > 0 && Math.abs(row.avgWinSec - metaAvgSec) > 60 && (
                            <span className="text-xs text-muted-foreground">
                                {row.avgWinSec < metaAvgSec
                                    ? t("fasterThanMeta")
                                    : t("slowerThanMeta")}
                            </span>
                        )}
                    </div>
                )}
            </TableCell>
            <TableCell className="text-right">
                {phase ? (
                    <span
                        title={phase.title}
                        className="text-xs tabular-nums text-muted-foreground"
                    >
                        {phase.text}
                    </span>
                ) : (
                    <span className="text-muted-foreground">—</span>
                )}
            </TableCell>
        </TableRow>
    )
}

/** Một dòng tướng + lane dạng card cho mobile. */
const StatCard = ({
    row,
    metaAvgSec,
    phase,
}: {
    row: MetaRow
    /** TB giây/ván của toàn meta (chuẩn gắn tag nhanh/chậm); 0 = chưa có data duration. */
    metaAvgSec: number
    /** Phân bố phase của hero; null khi tổng pick < ngưỡng. */
    phase: PhaseInfo | null
}) => {
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
                <p className="mt-0.5 text-xs text-muted-foreground">
                    {t("durationTitle")}:{" "}
                    <span className="tabular-nums">
                        {row.avgWinSec === null ? "—" : formatSec(row.avgWinSec)}
                    </span>
                    {row.avgWinSec !== null &&
                        metaAvgSec > 0 &&
                        Math.abs(row.avgWinSec - metaAvgSec) > 60 && (
                            <span>
                                {" "}
                                (
                                {row.avgWinSec < metaAvgSec
                                    ? t("fasterThanMeta")
                                    : t("slowerThanMeta")}
                                )
                            </span>
                        )}
                    {" · "}
                    <span title={phase?.title}>
                        {t("phaseTitle")}:{" "}
                        <span className="tabular-nums">{phase?.text ?? "—"}</span>
                    </span>
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

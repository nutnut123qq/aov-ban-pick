"use client"
import { type ReactNode, useMemo, useState } from "react"
import Link from "next/link"
import { BarChart3, FilePlus2, Search } from "lucide-react"

import {
    aggregateMeta,
    LANE_LABELS,
    LANE_OPTIONS,
    useAovData,
    type MetaRow,
} from "@/modules/aov"
import type { Lane } from "@/modules/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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

/** Định dạng tỉ lệ 0..1 thành "62.5%". */
const pct = (value: number): string => `${(value * 100).toFixed(1)}%`

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
    const { data, error, isLoading } = useAovData()
    const [patchId, setPatchId] = useState<string>(ALL)
    const [tournament, setTournament] = useState<string>(ALL)
    const [lane, setLane] = useState<Lane | typeof ALL>(ALL)
    const [query, setQuery] = useState("")
    const [sort, setSort] = useState<{
        column: "picks" | "winRate" | "pickRate" | "banRate" | null
        direction: "asc" | "desc"
    }>({ column: null, direction: "desc" })

    const result = useMemo(() => {
        if (!data) return null
        return aggregateMeta(data.series, data.heroes, {
            patchId,
            lane: lane as Lane | "all",
            tournamentName: tournament,
        })
    }, [data, patchId, lane, tournament])

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
                        Thống kê Meta
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Tỉ lệ thắng / chọn / cấm theo patch và lane. WR là số thô từ dữ liệu
                        giải, kèm cỡ mẫu.
                    </p>
                </header>

                {isLoading && <LoadingState />}

                {error && (
                    <Card>
                        <CardContent className="py-8 text-center text-sm text-destructive">
                            Không tải được dữ liệu: {String(error.message ?? error)}
                        </CardContent>
                    </Card>
                )}

                {!isLoading && !error && result && (
                    <>
                        <Card className="mb-6">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Bộ lọc</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Patch</Label>
                                    <Select value={patchId} onValueChange={setPatchId}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={ALL}>Tất cả patch</SelectItem>
                                            {result.patches.map((p) => (
                                                <SelectItem key={p} value={p}>
                                                    {p}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Giải đấu</Label>
                                    <Select value={tournament} onValueChange={setTournament}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={ALL}>Tất cả giải</SelectItem>
                                            {result.tournaments.map((t) => (
                                                <SelectItem key={t} value={t}>
                                                    {t}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Tìm tướng</Label>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="Tên tướng…"
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {result.totalMatches === 0 ? (
                            <EmptyState />
                        ) : (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">
                                        {rows.length} dòng · {result.totalMatches} ván
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {rows.length === 0 ? (
                                        <p className="py-6 text-center text-sm text-muted-foreground">
                                            Không có tướng nào khớp bộ lọc.
                                        </p>
                                    ) : (
                                        <>
                                            <div className="hidden lg:block overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Tướng</TableHead>
                                                            <TableHead>
                                                                <div className="flex flex-col gap-1">
                                                                    <span>Vị trí</span>
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
                                                                                Tất cả
                                                                            </SelectItem>
                                                                            {LANE_OPTIONS.map((l) => (
                                                                                <SelectItem key={l.value} value={l.value}>
                                                                                    {l.label}
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
                                                                    Số trận{" "}
                                                                    {renderSortIcon(sort, "picks")}
                                                                </button>
                                                            </TableHead>
                                                            <TableHead className="text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleSort("winRate")}
                                                                    className="inline-flex items-center gap-1"
                                                                >
                                                                    Tỉ lệ thắng{" "}
                                                                    {renderSortIcon(sort, "winRate")}
                                                                </button>
                                                            </TableHead>
                                                            <TableHead className="text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleSort("pickRate")}
                                                                    className="inline-flex items-center gap-1"
                                                                >
                                                                    Tỉ lệ chọn{" "}
                                                                    {renderSortIcon(sort, "pickRate")}
                                                                </button>
                                                            </TableHead>
                                                            <TableHead className="text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleSort("banRate")}
                                                                    className="inline-flex items-center gap-1"
                                                                >
                                                                    Tỉ lệ cấm{" "}
                                                                    {renderSortIcon(sort, "banRate")}
                                                                </button>
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
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

/** Một dòng tướng + lane trong bảng thống kê. */
const StatRow = ({ row }: { row: MetaRow }) => {
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
                    <span className="font-medium">{row.heroName}</span>
                </div>
            </TableCell>
            <TableCell className="text-muted-foreground">{LANE_LABELS[row.lane]}</TableCell>
            <TableCell className="text-right tabular-nums">{row.picks}</TableCell>
            <TableCell className="text-right">
                <div className={cn("font-semibold tabular-nums", wrColor)}>{pct(row.winRate)}</div>
            </TableCell>
            <TableCell className="text-right tabular-nums">{pct(row.pickRate)}</TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
                {pct(row.banRate)}
            </TableCell>
        </TableRow>
    )
}

/** Một dòng tướng + lane dạng card cho mobile. */
const StatCard = ({ row }: { row: MetaRow }) => {
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
                    <span className="truncate font-medium">{row.heroName}</span>
                    <span className="text-xs text-muted-foreground">{LANE_LABELS[row.lane]}</span>
                </div>
                <div className="mt-1 grid grid-cols-3 gap-2 text-sm">
                    <div>
                        <p className="text-xs text-muted-foreground">Số trận</p>
                        <span className="tabular-nums">{row.picks}</span>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Tỉ lệ thắng</p>
                        <span className={cn("font-semibold tabular-nums", wrColor)}>{pct(row.winRate)}</span>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Chọn / Cấm</p>
                        <span className="tabular-nums">{pct(row.pickRate)} / {pct(row.banRate)}</span>
                    </div>
                </div>

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
const EmptyState = () => (
    <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <FilePlus2 className="h-10 w-10 text-muted-foreground" />
            <div>
                <p className="font-medium">Chưa có dữ liệu trận đấu</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Nhập vài ván rồi gộp vào <code className="text-xs">public/data/</code> để thấy thống kê.
                </p>
            </div>
            <Button asChild>
                <Link href="/draft-input">Đi nhập dữ liệu</Link>
            </Button>
        </CardContent>
    </Card>
)

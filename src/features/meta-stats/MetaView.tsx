"use client"
import { useMemo, useState } from "react"
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
import type { ConfidenceLevel } from "@/modules/utils/statistics"
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

/** Nhãn + màu cho mức tin cậy theo cỡ mẫu. */
const CONFIDENCE: Record<ConfidenceLevel, { label: string; dot: string; hint: string }> = {
    low: {
        label: "Cỡ mẫu nhỏ",
        dot: "bg-muted-foreground/40",
        hint: "n < 10 — số liệu chưa đáng tin, đừng dựa vào.",
    },
    medium: {
        label: "Vừa",
        dot: "bg-amber-500",
        hint: "10 ≤ n < 30 — tham khảo được, còn dao động.",
    },
    high: {
        label: "Tin cậy",
        dot: "bg-emerald-500",
        hint: "n ≥ 30 — cỡ mẫu đủ để tin tương đối.",
    },
}

/** Trang thống kê Meta: WR/PR/BR theo patch + lane, kèm cỡ mẫu và độ tin cậy. */
export const MetaView = () => {
    const { data, error, isLoading } = useAovData()
    const [patchId, setPatchId] = useState<string>(ALL)
    const [tournament, setTournament] = useState<string>(ALL)
    const [lane, setLane] = useState<Lane | typeof ALL>(ALL)
    const [query, setQuery] = useState("")

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
        const q = query.trim().toLowerCase()
        if (!q) return result.rows
        return result.rows.filter((r) => r.heroName.toLowerCase().includes(q))
    }, [result, query])

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="container mx-auto max-w-5xl px-4 py-8">
                <header className="mb-6">
                    <h1 className="flex items-center gap-2 text-2xl font-bold">
                        <BarChart3 className="h-6 w-6 text-primary" />
                        Thống kê Meta
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Tỉ lệ thắng (WR) / chọn (PR) / cấm (BR) theo patch và lane. WR đã làm
                        mượt Bayes; mọi số liệu kèm cỡ mẫu và khoảng tin cậy 95%.
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
                            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                                    <Label className="text-xs text-muted-foreground">Lane</Label>
                                    <Select
                                        value={lane}
                                        onValueChange={(v) => setLane(v as Lane | typeof ALL)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={ALL}>Tất cả lane</SelectItem>
                                            {LANE_OPTIONS.map((l) => (
                                                <SelectItem key={l.value} value={l.value}>
                                                    {l.label}
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
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <CardTitle className="text-base">
                                            {rows.length} dòng · {result.totalMatches} ván
                                        </CardTitle>
                                        <Legend />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {rows.length === 0 ? (
                                        <p className="py-6 text-center text-sm text-muted-foreground">
                                            Không có tướng nào khớp bộ lọc.
                                        </p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Tướng</TableHead>
                                                        <TableHead>Lane</TableHead>
                                                        <TableHead className="text-right">n</TableHead>
                                                        <TableHead className="text-right">WR (mượt)</TableHead>
                                                        <TableHead className="text-right">PR</TableHead>
                                                        <TableHead className="text-right">BR</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {rows.map((row) => (
                                                        <StatRow key={`${row.heroId}|${row.lane}`} row={row} />
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
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
    const conf = CONFIDENCE[row.confidence]
    // WR tô màu theo giá trị, NHƯNG nếu cỡ mẫu nhỏ thì làm xám để cảnh báo.
    const wrColor =
        row.confidence === "low"
            ? "text-muted-foreground"
            : row.winRate > 0.52
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
            <TableCell className="text-right">
                <span className="inline-flex items-center gap-1.5" title={conf.hint}>
                    <span className={cn("h-2 w-2 rounded-full", conf.dot)} />
                    {row.picks}
                </span>
            </TableCell>
            <TableCell className="text-right">
                <div className={cn("font-semibold tabular-nums", wrColor)}>{pct(row.winRate)}</div>
                <div className="text-xs text-muted-foreground tabular-nums" title="Khoảng tin cậy Wilson 95% trên WR thô">
                    {pct(row.ciLow)}–{pct(row.ciHigh)}
                </div>
            </TableCell>
            <TableCell className="text-right tabular-nums">{pct(row.pickRate)}</TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
                {pct(row.banRate)}
            </TableCell>
        </TableRow>
    )
}

/** Chú thích mã màu độ tin cậy. */
const Legend = () => (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {(Object.keys(CONFIDENCE) as Array<ConfidenceLevel>).map((level) => (
            <span key={level} className="inline-flex items-center gap-1.5" title={CONFIDENCE[level].hint}>
                <span className={cn("h-2 w-2 rounded-full", CONFIDENCE[level].dot)} />
                {CONFIDENCE[level].label}
            </span>
        ))}
    </div>
)

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

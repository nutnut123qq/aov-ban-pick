"use client"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"

import type { Lane } from "@/modules/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

/** Số liệu một bên (giải A hoặc B) trong bảng so sánh. */
export interface CompareSide {
    /** Số pick của (tướng, lane) trong bên đó. */
    n: number
    /** WR thô 0..1. */
    wr: number
}

/** Một dòng join giữa 2 bộ giải theo (heroId, lane). */
export interface CompareRow {
    /** Khoá join `${heroId}|${lane}`. */
    key: string
    /** `hero_id`. */
    heroId: string
    /** Tên hiển thị. */
    heroName: string
    /** File ảnh, hoặc null. */
    heroFile: string | null
    /** Lane của dòng này. */
    lane: Lane
    /** Số liệu bên A; null khi (tướng, lane) không xuất hiện ở A. */
    a: CompareSide | null
    /** Số liệu bên B; null khi (tướng, lane) không xuất hiện ở B. */
    b: CompareSide | null
    /** `wrA - wrB`; null khi một bên thiếu hoặc mẫu dưới ngưỡng tối thiểu. */
    delta: number | null
}

/** Định dạng tỉ lệ 0..1 thành "62.5%". */
const pct = (value: number): string => `${(value * 100).toFixed(1)}%`

/** Định dạng chênh lệch WR thành "+5.2%" / "-3.1%". */
const deltaText = (delta: number): string =>
    `${delta > 0 ? "+" : ""}${(delta * 100).toFixed(1)}%`

/**
 * Bảng so sánh meta giữa 2 bộ giải đấu (A vs B).
 * Dòng = (tướng, lane) xuất hiện ở ít nhất 1 bên; đã sort theo |delta| giảm dần.
 */
export const CompareTable = ({ rows }: { rows: Array<CompareRow> }) => {
    const t = useTranslations("meta")
    const tLane = useTranslations("lanes")
    const locale = useLocale()

    const sideCell = (side: CompareSide | null, field: "n" | "wr") => {
        if (!side) return <span className="text-muted-foreground">—</span>
        return field === "n" ? side.n : pct(side.wr)
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("compareTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
                {rows.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        {t("noMatch")}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t("hero")}</TableHead>
                                    <TableHead>{t("position")}</TableHead>
                                    <TableHead className="text-right">n A</TableHead>
                                    <TableHead className="text-right">WR A</TableHead>
                                    <TableHead className="text-right">n B</TableHead>
                                    <TableHead className="text-right">WR B</TableHead>
                                    <TableHead className="text-right">{t("delta")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.key}>
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
                                        <TableCell className="text-muted-foreground">
                                            {tLane(row.lane)}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {sideCell(row.a, "n")}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {sideCell(row.a, "wr")}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {sideCell(row.b, "n")}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {sideCell(row.b, "wr")}
                                        </TableCell>
                                        <TableCell
                                            className={cn(
                                                "text-right font-semibold tabular-nums",
                                                row.delta === null
                                                    ? "text-muted-foreground"
                                                    : row.delta > 0
                                                      ? "text-emerald-600 dark:text-emerald-400"
                                                      : row.delta < 0
                                                        ? "text-rose-600 dark:text-rose-400"
                                                        : "text-foreground",
                                            )}
                                        >
                                            {row.delta === null ? "—" : deltaText(row.delta)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

"use client"
import { useTranslations } from "next-intl"
import { Scale } from "lucide-react"

import type { CompScore } from "@/modules/aov"
import type { HeroManifest } from "@/modules/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DraftScoreCardProps {
    /** Kết quả scoreDraft; null = chưa đủ dữ liệu trận để chấm. */
    score: CompScore | null
    /** Map slug → hero để hiện tên tướng ở kèo theo lane. */
    heroBySlug?: Map<string, HeroManifest>
}

interface EdgeRow {
    /** Key i18n trong `draft.score`. */
    key: "lane" | "synergy" | "matchup"
    /** Edge −1..1 (dương = lợi Xanh). */
    value: number
}

/** Định dạng edge −1..1 thành ±%. */
const formatEdge = (e: number): string =>
    `${e > 0 ? "+" : ""}${Math.round(e * 100)}%`

/** Card chấm điểm đội hình đang draft: bar 2 chiều Xanh/Đỏ + breakdown 3 tín hiệu. */
export const DraftScoreCard = ({ score, heroBySlug }: DraftScoreCardProps) => {
    const t = useTranslations("draft.score")
    const tCommon = useTranslations("common")
    const tLane = useTranslations("lanes")

    /** Tên hiển thị của hero; null khi chưa pick → không render. */
    const heroName = (id: string | null): string | null =>
        id ? (heroBySlug?.get(id)?.name ?? id) : null

    const probPct = score ? Math.round(score.probBlue * 100) : 50
    const favored = probPct >= 50 ? "blueFavored" : "redFavored"
    const favoredProb = probPct >= 50 ? probPct : 100 - probPct

    const rows: Array<EdgeRow> = score
        ? [
              { key: "lane", value: score.laneEdge },
              { key: "synergy", value: score.synergyEdge },
              { key: "matchup", value: score.matchupEdge },
          ]
        : []

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Scale className="h-5 w-5 text-primary" />
                    {t("title")}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {!score ? (
                    <p className="py-2 text-center text-sm text-muted-foreground">
                        {t("notEnough")}
                    </p>
                ) : (
                    <>
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-medium">
                                <span className="text-blue-600 dark:text-blue-400">
                                    {tCommon("blue")}
                                </span>
                                <span className="text-rose-600 dark:text-rose-400">
                                    {tCommon("red")}
                                </span>
                            </div>
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-rose-500/40">
                                <div
                                    className="h-full rounded-full bg-blue-500 transition-all"
                                    style={{ width: `${probPct}%` }}
                                />
                            </div>
                            <p className="text-center text-sm font-semibold">
                                {t(favored, { prob: favoredProb })}
                            </p>
                        </div>
                        <div className="space-y-1 border-t pt-2">
                            {rows.map((r) => (
                                <div
                                    key={r.key}
                                    className="flex items-center justify-between text-xs"
                                >
                                    <span className="text-muted-foreground">{t(r.key)}</span>
                                    <span
                                        className={cn(
                                            "font-medium tabular-nums",
                                            r.value > 0.005
                                                ? "text-blue-600 dark:text-blue-400"
                                                : r.value < -0.005
                                                  ? "text-rose-600 dark:text-rose-400"
                                                  : "text-muted-foreground",
                                        )}
                                    >
                                        {formatEdge(r.value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {score.laneEdges.length > 0 && (
                            <div className="space-y-1.5 border-t pt-2">
                                <p className="text-xs font-medium text-muted-foreground">
                                    {t("perLane")}
                                </p>
                                {score.laneEdges.map((le) => (
                                    <div
                                        key={le.lane}
                                        className="flex items-center gap-1.5 text-xs"
                                    >
                                        <span className="w-12 shrink-0 text-muted-foreground">
                                            {tLane(le.lane)}
                                        </span>
                                        <span className="w-14 shrink-0 truncate text-right text-blue-600 dark:text-blue-400">
                                            {heroName(le.blueHero)}
                                        </span>
                                        <div className="h-1.5 min-w-6 flex-1 overflow-hidden rounded-full bg-rose-500/40">
                                            <div
                                                className="h-full rounded-full bg-blue-500 transition-all"
                                                style={{
                                                    width: `${Math.max(0, Math.min(100, 50 + le.edge * 50))}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="w-14 shrink-0 truncate text-rose-600 dark:text-rose-400">
                                            {heroName(le.redHero)}
                                        </span>
                                        <span
                                            className={cn(
                                                "w-9 shrink-0 text-right font-medium tabular-nums",
                                                le.n < 5
                                                    ? "text-muted-foreground"
                                                    : le.edge > 0.005
                                                      ? "text-blue-600 dark:text-blue-400"
                                                      : le.edge < -0.005
                                                        ? "text-rose-600 dark:text-rose-400"
                                                        : "text-muted-foreground",
                                            )}
                                        >
                                            {le.n < 5 ? "—" : formatEdge(le.edge)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}

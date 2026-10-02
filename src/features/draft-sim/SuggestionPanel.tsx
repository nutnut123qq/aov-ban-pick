"use client"
import { useTranslations } from "next-intl"
import { Lightbulb } from "lucide-react"

import type { Suggestion } from "@/modules/aov"
import type { Lane } from "@/modules/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { groupTournamentsByRegion } from "@/modules/aov/leagues"

const ALL = "all"

interface SuggestionPanelProps {
    /** Nhãn lượt hiện tại (vd "Bên Xanh · CẤM"); null nếu đã xong draft. */
    turnLabel: string | null
    /** Danh sách gợi ý đã xếp hạng. */
    suggestions: Array<Suggestion>
    /** Đã có dữ liệu trận hay chưa (để phân biệt "hết ứng viên" vs "chưa có data"). */
    hasData: boolean
    /** Giải đấu đang lọc ("all" = mọi giải). */
    tournamentName: string
    /** Mọi giải đấu có trong dữ liệu (dựng dropdown). */
    tournamentOptions: Array<string>
    /** Số ván sau khi lọc (cỡ mẫu đang cộng gợi ý). */
    matchCount: number
    /** Người dùng chọn áp dụng một gợi ý. */
    onApply: (heroId: string, lane?: Lane) => void
    /** Đổi bộ lọc giải đấu. */
    onTournamentNameChange: (v: string) => void
}

/** Panel gợi ý real-time cho lượt cấm/chọn đang tới, lọc được theo patch/giải. */
export const SuggestionPanel = ({
    turnLabel,
    suggestions,
    hasData,
    tournamentName,
    tournamentOptions,
    matchCount,
    onApply,
    onTournamentNameChange,
}: SuggestionPanelProps) => {
    const t = useTranslations("draft.suggestions")
    const tMeta = useTranslations("meta")
    const tRegions = useTranslations("regions")

    return (
        <Card className="lg:sticky lg:top-4">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    {t("title")}
                </CardTitle>
                {turnLabel && <p className="text-xs text-muted-foreground">{turnLabel}</p>}
            </CardHeader>
            <CardContent className="space-y-2">
                {hasData && (
                    <div className="space-y-1.5 border-b pb-3">
                        <p className="text-xs font-medium text-muted-foreground">
                            {t("source", { count: matchCount })}
                        </p>
                        <Select value={tournamentName} onValueChange={onTournamentNameChange}>
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder={tMeta("tournament")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>{tMeta("allTournaments")}</SelectItem>
                                {groupTournamentsByRegion(tournamentOptions).map((g) => (
                                    <SelectGroup key={g.region}>
                                        <SelectLabel>{tRegions(g.region)}</SelectLabel>
                                        {g.tournaments.map((v) => (
                                            <SelectItem key={v} value={v}>
                                                {v}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                {!turnLabel ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        {t("noData")}
                    </p>
                ) : suggestions.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        {t("noData")}
                    </p>
                ) : (
                    suggestions.map((s) => (
                        <button
                            key={`${s.heroId}|${s.lane ?? ""}`}
                            type="button"
                            onClick={() => onApply(s.heroId, s.lane)}
                            className="flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors hover:border-primary hover:bg-muted/50"
                        >
                            {s.heroFile ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={`/images/heroes/${s.heroFile}`}
                                    alt={s.heroName}
                                    className="h-10 w-10 shrink-0 rounded object-cover"
                                />
                            ) : (
                                <div className="h-10 w-10 shrink-0 rounded bg-muted" />
                            )}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="truncate font-medium">{s.heroName}</span>
                                </div>
                                <p className="truncate text-xs text-muted-foreground">{s.reason}</p>
                            </div>
                        </button>
                    ))
                )}
            </CardContent>
        </Card>
    )
}

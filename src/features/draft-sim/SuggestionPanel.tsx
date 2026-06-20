"use client"
import { Lightbulb } from "lucide-react"

import type { Suggestion } from "@/modules/aov"
import type { Lane } from "@/modules/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SuggestionPanelProps {
    /** Nhãn lượt hiện tại (vd "Bên Xanh · CẤM"); null nếu đã xong draft. */
    turnLabel: string | null
    /** Danh sách gợi ý đã xếp hạng. */
    suggestions: Array<Suggestion>
    /** Đã có dữ liệu trận hay chưa (để phân biệt "hết ứng viên" vs "chưa có data"). */
    hasData: boolean
    /** Người dùng chọn áp dụng một gợi ý. */
    onApply: (heroId: string, lane?: Lane) => void
}

/** Panel gợi ý real-time cho lượt cấm/chọn đang tới. */
export const SuggestionPanel = ({
    turnLabel,
    suggestions,
    hasData,
    onApply,
}: SuggestionPanelProps) => (
    <Card className="lg:sticky lg:top-4">
        <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="h-5 w-5 text-primary" />
                Gợi ý
            </CardTitle>
            {turnLabel && <p className="text-xs text-muted-foreground">{turnLabel}</p>}
        </CardHeader>
        <CardContent className="space-y-2">
            {!turnLabel ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                    Đã đủ 8 cấm + 10 chọn — draft hoàn tất.
                </p>
            ) : suggestions.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                    {hasData
                        ? "Không còn ứng viên phù hợp với dữ liệu hiện có."
                        : "Chưa đủ dữ liệu trận — thêm vài ván để có gợi ý theo số liệu."}
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

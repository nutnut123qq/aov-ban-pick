import { useId, type Ref } from "react"
import { useTranslations } from "next-intl"
import { Undo } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { TeamSide } from "@/modules/types"
import { cn } from "@/lib/utils"

interface TurnBannerProps {
    /** Nhãn lượt hiện tại (vd "Bên Xanh · CẤM"); null khi đã đủ mọi bước. */
    turnLabel: string | null
    /** Bên đang thao tác; null khi draft đã xong. */
    side: TeamSide | null
    /** Số thứ tự bước đang thao tác (1-based). */
    stepNumber: number
    /** Số ô đã có tướng. */
    filledCount: number
    /** Tổng số bước của một ván. */
    total: number
    /** Mở picker cho bước hiện tại. */
    onPick: () => void
    /** Hoàn tác lượt gần nhất. */
    onUndo: () => void
    /** Vùng banner — đích focus khi picker đóng mà nút "Chọn tướng" đã biến mất (lượt cuối). */
    ref?: Ref<HTMLElement>
}

/** Thanh lượt hiện tại: bên + hành động, tiến độ và thao tác chính đặt sát nhau. */
export const TurnBanner = ({
    turnLabel,
    side,
    stepNumber,
    filledCount,
    total,
    onPick,
    onUndo,
    ref,
}: TurnBannerProps) => {
    const t = useTranslations("draft")
    const labelId = useId()
    const progressText = t("stepProgress", { current: stepNumber, total })

    return (
        <section
            ref={ref}
            data-turn-banner
            tabIndex={-1}
            aria-labelledby={labelId}
            className={cn(
                "mb-4 flex flex-col gap-3 rounded-xl border bg-card p-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:flex-row sm:items-center sm:gap-4 sm:p-4",
                side === "blue" && "border-blue-500/50 bg-blue-500/5",
                side === "red" && "border-rose-500/50 bg-rose-500/5",
            )}
        >
            <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p
                        id={labelId}
                        aria-live="polite"
                        className={cn(
                            "font-semibold",
                            side === "blue" && "text-blue-600 dark:text-blue-400",
                            side === "red" && "text-rose-600 dark:text-rose-400",
                        )}
                    >
                        {turnLabel ?? t("draftComplete")}
                    </p>
                    <span className="text-sm tabular-nums text-muted-foreground">
                        {progressText}
                    </span>
                </div>
                <Progress
                    value={Math.round((filledCount / total) * 100)}
                    aria-label={progressText}
                    className="h-1.5"
                />
            </div>
            <div className="flex gap-2">
                {turnLabel && (
                    <Button onClick={onPick} className="h-12 flex-1 px-5 text-sm sm:h-10 sm:flex-none">
                        {t("chooseHero")}
                    </Button>
                )}
                <Button
                    variant="outline"
                    onClick={onUndo}
                    disabled={filledCount === 0}
                    className="h-12 gap-2 px-4 sm:h-10"
                >
                    <Undo className="h-4 w-4" />
                    {t("undo")}
                </Button>
            </div>
        </section>
    )
}

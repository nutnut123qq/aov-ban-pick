import { useTranslations } from "next-intl"
import { X } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { LANE_OPTIONS } from "@/modules/aov"
import type { HeroManifest, Lane, TeamSide } from "@/modules/types"
import type { DraftStep } from "@/features/draft-input/types"
import { cn } from "@/lib/utils"
import type { FilledStep } from "../hooks/useDraftEngine"

interface SideColumnProps {
    side: TeamSide
    steps: ReadonlyArray<DraftStep>
    filled: Array<FilledStep>
    activeIndex: number
    heroBySlug: Map<string, HeroManifest>
    onSlotClick: (index: number) => void
    onLane: (index: number, lane: Lane) => void
    onClear: (index: number) => void
}

interface SlotButtonProps {
    step: DraftStep
    hero: HeroManifest | undefined
    isActive: boolean
    isFuture: boolean
    /** Nhãn hành động cho tên truy cập (vd "CẤM", "CHỌN 3"). */
    label: string
    onClick: () => void
}

/** Ô chọn tướng của một bước: ảnh + tên, hoặc "—" / "Lượt này"; bước tương lai bị khoá. */
const SlotButton = ({ step, hero, isActive, isFuture, label, onClick }: SlotButtonProps) => {
    const t = useTranslations("draft")
    const text = hero ? hero.name : isActive ? t("currentTurn") : "—"
    return (
        <button
            type="button"
            disabled={isFuture}
            onClick={onClick}
            aria-label={`${label}: ${text}`}
            aria-current={isActive ? "step" : undefined}
            className={cn(
                "flex min-h-11 min-w-0 flex-1 items-center gap-1.5 rounded-md border px-2 py-1 text-left text-sm leading-tight transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:min-h-10",
                isFuture ? "cursor-not-allowed opacity-40" : "hover:border-primary",
                isActive && "border-primary bg-primary/5 ring-2 ring-primary",
                !hero && "text-muted-foreground",
                step.action === "ban" && hero && "opacity-70 grayscale",
            )}
        >
            {hero && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={`/images/heroes/${hero.file}`}
                    alt=""
                    className="h-7 w-7 shrink-0 rounded object-cover"
                />
            )}
            <span className="min-w-0 break-words">{text}</span>
        </button>
    )
}

export const SideColumn = ({
    side,
    steps,
    filled,
    activeIndex,
    heroBySlug,
    onSlotClick,
    onLane,
    onClear,
}: SideColumnProps) => {
    const t = useTranslations("draft")
    const tLane = useTranslations("lanes")

    const slot = (step: DraftStep) => {
        const f = filled[step.index]
        return {
            f,
            hero: f?.heroId ? heroBySlug.get(f.heroId) : undefined,
            isActive: step.index === activeIndex,
            isFuture: activeIndex >= 0 && step.index > activeIndex,
        }
    }

    const clearButton = (index: number) => (
        <button
            type="button"
            aria-label={t("clearSelection")}
            title={t("clearSelection")}
            onClick={() => onClear(index)}
            className="flex h-11 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-destructive/10 hover:text-destructive focus-visible:ring-3 focus-visible:ring-ring/50 sm:h-10"
        >
            <X className="h-4 w-4" />
        </button>
    )

    return (
        <Card>
            <CardHeader className="pb-1">
                <CardTitle
                    className={cn(
                        "text-base",
                        side === "blue" ? "text-blue-600 dark:text-blue-400" : "text-rose-600 dark:text-rose-400",
                    )}
                >
                    {side === "blue" ? t("blueTeam") : t("redTeam")}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Cấm: lưới 2×2 theo thứ tự DRAFT_SEQUENCE — hàng 1 lượt cấm 1, hàng 2 lượt cấm 2. */}
                <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground">{t("ban")}</p>
                    <div className="grid grid-cols-2 gap-1.5">
                        {steps
                            .filter((s) => s.action === "ban")
                            .map((step) => {
                                const { hero, isActive, isFuture } = slot(step)
                                return (
                                    <div key={step.index} className="flex min-w-0 items-center gap-1">
                                        <SlotButton
                                            step={step}
                                            hero={hero}
                                            isActive={isActive}
                                            isFuture={isFuture}
                                            label={t("ban")}
                                            onClick={() => onSlotClick(step.index)}
                                        />
                                        {hero && clearButton(step.index)}
                                    </div>
                                )
                            })}
                    </div>
                </div>

                <div className="space-y-1.5">
                    {steps
                        .filter((s) => s.action === "pick")
                        .map((step) => {
                            const { f, hero, isActive, isFuture } = slot(step)
                            const label = t("pick", { number: step.pickIndex ?? 0 })
                            return (
                                <div key={step.index} className="flex items-center gap-1.5">
                                    <span className="w-14 shrink-0 whitespace-nowrap text-xs font-semibold text-muted-foreground">
                                        {label}
                                    </span>
                                    <SlotButton
                                        step={step}
                                        hero={hero}
                                        isActive={isActive}
                                        isFuture={isFuture}
                                        label={label}
                                        onClick={() => onSlotClick(step.index)}
                                    />
                                    {hero && clearButton(step.index)}
                                    <Select
                                        value={f?.lane ?? ""}
                                        onValueChange={(v) => onLane(step.index, v as Lane)}
                                    >
                                        <SelectTrigger
                                            aria-label={`${t("lane")} · ${label}`}
                                            className="w-24 shrink-0 whitespace-normal text-left text-xs data-[size=default]:h-auto data-[size=default]:min-h-11 *:data-[slot=select-value]:line-clamp-2 sm:data-[size=default]:min-h-10 lg:w-32"
                                        >
                                            <SelectValue placeholder={t("lane")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LANE_OPTIONS.map((l) => (
                                                <SelectItem key={l.value} value={l.value}>
                                                    {tLane(l.value)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )
                        })}
                </div>
            </CardContent>
        </Card>
    )
}

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

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle
                    className={cn(
                        "text-base",
                        side === "blue" ? "text-blue-600 dark:text-blue-400" : "text-rose-600 dark:text-rose-400",
                    )}
                >
                    {side === "blue" ? t("blueTeam") : t("redTeam")}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {steps.map((step) => {
                    const slot = filled[step.index]
                    const hero = slot?.heroId ? heroBySlug.get(slot.heroId) : undefined
                    const isActive = step.index === activeIndex
                    const isFuture = activeIndex >= 0 && step.index > activeIndex

                    const actionLabel =
                        step.action === "ban"
                            ? t("ban")
                            : t("pick", { number: step.pickIndex ?? 0 })

                    return (
                        <div
                            key={step.index}
                            className={cn(
                                "flex flex-wrap items-center gap-2 rounded-lg border p-2",
                                isActive && "ring-2 ring-primary",
                                step.action === "ban" && "bg-muted/30",
                            )}
                        >
                            <span className="w-12 shrink-0 text-xs font-semibold text-muted-foreground sm:w-14">
                                {actionLabel}
                            </span>
                            <button
                                type="button"
                                disabled={isFuture}
                                onClick={() => onSlotClick(step.index)}
                                className={cn(
                                    "flex min-w-0 flex-1 items-center gap-2 rounded-md border px-2 py-2 text-left text-sm transition-colors",
                                    isFuture
                                        ? "cursor-not-allowed opacity-40"
                                        : "hover:border-primary",
                                    !hero && "text-muted-foreground",
                                    step.action === "ban" && hero && "opacity-70 grayscale",
                                )}
                            >
                                {hero ? (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={`/images/heroes/${hero.file}`}
                                            alt={hero.name}
                                            className="h-8 w-8 rounded object-cover"
                                        />
                                        <span className="truncate">{hero.name}</span>
                                    </>
                                ) : (
                                    <span>{isActive ? t("currentTurn") : "—"}</span>
                                )}
                            </button>

                            {hero && (
                                <button
                                    type="button"
                                    aria-label={t("clearSelection")}
                                    title={t("clearSelection")}
                                    onClick={() => onClear(step.index)}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}

                            {step.action === "pick" && (
                                <div className="w-full shrink-0 sm:w-24 lg:w-28">
                                    <Select
                                        value={slot?.lane ?? ""}
                                        onValueChange={(v) => onLane(step.index, v as Lane)}
                                    >
                                        <SelectTrigger className="h-9 text-xs">
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
                            )}
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}

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
import { cn } from "@/lib/utils"
import { DRAFT_PHASES, DRAFT_SEQUENCE, LANES } from "../sequence"
import type { FilledStep, HeroManifestEntry, Lane } from "../types"

interface DraftTimelineProps {
    filled: Array<FilledStep>
    heroBySlug: Map<string, HeroManifestEntry>
    heroesError: boolean
    onOpenPicker: (index: number) => void
    onClearStep: (index: number) => void
    onSetLane: (index: number, lane: Lane) => void
}

export const DraftTimeline = ({
    filled,
    heroBySlug,
    heroesError,
    onOpenPicker,
    onClearStep,
    onSetLane,
}: DraftTimelineProps) => {
    const t = useTranslations("draftInput")
    const tCommon = useTranslations("common")
    const tLane = useTranslations("lanes")

    return (
        <Card className="mb-6">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("sequenceTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                {heroesError && (
                    <p className="text-sm text-destructive">
                        {t("manifestError")}
                    </p>
                )}
                {DRAFT_PHASES.map((phase) => (
                    <div key={phase}>
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {phase}
                        </h3>
                        <div className="space-y-2">
                            {DRAFT_SEQUENCE.filter((s) => s.phase === phase).map((step) => {
                                const slot = filled[step.index]
                                const hero = slot.heroId
                                    ? heroBySlug.get(slot.heroId)
                                    : undefined

                                const actionLabel =
                                    step.action === "ban"
                                        ? t("ban")
                                        : t("pick", { number: step.pickIndex ?? 0 })
                                const sideLabel =
                                    step.side === "blue" ? tCommon("blue") : tCommon("red")

                                return (
                                    <div
                                        key={step.index}
                                        className={cn(
                                            "flex flex-wrap items-center gap-2 rounded-lg border p-2 sm:gap-3",
                                            step.side === "blue"
                                                ? "border-l-4 border-l-blue-500"
                                                : "border-l-4 border-l-red-500",
                                        )}
                                    >
                                        <div className="w-14 shrink-0 text-xs sm:w-16">
                                            <div className="font-semibold">{actionLabel}</div>
                                            <div className="text-muted-foreground">{sideLabel}</div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => onOpenPicker(step.index)}
                                            className={cn(
                                                "flex min-w-0 flex-1 items-center gap-2 rounded-md border px-2 py-2 text-left text-sm transition-colors hover:border-primary",
                                                !hero && "text-muted-foreground",
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
                                                <span>{t("chooseHero")}</span>
                                            )}
                                        </button>

                                        {hero && (
                                            <button
                                                type="button"
                                                aria-label={t("clearSelection")}
                                                title={t("clearSelection")}
                                                onClick={() => onClearStep(step.index)}
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}

                                        {step.action === "pick" && (
                                            <div className="w-full shrink-0 sm:w-44">
                                                <Select
                                                    value={slot.lane || undefined}
                                                    onValueChange={(v) =>
                                                        onSetLane(step.index, v as Lane)
                                                    }
                                                >
                                                    <SelectTrigger className="h-9">
                                                        <SelectValue placeholder="Lane" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {LANES.map((l) => (
                                                            <SelectItem
                                                                key={l.value}
                                                                value={l.value}
                                                            >
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
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

"use client"
import { useMemo, useState } from "react"
import { RotateCcw, Swords } from "lucide-react"

import { HeroPickerDialog } from "@/features/draft-input/HeroPickerDialog"
import { DRAFT_SEQUENCE } from "@/features/draft-input/sequence"
import type { DraftStep } from "@/features/draft-input/types"
import { LANE_OPTIONS, suggestStep, useAovData, type AssistContext } from "@/modules/aov"
import type { Lane, TeamSide } from "@/modules/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import { SuggestionPanel } from "./SuggestionPanel"

/** Giá trị người dùng điền cho từng bước (hero + lane). */
interface FilledStep {
    heroId: string | null
    lane: Lane | null
}

const ALL_LANES: Array<Lane> = ["ta_than", "rung", "giua", "rong_xa", "rong_ho_tro"]
const EMPTY: FilledStep = { heroId: null, lane: null }
const BLUE_STEPS = DRAFT_SEQUENCE.filter((s) => s.side === "blue")
const RED_STEPS = DRAFT_SEQUENCE.filter((s) => s.side === "red")

/** Trang mô phỏng cấm/chọn tương tác + gợi ý real-time mỗi lượt. */
export const DraftSimView = () => {
    const { data, isLoading } = useAovData()
    const [filled, setFilled] = useState<Array<FilledStep>>(() =>
        DRAFT_SEQUENCE.map(() => ({ ...EMPTY })),
    )
    const [pickerIndex, setPickerIndex] = useState<number | null>(null)

    // Lượt đang tới = bước chưa chọn tướng đầu tiên theo trình tự.
    const activeIndex = useMemo(
        () => DRAFT_SEQUENCE.findIndex((s) => !filled[s.index]?.heroId),
        [filled],
    )
    const activeStep: DraftStep | null =
        activeIndex >= 0 ? DRAFT_SEQUENCE[activeIndex] : null

    const usedHeroIds = useMemo(
        () =>
            new Set(
                filled
                    .filter((_, i) => i !== pickerIndex)
                    .map((f) => f.heroId)
                    .filter(Boolean) as Array<string>,
            ),
        [filled, pickerIndex],
    )

    // Ngữ cảnh cho engine gợi ý, suy từ trạng thái bàn cờ.
    const ctx: AssistContext | null = useMemo(() => {
        if (!activeStep) return null
        const mySide = activeStep.side

        const myLanes = new Set<Lane>()
        const enemyRevealed: Array<{ heroId: string; lane: Lane }> = []
        for (const step of DRAFT_SEQUENCE) {
            const f = filled[step.index]
            if (step.action !== "pick" || !f?.heroId || !f.lane) continue
            if (step.side === mySide) myLanes.add(f.lane)
            else enemyRevealed.push({ heroId: f.heroId, lane: f.lane })
        }

        return {
            action: activeStep.action,
            side: mySide,
            used: new Set(filled.map((f) => f.heroId).filter(Boolean) as Array<string>),
            lanesNeeded: ALL_LANES.filter((l) => !myLanes.has(l)),
            enemyRevealed,
        }
    }, [activeStep, filled])

    const suggestions = useMemo(() => {
        if (!ctx || !data) return []
        return suggestStep(ctx, data.series, data.heroes)
    }, [ctx, data])

    const heroBySlug = useMemo(
        () => new Map((data?.heroes ?? []).map((h) => [h.slug, h])),
        [data],
    )

    const setStep = (index: number, patch: Partial<FilledStep>) =>
        setFilled((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)))

    const reset = () => {
        setFilled(DRAFT_SEQUENCE.map(() => ({ ...EMPTY })))
        setPickerIndex(null)
    }

    // Áp dụng gợi ý vào đúng lượt đang tới.
    const applySuggestion = (heroId: string, lane?: Lane) => {
        if (activeIndex < 0) return
        setStep(activeIndex, { heroId, lane: lane ?? filled[activeIndex]?.lane ?? null })
    }

    const turnLabel = activeStep
        ? `Bên ${activeStep.side === "blue" ? "Xanh" : "Đỏ"} · ${
              activeStep.action === "ban" ? "CẤM" : `CHỌN ${activeStep.pickIndex}`
          }`
        : null

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="container mx-auto max-w-6xl px-4 py-8">
                <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold">
                            <Swords className="h-6 w-6 text-primary" />
                            Mô phỏng Draft
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Dựng lại cấm/chọn theo thể thức ĐTDV; mỗi lượt nhận gợi ý dựa trên
                            thống kê đã có.
                        </p>
                    </div>
                    <Button variant="outline" onClick={reset} className="gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Làm lại
                    </Button>
                </header>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_20rem_1fr]">
                    <SideColumn
                        side="blue"
                        steps={BLUE_STEPS}
                        filled={filled}
                        activeIndex={activeIndex}
                        heroBySlug={heroBySlug}
                        onSlotClick={setPickerIndex}
                        onLane={(i, lane) => setStep(i, { lane })}
                    />

                    <SuggestionPanel
                        turnLabel={turnLabel}
                        suggestions={suggestions}
                        hasData={!isLoading && (data?.series.length ?? 0) > 0}
                        onApply={applySuggestion}
                    />

                    <SideColumn
                        side="red"
                        steps={RED_STEPS}
                        filled={filled}
                        activeIndex={activeIndex}
                        heroBySlug={heroBySlug}
                        onSlotClick={setPickerIndex}
                        onLane={(i, lane) => setStep(i, { lane })}
                    />
                </div>
            </div>

            <HeroPickerDialog
                open={pickerIndex !== null}
                onOpenChange={(open) => {
                    if (!open) setPickerIndex(null)
                }}
                heroes={data?.heroes ?? []}
                usedHeroIds={usedHeroIds}
                onSelect={(heroId) => {
                    if (pickerIndex !== null) setStep(pickerIndex, { heroId })
                }}
            />
        </div>
    )
}

interface SideColumnProps {
    side: TeamSide
    steps: ReadonlyArray<DraftStep>
    filled: Array<FilledStep>
    activeIndex: number
    heroBySlug: Map<string, { name: string; file: string }>
    onSlotClick: (index: number) => void
    onLane: (index: number, lane: Lane) => void
}

/** Một cột (Xanh/Đỏ) liệt kê các lượt cấm/chọn của bên đó theo thứ tự. */
const SideColumn = ({
    side,
    steps,
    filled,
    activeIndex,
    heroBySlug,
    onSlotClick,
    onLane,
}: SideColumnProps) => (
    <Card>
        <CardHeader className="pb-3">
            <CardTitle
                className={cn(
                    "text-base",
                    side === "blue" ? "text-blue-600 dark:text-blue-400" : "text-rose-600 dark:text-rose-400",
                )}
            >
                {side === "blue" ? "Đội Xanh" : "Đội Đỏ"}
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
            {steps.map((step) => {
                const slot = filled[step.index]
                const hero = slot?.heroId ? heroBySlug.get(slot.heroId) : undefined
                const isActive = step.index === activeIndex
                const isFuture = activeIndex >= 0 && step.index > activeIndex
                return (
                    <div
                        key={step.index}
                        className={cn(
                            "flex items-center gap-2 rounded-lg border p-2",
                            isActive && "ring-2 ring-primary",
                            step.action === "ban" && "bg-muted/30",
                        )}
                    >
                        <span className="w-14 shrink-0 text-xs font-semibold text-muted-foreground">
                            {step.action === "ban" ? "CẤM" : `CHỌN ${step.pickIndex}`}
                        </span>
                        <button
                            type="button"
                            disabled={isFuture}
                            onClick={() => onSlotClick(step.index)}
                            className={cn(
                                "flex flex-1 items-center gap-2 rounded-md border px-2 py-1.5 text-left text-sm transition-colors",
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
                                        className="h-7 w-7 rounded object-cover"
                                    />
                                    <span className="truncate">{hero.name}</span>
                                </>
                            ) : (
                                <span>{isActive ? "→ Lượt này" : "—"}</span>
                            )}
                        </button>

                        {step.action === "pick" && (
                            <div className="w-28 shrink-0">
                                <Select
                                    value={slot?.lane || undefined}
                                    onValueChange={(v) => onLane(step.index, v as Lane)}
                                >
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Lane" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LANE_OPTIONS.map((l) => (
                                            <SelectItem key={l.value} value={l.value}>
                                                {l.label}
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

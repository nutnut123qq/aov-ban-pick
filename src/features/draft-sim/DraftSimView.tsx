"use client"
import { useTranslations } from "next-intl"
import { Swords } from "lucide-react"

import { HeroPicker } from "@/features/draft-input/HeroPicker"
import { DRAFT_SEQUENCE } from "@/features/draft-input/sequence"
import { DraftControls } from "./components/DraftControls"
import { GlobalBanSection } from "./components/GlobalBanSection"
import { SideColumn } from "./components/SideColumn"
import { SuggestionPanel } from "./SuggestionPanel"
import { useDraftEngine } from "./hooks/useDraftEngine"

const BLUE_STEPS = DRAFT_SEQUENCE.filter((s) => s.side === "blue")
const RED_STEPS = DRAFT_SEQUENCE.filter((s) => s.side === "red")

/** Trang mô phỏng cấm/chọn tương tác + gợi ý real-time mỗi lượt. */
export const DraftSimView = () => {
    const t = useTranslations("draft")
    const tCommon = useTranslations("common")

    const {
        data,
        isLoading,
        filled,
        vanNumber,
        activeIndex,
        activeStep,
        pickerIndex,
        globalBanPicker,
        globalBansBlue,
        globalBansRed,
        currentUsedHeroIds,
        globalBanPickerUsedIds,
        pickerDisabledIds,
        suggestions,
        tournamentNames,
        tournamentOptions,
        filteredSeries,
        heroBySlug,
        setStep,
        clearStep,
        undoLast,
        reset,
        handleVanChange,
        setGlobalBan,
        clearGlobalBan,
        applySuggestion,
        setPickerIndex,
        setGlobalBanPicker,
        setTournamentNames,
    } = useDraftEngine()

    const turnLabel = activeStep
        ? t("turnLabel", {
              side: activeStep.side === "blue" ? tCommon("blue") : tCommon("red"),
              action:
                  activeStep.action === "ban"
                      ? t("ban")
                      : t("pick", { number: activeStep.pickIndex ?? 0 }),
          })
        : null


    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="container mx-auto max-w-6xl px-4 py-8">
                <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold">
                            <Swords className="h-6 w-6 text-primary" />
                            {t("title")}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t("subtitle")}
                        </p>
                    </div>
                    <DraftControls
                        vanNumber={vanNumber}
                        onVanChange={handleVanChange}
                        onUndo={undoLast}
                        onReset={reset}
                    />
                </header>

                {vanNumber > 1 && (
                    <GlobalBanSection
                        vanNumber={vanNumber}
                        globalBansBlue={globalBansBlue}
                        globalBansRed={globalBansRed}
                        heroBySlug={heroBySlug}
                        onOpen={(side, index) => {
                            setPickerIndex(null)
                            setGlobalBanPicker({ side, index })
                        }}
                        onClear={clearGlobalBan}
                    />
                )}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_20rem_1fr]">
                    <SideColumn
                        side="blue"
                        steps={BLUE_STEPS}
                        filled={filled}
                        activeIndex={activeIndex}
                        heroBySlug={heroBySlug}
                        onSlotClick={setPickerIndex}
                        onLane={(i, lane) => setStep(i, { lane })}
                        onClear={clearStep}
                    />

                    <SuggestionPanel
                        turnLabel={turnLabel}
                        suggestions={suggestions}
                        hasData={!isLoading && (data?.series.length ?? 0) > 0}
                        tournamentNames={tournamentNames}
                        tournamentOptions={tournamentOptions}
                        matchCount={filteredSeries.reduce((n, s) => n + s.matches.length, 0)}
                        onApply={applySuggestion}
                        onTournamentNamesChange={setTournamentNames}
                    />

                    <SideColumn
                        side="red"
                        steps={RED_STEPS}
                        filled={filled}
                        activeIndex={activeIndex}
                        heroBySlug={heroBySlug}
                        onSlotClick={setPickerIndex}
                        onLane={(i, lane) => setStep(i, { lane })}
                        onClear={clearStep}
                    />
                </div>
            </div>

            <HeroPicker
                open={pickerIndex !== null || globalBanPicker !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setPickerIndex(null)
                        setGlobalBanPicker(null)
                    }
                }}
                heroes={data?.heroes ?? []}
                usedHeroIds={globalBanPicker ? globalBanPickerUsedIds : currentUsedHeroIds}
                disabledHeroIds={globalBanPicker ? undefined : pickerDisabledIds}
                onSelect={(heroId) => {
                    if (pickerIndex !== null) {
                        setStep(pickerIndex, { heroId })
                    } else if (globalBanPicker) {
                        setGlobalBan(globalBanPicker.side, globalBanPicker.index, heroId)
                        setGlobalBanPicker(null)
                    }
                }}
            />
        </div>
    )
}


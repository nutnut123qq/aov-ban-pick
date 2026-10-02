"use client"
import { useCallback, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Swords } from "lucide-react"

import { getTally, scoreDraft, type CompPick } from "@/modules/aov"
import type { TeamSide } from "@/modules/types"
import { HeroPicker } from "@/features/draft-input/HeroPicker"
import { DRAFT_SEQUENCE } from "@/features/draft-input/sequence"
import { DraftControls } from "./components/DraftControls"
import { DraftScoreCard } from "./components/DraftScoreCard"
import { GlobalBanSection } from "./components/GlobalBanSection"
import { SideColumn } from "./components/SideColumn"
import { SuggestionPanel } from "./SuggestionPanel"
import { useDraftEngine, type FilledStep } from "./hooks/useDraftEngine"

const BLUE_STEPS = DRAFT_SEQUENCE.filter((s) => s.side === "blue")
const RED_STEPS = DRAFT_SEQUENCE.filter((s) => s.side === "red")

/** Gom các pick đã có đủ hero + lane của một bên (pick thiếu lane chưa chấm được). */
const collectPicks = (
    filled: Array<FilledStep>,
    side: TeamSide,
): Array<CompPick> => {
    const out: Array<CompPick> = []
    for (const s of DRAFT_SEQUENCE) {
        if (s.action !== "pick" || s.side !== side) continue
        const f = filled[s.index]
        if (f?.heroId && f.lane) out.push({ heroId: f.heroId, lane: f.lane })
    }
    return out
}

/** Trang mô phỏng cấm/chọn tương tác + gợi ý real-time mỗi lượt. */
export const DraftSimView = () => {
    const t = useTranslations("draft")
    const tCommon = useTranslations("common")
    const tLane = useTranslations("lanes")
    const [copied, setCopied] = useState(false)

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

    // Pick hợp lệ (đủ hero + lane) mỗi bên — nguồn cho scoreDraft.
    const bluePicks = useMemo(() => collectPicks(filled, "blue"), [filled])
    const redPicks = useMemo(() => collectPicks(filled, "red"), [filled])
    const canScore = bluePicks.length > 0 && redPicks.length > 0

    const compScore = useMemo(() => {
        if (!canScore) return null
        // getTally đã cache LRU theo fingerprint + scope — recompute rẻ.
        const tallyData = getTally(filteredSeries, tournamentNames.join("|"))
        return scoreDraft(bluePicks, redPicks, tallyData)
    }, [canScore, bluePicks, redPicks, filteredSeries, tournamentNames])

    // Text draft dạng "Xanh: A(lane)·B… | Đỏ: X… | Ban: …" để copy.
    const draftText = useMemo(() => {
        const heroName = (id: string | null) =>
            id ? (heroBySlug.get(id)?.name ?? id) : "—"
        const fmtPicks = (side: TeamSide) =>
            DRAFT_SEQUENCE.filter((s) => s.action === "pick" && s.side === side)
                .map((s) => {
                    const f = filled[s.index]
                    if (!f?.heroId) return "—"
                    return f.lane
                        ? `${heroName(f.heroId)}(${tLane(f.lane)})`
                        : heroName(f.heroId)
                })
                .join("·")
        const bans = DRAFT_SEQUENCE.filter((s) => s.action === "ban")
            .map((s) => heroName(filled[s.index]?.heroId ?? null))
            .filter((n) => n !== "—")
            .join("·")
        return `${tCommon("blue")}: ${fmtPicks("blue")} | ${tCommon("red")}: ${fmtPicks("red")} | ${t("ban")}: ${bans || "—"}`
    }, [filled, heroBySlug, t, tCommon, tLane])

    const handleCopyDraft = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(draftText)
        } catch {
            // Clipboard API bị chặn (không secure context / quyền) — fallback.
            const ta = document.createElement("textarea")
            ta.value = draftText
            ta.style.position = "fixed"
            ta.style.opacity = "0"
            document.body.appendChild(ta)
            ta.select()
            try {
                document.execCommand("copy")
            } catch {
                // Bỏ qua — vẫn báo copied để không kẹt UI.
            }
            document.body.removeChild(ta)
        }
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2000)
    }, [draftText])

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
                        copied={copied}
                        onVanChange={handleVanChange}
                        onUndo={undoLast}
                        onReset={reset}
                        onCopyDraft={handleCopyDraft}
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

                    <div className="space-y-4">
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
                        {canScore && <DraftScoreCard score={compScore} />}
                    </div>

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


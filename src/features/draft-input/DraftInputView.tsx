"use client"
import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Swords, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { HeroPicker } from "./HeroPicker"
import { buildSeries, validate } from "./export"
import { DRAFT_SEQUENCE } from "./sequence"
import { SeriesHeaderForm } from "./components/SeriesHeaderForm"
import { DraftTimeline } from "./components/DraftTimeline"
import { ExportActions } from "./components/ExportActions"
import { ImportDialog } from "./components/ImportDialog"
import type { DraftMeta, FilledStep, HeroManifestEntry, Lane } from "./types"

const EMPTY_STEP: FilledStep = { heroId: null, lane: null }

const initialMeta: DraftMeta = {
    tournamentName: "APL 2026",
    patchId: "p_1",
    format: "BO3",
    playedAt: "",
    vanNumber: 1,
    teamBlueName: "",
    teamRedName: "",
    winner: "",
    durationSeconds: 0,
    isBlindPick: false,
}

/** Trang nhập một ván cấm/chọn rồi export JSON đúng schema dữ liệu. */
export const DraftInputView = () => {
    const t = useTranslations("draftInput")
    const [heroes, setHeroes] = useState<Array<HeroManifestEntry>>([])
    const [heroesError, setHeroesError] = useState(false)
    const [meta, setMeta] = useState<DraftMeta>(initialMeta)
    const [filled, setFilled] = useState<Array<FilledStep>>(() =>
        DRAFT_SEQUENCE.map(() => ({ ...EMPTY_STEP })),
    )
    const [pickerIndex, setPickerIndex] = useState<number | null>(null)
    const [importOpen, setImportOpen] = useState(false)

    useEffect(() => {
        let active = true
        fetch("/images/heroes/manifest.json")
            .then((r) => r.json())
            .then((data: Array<HeroManifestEntry>) => {
                if (active) setHeroes(data)
            })
            .catch(() => {
                if (active) setHeroesError(true)
            })
        return () => {
            active = false
        }
    }, [])

    const heroBySlug = useMemo(
        () => new Map(heroes.map((h) => [h.slug, h])),
        [heroes],
    )

    // Tướng đã dùng ở ô khác — không tính ô đang mở để cho phép đổi.
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

    const errors = useMemo(() => validate(meta, filled), [meta, filled])
    const isValid = errors.length === 0

    const json = useMemo(
        () => (isValid ? JSON.stringify(buildSeries(meta, filled), null, 2) : ""),
        [isValid, meta, filled],
    )

    const setStep = (index: number, patch: Partial<FilledStep>) => {
        setFilled((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)))
    }

    const clearStep = (index: number) => setStep(index, { heroId: null, lane: null })

    const setMetaField = <K extends keyof DraftMeta>(key: K, value: DraftMeta[K]) => {
        setMeta((prev) => ({ ...prev, [key]: value }))
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="container mx-auto max-w-4xl px-4 py-8">
                <header className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold">
                            <Swords className="h-6 w-6 text-primary" />
                            {t("title")}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t("subtitle")}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-1 shrink-0 gap-2"
                        onClick={() => setImportOpen(true)}
                    >
                        <Upload className="h-4 w-4" />
                        {t("import")}
                    </Button>
                </header>

                <SeriesHeaderForm meta={meta} onChange={setMetaField} />

                <DraftTimeline
                    filled={filled}
                    heroBySlug={heroBySlug}
                    heroesError={heroesError}
                    onOpenPicker={setPickerIndex}
                    onClearStep={clearStep}
                    onSetLane={(index, lane: Lane) => setStep(index, { lane })}
                />

                <ExportActions
                    meta={meta}
                    filled={filled}
                    json={json}
                    isValid={isValid}
                    errors={errors}
                />
            </div>

            <ImportDialog
                open={importOpen}
                onOpenChange={setImportOpen}
                onApply={(importedMeta, importedFilled) => {
                    setMeta(importedMeta)
                    setFilled(importedFilled)
                }}
            />

            <HeroPicker
                open={pickerIndex !== null}
                onOpenChange={(open) => {
                    if (!open) setPickerIndex(null)
                }}
                heroes={heroes}
                usedHeroIds={usedHeroIds}
                onSelect={(heroId) => {
                    if (pickerIndex !== null) setStep(pickerIndex, { heroId })
                }}
            />
        </div>
    )
}

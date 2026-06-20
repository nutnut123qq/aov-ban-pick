"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Check, Copy, Download, Swords, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import { HeroPicker } from "./HeroPicker"
import { buildSeries, validate } from "./export"
import { DRAFT_PHASES, DRAFT_SEQUENCE, LANES } from "./sequence"
import type { DraftMeta, FilledStep, HeroManifestEntry, Lane } from "./types"

const EMPTY_STEP: FilledStep = { heroId: null, lane: null }

/** Danh sách đội tuyển gợi ý cho input tên đội. */
const TEAM_SUGGESTIONS: ReadonlyArray<string> = [
    "SGP",
    "HKA",
    "FS",
    "SLX",
    "BRU",
    "ONE",
    "FPT",
    "1S",
    "DCG",
    "KOG",
    "FW",
    "ANK",
    "BMG",
    "FPL",
    "BAC",
    "GAM",
]

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
    const [copied, setCopied] = useState(false)

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

    const handleCopy = async () => {
        await navigator.clipboard.writeText(json)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    const handleDownload = () => {
        const blob = new Blob([json], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${(buildSeries(meta, filled).id as string) || "draft"}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="container mx-auto max-w-4xl px-4 py-8">
                <header className="mb-6">
                    <h1 className="flex items-center gap-2 text-2xl font-bold">
                        <Swords className="h-6 w-6 text-primary" />
                        Nhập dữ liệu Draft
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Nhập lượt cấm/chọn của một ván theo đúng thể thức ĐTDV, hệ thống tự
                        sinh JSON để thêm vào dữ liệu trận đấu.
                    </p>
                </header>

                {/* Thông tin chung */}
                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Thông tin ván</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Tên giải">
                            <Input
                                value={meta.tournamentName}
                                onChange={(e) => setMetaField("tournamentName", e.target.value)}
                                placeholder="ĐTDV Mùa Xuân 2024"
                            />
                        </Field>
                        <Field label="Patch (patch_id)">
                            <Input
                                value={meta.patchId}
                                onChange={(e) => setMetaField("patchId", e.target.value)}
                                placeholder="p_1_50"
                            />
                        </Field>
                        <Field label="Đội Xanh (blue)">
                            <TeamAutocomplete
                                value={meta.teamBlueName}
                                onChange={(v) => setMetaField("teamBlueName", v)}
                                placeholder="SGP"
                            />
                        </Field>
                        <Field label="Đội Đỏ (red)">
                            <TeamAutocomplete
                                value={meta.teamRedName}
                                onChange={(v) => setMetaField("teamRedName", v)}
                                placeholder="HKA"
                            />
                        </Field>
                        <Field label="Thể thức">
                            <Select
                                value={meta.format}
                                onValueChange={(v) => setMetaField("format", v as DraftMeta["format"])}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {["BO1", "BO3", "BO5", "BO7"].map((f) => (
                                        <SelectItem key={f} value={f}>
                                            {f}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Ván thứ">
                            <Input
                                type="number"
                                min={1}
                                value={meta.vanNumber}
                                onChange={(e) =>
                                    setMetaField("vanNumber", Number(e.target.value) || 1)
                                }
                            />
                        </Field>
                        <Field label="Ngày thi đấu">
                            <Input
                                type="date"
                                value={meta.playedAt}
                                onChange={(e) => setMetaField("playedAt", e.target.value)}
                            />
                        </Field>
                        <Field label="Thời lượng (giây, tuỳ chọn)">
                            <Input
                                type="number"
                                min={0}
                                value={meta.durationSeconds || ""}
                                onChange={(e) =>
                                    setMetaField("durationSeconds", Number(e.target.value) || 0)
                                }
                                placeholder="1820"
                            />
                        </Field>
                        <Field label="Đội thắng">
                            <Select
                                value={meta.winner || undefined}
                                onValueChange={(v) => setMetaField("winner", v as DraftMeta["winner"])}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn đội thắng" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="blue">
                                        {meta.teamBlueName || "Đội Xanh"} (Xanh)
                                    </SelectItem>
                                    <SelectItem value="red">
                                        {meta.teamRedName || "Đội Đỏ"} (Đỏ)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <label className="flex items-center gap-2 self-end pb-2 text-sm">
                            <input
                                type="checkbox"
                                checked={meta.isBlindPick}
                                onChange={(e) => setMetaField("isBlindPick", e.target.checked)}
                                className="h-4 w-4 accent-primary"
                            />
                            Ván chọn ẩn (Blind Pick — ván 7 BO7)
                        </label>
                    </CardContent>
                </Card>

                {/* Bảng draft theo thứ tự */}
                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Trình tự cấm/chọn</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {heroesError && (
                            <p className="text-sm text-destructive">
                                Không tải được danh sách tướng (manifest.json).
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
                                                    <div className="font-semibold">
                                                        {step.action === "ban"
                                                            ? "CẤM"
                                                            : `CHỌN ${step.pickIndex}`}
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        {step.side === "blue" ? "Xanh" : "Đỏ"}
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => setPickerIndex(step.index)}
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
                                                        <span>+ Chọn tướng</span>
                                                    )}
                                                </button>

                                                {hero && (
                                                    <button
                                                        type="button"
                                                        aria-label={t("clearSelection")}
                                                        title={t("clearSelection")}
                                                        onClick={() => clearStep(step.index)}
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
                                                                setStep(step.index, { lane: v as Lane })
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
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Kết quả */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">JSON xuất ra</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {!isValid ? (
                            <ul className="list-inside list-disc space-y-1 text-sm text-destructive">
                                {errors.map((err) => (
                                    <li key={err}>{err}</li>
                                ))}
                            </ul>
                        ) : (
                            <>
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <Button onClick={handleCopy} variant="outline" className="gap-2 sm:w-auto">
                                        {copied ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                        {copied ? "Đã chép" : "Sao chép"}
                                    </Button>
                                    <Button onClick={handleDownload} className="gap-2 sm:w-auto">
                                        <Download className="h-4 w-4" />
                                        Tải JSON
                                    </Button>
                                </div>
                                <Textarea
                                    readOnly
                                    value={json}
                                    className="h-48 font-mono text-xs sm:h-72"
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

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

/** Input tên đội có dropdown gợi ý, cho phép nhập tự do hoặc chọn nhanh. */
interface TeamAutocompleteProps {
    /** Giá trị hiện tại. */
    value: string
    /** Gọi khi ngườ dùng chọn hoặc nhập. */
    onChange: (value: string) => void
    /** Placeholder cho input. */
    placeholder?: string
}

const TeamAutocomplete = ({ value, onChange, placeholder }: TeamAutocompleteProps) => {
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const filtered = useMemo(() => {
        const q = value.trim().toLowerCase()
        if (!q) return [...TEAM_SUGGESTIONS]
        return TEAM_SUGGESTIONS.filter((t) => t.toLowerCase().includes(q))
    }, [value])

    return (
        <div ref={containerRef} className="relative">
            <Input
                value={value}
                onChange={(e) => {
                    onChange(e.target.value)
                    setOpen(true)
                }}
                onFocus={() => setOpen(true)}
                placeholder={placeholder}
            />
            {open && filtered.length > 0 && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover shadow-md">
                    {filtered.map((team) => (
                        <button
                            key={team}
                            type="button"
                            onClick={() => {
                                onChange(team)
                                setOpen(false)
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                        >
                            {team}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

/** Nhãn + control dạng dọc, dùng lại trong form meta. */
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        {children}
    </div>
)

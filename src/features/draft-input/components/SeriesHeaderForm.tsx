import { useTranslations } from "next-intl"
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
import { TeamAutocomplete } from "./TeamAutocomplete"
import type { DraftMeta } from "../types"

interface SeriesHeaderFormProps {
    meta: DraftMeta
    onChange: <K extends keyof DraftMeta>(key: K, value: DraftMeta[K]) => void
}

export const SeriesHeaderForm = ({ meta, onChange }: SeriesHeaderFormProps) => {
    const t = useTranslations("draftInput")
    const tCommon = useTranslations("common")

    return (
        <Card className="mb-6">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("matchInfoTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label={t("tournamentName")}>
                    <Input
                        value={meta.tournamentName}
                        onChange={(e) => onChange("tournamentName", e.target.value)}
                        placeholder={t("tournamentPlaceholder")}
                    />
                </Field>
                <Field label={t("patchId")}>
                    <Input
                        value={meta.patchId}
                        onChange={(e) => onChange("patchId", e.target.value)}
                        placeholder={t("patchPlaceholder")}
                    />
                </Field>
                <Field label={t("teamBlue")}>
                    <TeamAutocomplete
                        value={meta.teamBlueName}
                        onChange={(v) => onChange("teamBlueName", v)}
                        placeholder={t("teamBluePlaceholder")}
                    />
                </Field>
                <Field label={t("teamRed")}>
                    <TeamAutocomplete
                        value={meta.teamRedName}
                        onChange={(v) => onChange("teamRedName", v)}
                        placeholder={t("teamRedPlaceholder")}
                    />
                </Field>
                <Field label={t("format")}>
                    <Select
                        value={meta.format}
                        onValueChange={(v) => onChange("format", v as DraftMeta["format"])}
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
                <Field label={t("vanNumber")}>
                    <Input
                        type="number"
                        min={1}
                        value={meta.vanNumber}
                        onChange={(e) => onChange("vanNumber", Number(e.target.value) || 1)}
                    />
                </Field>
                <Field label={t("playedAt")}>
                    <Input
                        type="date"
                        value={meta.playedAt}
                        onChange={(e) => onChange("playedAt", e.target.value)}
                    />
                </Field>
                <Field label={t("duration")}>
                    <Input
                        type="number"
                        min={0}
                        value={meta.durationSeconds || ""}
                        onChange={(e) =>
                            onChange("durationSeconds", Number(e.target.value) || 0)
                        }
                        placeholder={t("durationPlaceholder")}
                    />
                </Field>
                <Field label={t("winner")}>
                    <Select
                        value={meta.winner || undefined}
                        onValueChange={(v) => onChange("winner", v as DraftMeta["winner"])}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={t("winnerPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="blue">
                                {t("winnerOption", {
                                    name: meta.teamBlueName || tCommon("blue"),
                                    side: tCommon("blue"),
                                })}
                            </SelectItem>
                            <SelectItem value="red">
                                {t("winnerOption", {
                                    name: meta.teamRedName || tCommon("red"),
                                    side: tCommon("red"),
                                })}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                <label className="flex items-center gap-2 self-end pb-2 text-sm">
                    <input
                        type="checkbox"
                        checked={meta.isBlindPick}
                        onChange={(e) => onChange("isBlindPick", e.target.checked)}
                        className="h-4 w-4 accent-primary"
                    />
                    {t("blindPick")}
                </label>
            </CardContent>
        </Card>
    )
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        {children}
    </div>
)

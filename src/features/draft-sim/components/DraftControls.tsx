import { useTranslations } from "next-intl"
import { Check, Copy, RotateCcw, Undo } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { VAN_OPTIONS } from "../hooks/useDraftEngine"

interface DraftControlsProps {
    /** Ván đang mô phỏng (1..6). */
    vanNumber: number
    /** true trong ~2s sau khi copy draft thành công. */
    copied: boolean
    /** Đổi ván đang mô phỏng. */
    onVanChange: (nextVan: number) => void
    /** Hoàn tác lượt gần nhất. */
    onUndo: () => void
    /** Reset ván hiện tại. */
    onReset: () => void
    /** Copy draft dạng text vào clipboard. */
    onCopyDraft: () => void
}

export const DraftControls = ({
    vanNumber,
    copied,
    onVanChange,
    onUndo,
    onReset,
    onCopyDraft,
}: DraftControlsProps) => {
    const t = useTranslations("draft")

    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">{t("van")}</Label>
                <Select
                    value={String(vanNumber)}
                    onValueChange={(v) => onVanChange(Number(v))}
                >
                    <SelectTrigger className="w-20">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {VAN_OPTIONS.map((v) => (
                            <SelectItem key={v} value={String(v)}>
                                {v}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button variant="outline" onClick={onCopyDraft} className="gap-2">
                {copied ? (
                    <Check className="h-4 w-4" />
                ) : (
                    <Copy className="h-4 w-4" />
                )}
                {copied ? t("copied") : t("copyDraft")}
            </Button>
            <Button variant="outline" onClick={onUndo} className="gap-2">
                <Undo className="h-4 w-4" />
                {t("undo")}
            </Button>
            <Button variant="outline" onClick={onReset} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                {t("reset")}
            </Button>
        </div>
    )
}

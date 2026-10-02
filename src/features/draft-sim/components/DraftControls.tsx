import { useTranslations } from "next-intl"
import { RotateCcw, Undo } from "lucide-react"

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
    vanNumber: number
    onVanChange: (nextVan: number) => void
    onUndo: () => void
    onReset: () => void
}

export const DraftControls = ({
    vanNumber,
    onVanChange,
    onUndo,
    onReset,
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

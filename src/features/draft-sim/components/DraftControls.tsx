import { useTranslations } from "next-intl"
import { Check, Copy, Link2, RotateCcw } from "lucide-react"

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
    /** true trong ~2s sau khi copy link chia sẻ thành công. */
    linkCopied: boolean
    /** Đổi ván đang mô phỏng. */
    onVanChange: (nextVan: number) => void
    /** Reset ván hiện tại. */
    onReset: () => void
    /** Copy draft dạng text vào clipboard. */
    onCopyDraft: () => void
    /** Copy link chia sẻ (URL hiện tại, gồm query param `d`). */
    onCopyLink: () => void
}

/** Thao tác phụ của trang draft: chọn ván, chia sẻ, làm lại. Hoàn tác nằm ở TurnBanner. */
export const DraftControls = ({
    vanNumber,
    copied,
    linkCopied,
    onVanChange,
    onReset,
    onCopyDraft,
    onCopyLink,
}: DraftControlsProps) => {
    const t = useTranslations("draft")
    const copyLabel = copied ? t("copied") : t("copyDraft")
    const linkLabel = linkCopied ? t("linkCopied") : t("copyLink")

    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
                <Label htmlFor="draft-van" className="text-xs text-muted-foreground">
                    {t("van")}
                </Label>
                <Select
                    value={String(vanNumber)}
                    onValueChange={(v) => onVanChange(Number(v))}
                >
                    <SelectTrigger id="draft-van" className="h-10 w-20">
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
            {/* Mobile chỉ hiện icon để toolbar không quấn nhiều dòng; aria-label giữ tên đầy đủ. */}
            <Button
                variant="outline"
                onClick={onCopyDraft}
                aria-label={copyLabel}
                title={copyLabel}
                className="h-10 min-w-10 gap-2"
            >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="hidden sm:inline">{copyLabel}</span>
            </Button>
            <Button
                variant="outline"
                onClick={onCopyLink}
                aria-label={linkLabel}
                title={linkLabel}
                className="h-10 min-w-10 gap-2"
            >
                {linkCopied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                <span className="hidden sm:inline">{linkLabel}</span>
            </Button>
            <Button variant="outline" onClick={onReset} className="h-10 gap-2">
                <RotateCcw className="h-4 w-4" />
                {t("reset")}
            </Button>
        </div>
    )
}

"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { parseImport } from "../import"
import type { DraftMeta, FilledStep } from "../types"

interface ImportDialogProps {
    /** Mở/đóng dialog. */
    open: boolean
    /** Callback đổi trạng thái mở. */
    onOpenChange: (open: boolean) => void
    /** Điền meta + filled đọc được vào form. */
    onApply: (meta: DraftMeta, filled: Array<FilledStep>) => void
}

/** Dialog dán JSON export để điền lại toàn bộ form nhập liệu. */
export const ImportDialog = ({ open, onOpenChange, onApply }: ImportDialogProps) => {
    const t = useTranslations("draftInput")
    const [raw, setRaw] = useState("")
    const [error, setError] = useState("")

    const handleApply = () => {
        try {
            const { meta, filled } = parseImport(raw)
            onApply(meta, filled)
            setRaw("")
            setError("")
            onOpenChange(false)
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e))
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>{t("importTitle")}</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">{t("importNote")}</p>
                <Textarea
                    value={raw}
                    onChange={(e) => setRaw(e.target.value)}
                    placeholder={t("importPlaceholder")}
                    className="h-48 font-mono text-xs"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex justify-end">
                    <Button onClick={handleApply} disabled={!raw.trim()}>
                        {t("importApply")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

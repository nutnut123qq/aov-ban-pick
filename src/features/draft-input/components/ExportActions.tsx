import { useState } from "react"
import { useTranslations } from "next-intl"
import { Check, Copy, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { buildSeries } from "../export"
import type { DraftMeta, FilledStep } from "../types"

interface ExportActionsProps {
    meta: DraftMeta
    filled: Array<FilledStep>
    json: string
    isValid: boolean
    errors: ReadonlyArray<string>
}

export const ExportActions = ({
    meta,
    filled,
    json,
    isValid,
    errors,
}: ExportActionsProps) => {
    const t = useTranslations("draftInput")
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        if (!isValid || !json) return
        await navigator.clipboard.writeText(json)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    const handleDownload = () => {
        if (!isValid || !json) return
        const blob = new Blob([json], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${(buildSeries(meta, filled).id as string) || "draft"}.json`
        a.click()
        URL.revokeObjectURL(url)
    }


    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("exportTitle")}</CardTitle>
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
                                {copied ? t("copied") : t("copy")}
                            </Button>
                            <Button onClick={handleDownload} className="gap-2 sm:w-auto">
                                <Download className="h-4 w-4" />
                                {t("download")}
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
    )
}

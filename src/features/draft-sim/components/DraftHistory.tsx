"use client"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { ChevronDown, History, Trash2 } from "lucide-react"

import type { DraftSlot } from "@/modules/aov"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { DraftHistoryEntry } from "../hooks/useDraftHistory"

interface DraftHistoryProps {
    /** Danh sách draft đã lưu, mới nhất trước. */
    entries: Array<DraftHistoryEntry>
    /** Load một draft đã lưu vào ván hiện tại. */
    onLoad: (slots: Array<DraftSlot>) => void
    /** Xoá một entry khỏi history. */
    onDelete: (savedAt: number) => void
}

/** Collapsible list các draft đã lưu trong localStorage (tối đa 20, load/xoá). */
export const DraftHistory = ({ entries, onLoad, onDelete }: DraftHistoryProps) => {
    const t = useTranslations("draft")
    const [open, setOpen] = useState(false)

    return (
        <Card>
            <CardHeader className="pb-3">
                <button
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    className="flex w-full items-center justify-between text-left"
                    aria-expanded={open}
                >
                    <CardTitle className="flex items-center gap-2 text-base">
                        <History className="h-5 w-5 text-primary" />
                        {t("historyTitle")}
                        {entries.length > 0 && (
                            <span className="text-xs font-normal text-muted-foreground">
                                ({entries.length})
                            </span>
                        )}
                    </CardTitle>
                    <ChevronDown
                        className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform",
                            open && "rotate-180",
                        )}
                    />
                </button>
            </CardHeader>
            {open && (
                <CardContent className="space-y-1.5">
                    {entries.length === 0 ? (
                        <p className="py-1 text-center text-xs text-muted-foreground">
                            {t("historyEmpty")}
                        </p>
                    ) : (
                        entries.map((e) => (
                            <div
                                key={e.savedAt}
                                className="flex items-center gap-2 text-xs"
                            >
                                <span className="min-w-0 flex-1 truncate" title={e.label}>
                                    {e.label}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => onLoad(e.slots)}
                                >
                                    {t("historyLoad")}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 px-0 text-muted-foreground"
                                    onClick={() => onDelete(e.savedAt)}
                                    aria-label={t("historyDelete")}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))
                    )}
                </CardContent>
            )}
        </Card>
    )
}

"use client"
import { useMemo, useState } from "react"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import type { HeroManifestEntry } from "./types"

interface HeroPickerDialogProps {
    /** Mở/đóng dialog. */
    open: boolean
    /** Callback đổi trạng thái mở. */
    onOpenChange: (open: boolean) => void
    /** Toàn bộ tướng. */
    heroes: Array<HeroManifestEntry>
    /** `hero_id` đã dùng ở ô khác trong ván (làm mờ, không cho chọn lại). */
    usedHeroIds: Set<string>
    /** Người dùng chọn một tướng. */
    onSelect: (heroId: string) => void
}

/** Lưới chọn tướng có ô tìm kiếm, dùng cho mỗi ô cấm/chọn. */
export const HeroPickerDialog = ({
    open,
    onOpenChange,
    heroes,
    usedHeroIds,
    onSelect,
}: HeroPickerDialogProps) => {
    const [query, setQuery] = useState("")

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return heroes
        return heroes.filter(
            (h) => h.name.toLowerCase().includes(q) || h.slug.includes(q),
        )
    }, [heroes, query])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Chọn tướng</DialogTitle>
                </DialogHeader>
                <Input
                    autoFocus
                    placeholder="Tìm tướng…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <div className="grid max-h-[55vh] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-5">
                    {filtered.map((hero) => {
                        const used = usedHeroIds.has(hero.slug)
                        return (
                            <button
                                key={hero.slug}
                                type="button"
                                disabled={used}
                                onClick={() => {
                                    onSelect(hero.slug)
                                    onOpenChange(false)
                                    setQuery("")
                                }}
                                className={cn(
                                    "flex flex-col items-center gap-1 rounded-lg border p-2 text-center transition-colors",
                                    used
                                        ? "cursor-not-allowed opacity-30"
                                        : "hover:border-primary hover:bg-muted/50",
                                )}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={`/images/heroes/${hero.file}`}
                                    alt={hero.name}
                                    loading="lazy"
                                    className="h-14 w-14 rounded-md object-cover"
                                />
                                <span className="line-clamp-1 text-xs">{hero.name}</span>
                            </button>
                        )
                    })}
                    {filtered.length === 0 && (
                        <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
                            Không tìm thấy tướng nào.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

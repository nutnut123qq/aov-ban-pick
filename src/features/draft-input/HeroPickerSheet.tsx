"use client"

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"

import { HeroPickerGrid } from "./HeroPickerGrid"
import type { HeroManifestEntry } from "./types"

interface HeroPickerSheetProps {
    /** Mở/đóng sheet. */
    open: boolean
    /** Callback đổi trạng thái mở. */
    onOpenChange: (open: boolean) => void
    /** Toàn bộ tướng. */
    heroes: Array<HeroManifestEntry>
    /** `hero_id` đã dùng ở ô khác trong ván. */
    usedHeroIds: Set<string>
    /** Ngườ dùng chọn một tướng. */
    onSelect: (heroId: string) => void
}

/** Bottom sheet chọn tướng cho mobile. */
export const HeroPickerSheet = ({
    open,
    onOpenChange,
    heroes,
    usedHeroIds,
    onSelect,
}: HeroPickerSheetProps) => {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl pb-6">
                <SheetHeader className="pb-2">
                    <SheetTitle>Chọn tướng</SheetTitle>
                </SheetHeader>
                <HeroPickerGrid
                    heroes={heroes}
                    usedHeroIds={usedHeroIds}
                    onSelect={(heroId) => {
                        onSelect(heroId)
                        onOpenChange(false)
                    }}
                    mobileCols={4}
                />
            </SheetContent>
        </Sheet>
    )
}

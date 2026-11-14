"use client"

import type { RefObject } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { HeroPickerGrid } from "./HeroPickerGrid"
import type { HeroManifestEntry } from "./types"
import { useReturnFocus } from "./useReturnFocus"

interface HeroPickerDialogProps {
    /** Mở/đóng dialog. */
    open: boolean
    /** Callback đổi trạng thái mở. */
    onOpenChange: (open: boolean) => void
    /** Toàn bộ tướng. */
    heroes: Array<HeroManifestEntry>
    /** `hero_id` đã dùng ở ô khác trong ván (làm mờ, không cho chọn lại). */
    usedHeroIds: Set<string>
    /** Ngườ dùng chọn một tướng. */
    onSelect: (heroId: string) => void
    /** Nhận focus khi đóng nếu nút đã mở picker không còn nhận focus. */
    returnFocusFallbackRef?: RefObject<HTMLElement | null>
}

/** Dialog chọn tướng cho desktop. */
export const HeroPickerDialog = ({
    open,
    onOpenChange,
    heroes,
    usedHeroIds,
    onSelect,
    returnFocusFallbackRef,
}: HeroPickerDialogProps) => {
    const returnFocus = useReturnFocus(returnFocusFallbackRef)
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl" {...returnFocus}>
                <DialogHeader>
                    <DialogTitle>Chọn tướng</DialogTitle>
                </DialogHeader>
                <HeroPickerGrid
                    heroes={heroes}
                    usedHeroIds={usedHeroIds}
                    onSelect={(heroId) => {
                        onSelect(heroId)
                        onOpenChange(false)
                    }}
                />
            </DialogContent>
        </Dialog>
    )
}

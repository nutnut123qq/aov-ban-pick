"use client"

import { useMediaQuery } from "@/hooks"

import { HeroPickerDialog } from "./HeroPickerDialog"
import { HeroPickerSheet } from "./HeroPickerSheet"
import type { HeroManifestEntry } from "./types"

interface HeroPickerProps {
    /** Mở/đóng picker. */
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

/** Picker tướng tự động chọn Dialog (desktop) hoặc Sheet (mobile). */
export const HeroPicker = (props: HeroPickerProps) => {
    const isMobile = useMediaQuery("(max-width: 639px)")

    if (isMobile) {
        return <HeroPickerSheet {...props} />
    }

    return <HeroPickerDialog {...props} />
}

"use client"
import { useMemo } from "react"

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
    /** `hero_id` bị khóa thêm (vd global ban theo bên) — không cho chọn. */
    disabledHeroIds?: Set<string>
    /** Ngườ dùng chọn một tướng. */
    onSelect: (heroId: string) => void
}

/** Picker tướng tự động chọn Dialog (desktop) hoặc Sheet (mobile). */
export const HeroPicker = ({ disabledHeroIds, ...props }: HeroPickerProps) => {
    const isMobile = useMediaQuery("(max-width: 639px)")
    const mergedUsed = useMemo(() => {
        const set = new Set(props.usedHeroIds)
        disabledHeroIds?.forEach((id) => set.add(id))
        return set
    }, [props.usedHeroIds, disabledHeroIds])

    if (isMobile) {
        return <HeroPickerSheet {...props} usedHeroIds={mergedUsed} />
    }

    return <HeroPickerDialog {...props} usedHeroIds={mergedUsed} />
}

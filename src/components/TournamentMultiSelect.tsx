"use client"
import { useTranslations } from "next-intl"
import { Check, ChevronDown } from "lucide-react"

import { groupTournamentsByRegion } from "@/modules/aov/leagues"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface TournamentMultiSelectProps {
    /** Mọi tên giải có trong dữ liệu. */
    tournaments: Array<string>
    /** Các giải đang chọn — mảng rỗng nghĩa là "tất cả". */
    selected: Array<string>
    /** Đổi tập giải đang chọn. */
    onChange: (next: Array<string>) => void
    /** Class bổ sung cho nút trigger. */
    className?: string
}

/**
 * Dropdown chọn nhiều giải đấu, group theo khu vực.
 * Rỗng = không lọc (tất cả giải). Tick từng giải, hoặc tick cả nhóm khu vực.
 */
export const TournamentMultiSelect = ({
    tournaments,
    selected,
    onChange,
    className,
}: TournamentMultiSelectProps) => {
    const tMeta = useTranslations("meta")
    const tRegions = useTranslations("regions")
    const selectedSet = new Set(selected)
    const groups = groupTournamentsByRegion(tournaments)

    const toggle = (name: string) => {
        onChange(
            selectedSet.has(name)
                ? selected.filter((v) => v !== name)
                : [...selected, name],
        )
    }

    const toggleRegion = (names: Array<string>) => {
        const allIn = names.every((n) => selectedSet.has(n))
        onChange(
            allIn
                ? selected.filter((v) => !names.includes(v))
                : [...new Set([...selected, ...names])],
        )
    }

    const label =
        selected.length === 0
            ? tMeta("allTournaments")
            : tMeta("tournamentsSelected", { count: selected.length })

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn("w-full justify-between font-normal", className)}
                >
                    <span className="truncate">{label}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 p-1">
                <div className="max-h-72 overflow-y-auto">
                    <button
                        type="button"
                        onClick={() => onChange([])}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted/60"
                    >
                        <span className="flex h-4 w-4 items-center justify-center rounded border">
                            {selected.length === 0 && <Check className="h-3 w-3" />}
                        </span>
                        <span className="font-medium">{tMeta("allTournaments")}</span>
                    </button>
                    {groups.map((g) => {
                        const regionAll = g.tournaments.every((n) => selectedSet.has(n))
                        const regionSome = g.tournaments.some((n) => selectedSet.has(n))
                        return (
                            <div key={g.region}>
                                <button
                                    type="button"
                                    onClick={() => toggleRegion(g.tournaments)}
                                    className={cn(
                                        "mt-1 flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs font-semibold uppercase tracking-wide hover:bg-muted/60",
                                        regionSome ? "text-foreground" : "text-muted-foreground",
                                    )}
                                >
                                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded border">
                                        {regionAll && <Check className="h-2.5 w-2.5" />}
                                        {!regionAll && regionSome && (
                                            <span className="h-1.5 w-1.5 rounded-sm bg-foreground" />
                                        )}
                                    </span>
                                    {tRegions(g.region)}
                                </button>
                                {g.tournaments.map((name) => (
                                    <button
                                        key={name}
                                        type="button"
                                        onClick={() => toggle(name)}
                                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 pl-6 text-left text-sm hover:bg-muted/60"
                                    >
                                        <span className="flex h-4 w-4 items-center justify-center rounded border">
                                            {selectedSet.has(name) && (
                                                <Check className="h-3 w-3" />
                                            )}
                                        </span>
                                        <span className="truncate">{name}</span>
                                    </button>
                                ))}
                            </div>
                        )
                    })}
                </div>
            </PopoverContent>
        </Popover>
    )
}

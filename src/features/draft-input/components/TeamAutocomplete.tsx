import { useEffect, useMemo, useRef, useState } from "react"
import { Input } from "@/components/ui/input"

/** Danh sách đội tuyển gợi ý cho input tên đội. */
export const TEAM_SUGGESTIONS: ReadonlyArray<string> = [
    "SGP",
    "HKA",
    "FS",
    "SLX",
    "BRU",
    "ONE",
    "FPT",
    "1S",
    "DCG",
    "KOG",
    "FW",
    "ANK",
    "BMG",
    "FPL",
    "BAC",
    "GAM",
]

interface TeamAutocompleteProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export const TeamAutocomplete = ({
    value,
    onChange,
    placeholder,
}: TeamAutocompleteProps) => {
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const filtered = useMemo(() => {
        const q = value.trim().toLowerCase()
        if (!q) return [...TEAM_SUGGESTIONS]
        return TEAM_SUGGESTIONS.filter((t) => t.toLowerCase().includes(q))
    }, [value])

    return (
        <div ref={containerRef} className="relative">
            <Input
                value={value}
                onChange={(e) => {
                    onChange(e.target.value)
                    setOpen(true)
                }}
                onFocus={() => setOpen(true)}
                placeholder={placeholder}
            />
            {open && filtered.length > 0 && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover shadow-md">
                    {filtered.map((team) => (
                        <button
                            key={team}
                            type="button"
                            onClick={() => {
                                onChange(team)
                                setOpen(false)
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                        >
                            {team}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

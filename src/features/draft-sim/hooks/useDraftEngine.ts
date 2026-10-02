import { useCallback, useEffect, useMemo, useState } from "react"
import { DRAFT_SEQUENCE } from "@/features/draft-input/sequence"
import type { DraftStep } from "@/features/draft-input/types"
import {
    suggestStep,
    useAovData,
    type AssistContext,
    type DraftSlot,
    type Suggestion,
} from "@/modules/aov"
import type { Lane, TeamSide } from "@/modules/types"

export interface FilledStep {
    heroId: string | null
    lane: Lane | null
}

const ALL_LANES: Array<Lane> = ["ta_than", "rung", "giua", "rong_xa", "rong_ho_tro"]
const EMPTY_STEP: FilledStep = { heroId: null, lane: null }

export const VAN_OPTIONS = [1, 2, 3, 4, 5, 6] as const

export const globalBanCount = (vanNumber: number) => Math.max(0, vanNumber - 1) * 5

export const initGlobalBans = (vanNumber: number): Array<string | null> =>
    Array.from<string | null>({ length: globalBanCount(vanNumber) }).fill(null)

const createEmptyGame = (): Array<FilledStep> =>
    DRAFT_SEQUENCE.map(() => ({ ...EMPTY_STEP }))

export const useDraftEngine = (initialVan = 1) => {
    const { data, isLoading } = useAovData()

    // Bộ lọc nguồn data cho gợi ý: theo các giải đấu ([] = mọi series)
    const [tournamentNames, setTournamentNames] = useState<Array<string>>([])

    // Lưu trữ toàn bộ lịch sử draft của từng ván (1..6) trong series
    const [games, setGames] = useState<Record<number, Array<FilledStep>>>(() => ({
        1: createEmptyGame(),
        2: createEmptyGame(),
        3: createEmptyGame(),
        4: createEmptyGame(),
        5: createEmptyGame(),
        6: createEmptyGame(),
    }))

    // Cho phép override thủ công cho từng ô global ban nếu người dùng muốn tuỳ chỉnh độc lập
    const [manualBans, setManualBans] = useState<{
        blue: Record<number, Record<number, string | null>>
        red: Record<number, Record<number, string | null>>
    }>(() => ({
        blue: {},
        red: {},
    }))

    const [vanNumber, setVanNumber] = useState<number>(initialVan)
    const [pickerIndex, setPickerIndex] = useState<number | null>(null)
    const [globalBanPicker, setGlobalBanPicker] = useState<{
        side: TeamSide
        index: number
    } | null>(null)

    // Filled steps của ván hiện tại
    const filled = useMemo(
        () => games[vanNumber] ?? createEmptyGame(),
        [games, vanNumber],
    )

    /**
     * Pure Derived State: Tính toán Fearless Global Ban cho bên Xanh từ lịch sử ván 1..N-1.
     * Tự động phản chiếu mọi thay đổi/undo ở các ván trước mà không bị desync.
     */
    const globalBansBlue = useMemo(() => {
        const total = globalBanCount(vanNumber)
        const result: Array<string | null> = Array(total).fill(null)
        let slotIdx = 0

        for (let g = 1; g < vanNumber; g++) {
            const prevGame = games[g]
            if (prevGame) {
                for (let s = 0; s < DRAFT_SEQUENCE.length; s++) {
                    const step = DRAFT_SEQUENCE[s]
                    if (step.action === "pick" && step.side === "blue") {
                        const h = prevGame[s]?.heroId
                        if (h && slotIdx < total) {
                            result[slotIdx++] = h
                        }
                    }
                }
            }
        }

        // Áp dụng override thủ công nếu có
        const overrides = manualBans.blue[vanNumber]
        if (overrides) {
            for (let i = 0; i < total; i++) {
                if (overrides[i] !== undefined) {
                    result[i] = overrides[i]
                }
            }
        }

        return result
    }, [games, vanNumber, manualBans.blue])

    /**
     * Pure Derived State: Tính toán Fearless Global Ban cho bên Đỏ từ lịch sử ván 1..N-1.
     */
    const globalBansRed = useMemo(() => {
        const total = globalBanCount(vanNumber)
        const result: Array<string | null> = Array(total).fill(null)
        let slotIdx = 0

        for (let g = 1; g < vanNumber; g++) {
            const prevGame = games[g]
            if (prevGame) {
                for (let s = 0; s < DRAFT_SEQUENCE.length; s++) {
                    const step = DRAFT_SEQUENCE[s]
                    if (step.action === "pick" && step.side === "red") {
                        const h = prevGame[s]?.heroId
                        if (h && slotIdx < total) {
                            result[slotIdx++] = h
                        }
                    }
                }
            }
        }

        const overrides = manualBans.red[vanNumber]
        if (overrides) {
            for (let i = 0; i < total; i++) {
                if (overrides[i] !== undefined) {
                    result[i] = overrides[i]
                }
            }
        }

        return result
    }, [games, vanNumber, manualBans.red])

    const activeIndex = useMemo(
        () => DRAFT_SEQUENCE.findIndex((s) => !filled[s.index]?.heroId),
        [filled],
    )
    const activeStep: DraftStep | null =
        activeIndex >= 0 ? DRAFT_SEQUENCE[activeIndex] : null

    const currentUsedHeroIds = useMemo(
        () =>
            new Set(
                filled
                    .filter((_, i) => i !== pickerIndex)
                    .map((f) => f.heroId)
                    .filter(Boolean) as Array<string>,
            ),
        [filled, pickerIndex],
    )

    const globalBanPickerUsedIds = useMemo(() => {
        if (!globalBanPicker) return new Set<string>()
        const sameSideBans =
            globalBanPicker.side === "blue" ? globalBansBlue : globalBansRed
        return new Set(
            sameSideBans
                .filter((h, i) => h && i !== globalBanPicker.index)
                .filter(Boolean) as Array<string>,
        )
    }, [globalBanPicker, globalBansBlue, globalBansRed])

    const pickerDisabledIds = useMemo(() => {
        if (pickerIndex === null) return new Set<string>()
        const step = DRAFT_SEQUENCE[pickerIndex]
        const bans = step.side === "blue" ? globalBansBlue : globalBansRed
        return new Set(bans.filter(Boolean) as Array<string>)
    }, [pickerIndex, globalBansBlue, globalBansRed])

    const ctx: AssistContext | null = useMemo(() => {
        if (!activeStep) return null
        const mySide = activeStep.side

        const myLanes = new Set<Lane>()
        const alliesPicked: Array<{ heroId: string; lane: Lane }> = []
        const enemyRevealed: Array<{ heroId: string; lane: Lane }> = []
        for (const step of DRAFT_SEQUENCE) {
            const f = filled[step.index]
            if (step.action !== "pick" || !f?.heroId || !f.lane) continue
            if (step.side === mySide) {
                myLanes.add(f.lane)
                alliesPicked.push({ heroId: f.heroId, lane: f.lane })
            } else {
                enemyRevealed.push({ heroId: f.heroId, lane: f.lane })
            }
        }

        const sideGlobalBans = new Set(
            (mySide === "blue" ? globalBansBlue : globalBansRed).filter(
                Boolean,
            ) as Array<string>,
        )
        const used = new Set([
            ...(filled.map((f) => f.heroId).filter(Boolean) as Array<string>),
            ...sideGlobalBans,
        ])

        return {
            action: activeStep.action,
            side: mySide,
            used,
            lanesNeeded: ALL_LANES.filter((l) => !myLanes.has(l)),
            alliesPicked,
            enemyRevealed,
        }
    }, [activeStep, filled, globalBansBlue, globalBansRed])

    const filteredSeries = useMemo(() => {
        if (!data) return []
        return data.series.filter(
            (s) => tournamentNames.length === 0 || tournamentNames.includes(s.tournament_name),
        )
    }, [data, tournamentNames])

    const tournamentOptions = useMemo(
        () => [...new Set((data?.series ?? []).map((s) => s.tournament_name))].sort(),
        [data],
    )

    const suggestions: Array<Suggestion> = useMemo(() => {
        if (!ctx || !data) return []
        return suggestStep(ctx, filteredSeries, data.heroes, tournamentNames.join("|"))
    }, [ctx, data, filteredSeries, tournamentNames])

    const heroBySlug = useMemo(
        () => new Map((data?.heroes ?? []).map((h) => [h.slug, h])),
        [data],
    )

    const setStep = (index: number, patch: Partial<FilledStep>) => {
        setGames((prev) => {
            const currentGame = prev[vanNumber] ?? createEmptyGame()
            const updated = currentGame.map((s, i) =>
                i === index ? { ...s, ...patch } : s,
            )
            return { ...prev, [vanNumber]: updated }
        })
    }

    const clearStep = (index: number) => setStep(index, { heroId: null, lane: null })

    const undoLast = useCallback(() => {
        setGames((prev) => {
            const currentGame = prev[vanNumber] ?? createEmptyGame()
            const lastFilled = [...currentGame]
                .map((s, i) => ({ ...s, i }))
                .filter((s) => s.heroId)
                .pop()
            if (!lastFilled) return prev
            const updated = currentGame.map((s, i) =>
                i === lastFilled.i ? { ...s, heroId: null, lane: null } : s,
            )
            return { ...prev, [vanNumber]: updated }
        })
    }, [vanNumber])

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
                e.preventDefault()
                undoLast()
            }
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [undoLast])

    const reset = () => {
        setGames((prev) => ({
            ...prev,
            [vanNumber]: createEmptyGame(),
        }))
        setManualBans((prev) => ({
            blue: { ...prev.blue, [vanNumber]: {} },
            red: { ...prev.red, [vanNumber]: {} },
        }))
        setPickerIndex(null)
        setGlobalBanPicker(null)
    }

    const handleVanChange = (nextVan: number) => {
        setVanNumber(nextVan)
        setPickerIndex(null)
        setGlobalBanPicker(null)
    }

    const setGlobalBan = (side: TeamSide, index: number, heroId: string | null) => {
        setManualBans((prev) => ({
            ...prev,
            [side]: {
                ...prev[side],
                [vanNumber]: {
                    ...(prev[side][vanNumber] ?? {}),
                    [index]: heroId,
                },
            },
        }))
    }

    const clearGlobalBan = (side: TeamSide, index: number) => {
        setGlobalBan(side, index, null)
    }

    const applySuggestion = (heroId: string, lane?: Lane) => {
        if (activeIndex < 0) return
        setStep(activeIndex, { heroId, lane: lane ?? filled[activeIndex]?.lane ?? null })
    }

    /**
     * Load một draft hoàn chỉnh vào ván hiện tại: thay toàn bộ `filled` của
     * vanNumber bằng các slot được truyền (ô không có trong slots → trống).
     * Dùng chung cho load từ URL (?d=) và load từ history localStorage.
     */
    const loadDraft = useCallback(
        (slots: Array<DraftSlot>) => {
            setGames((prev) => {
                const game = createEmptyGame()
                for (const s of slots) {
                    if (!s || s.index < 0 || s.index >= game.length || !s.heroId) continue
                    game[s.index] = { heroId: s.heroId, lane: s.lane ?? null }
                }
                return { ...prev, [vanNumber]: game }
            })
            setPickerIndex(null)
            setGlobalBanPicker(null)
        },
        [vanNumber],
    )

    return {
        data,
        isLoading,
        filled,
        games,
        vanNumber,
        activeIndex,
        activeStep,
        pickerIndex,
        globalBanPicker,
        globalBansBlue,
        globalBansRed,
        currentUsedHeroIds,
        globalBanPickerUsedIds,
        pickerDisabledIds,
        suggestions,
        tournamentNames,
        tournamentOptions,
        filteredSeries,
        heroBySlug,
        setStep,
        clearStep,
        undoLast,
        reset,
        handleVanChange,
        setGlobalBan,
        clearGlobalBan,
        applySuggestion,
        loadDraft,
        setPickerIndex,
        setGlobalBanPicker,
        setTournamentNames,
    }
}

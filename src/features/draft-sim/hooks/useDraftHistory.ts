import { useCallback, useSyncExternalStore } from "react"
import { encodeDraft, type DraftSlot } from "@/modules/aov"

/** Một draft đã lưu trong history localStorage. */
export interface DraftHistoryEntry {
    /** Các slot đã điền của draft (index trong DRAFT_SEQUENCE + hero + lane). */
    slots: Array<DraftSlot>
    /** Timestamp lưu (ms). */
    savedAt: number
    /** Nhãn tóm tắt hiển thị trong list. */
    label: string
}

/** localStorage key chứa history. */
const STORAGE_KEY = "aov-draft-history"

/** Số entry tối đa giữ trong history. */
const MAX_ENTRIES = 20

/** Snapshot rỗng cho SSR — server không có localStorage. */
const EMPTY_ENTRIES: Array<DraftHistoryEntry> = []

const listeners = new Set<() => void>()

let cache: Array<DraftHistoryEntry> | null = null

/** Đọc history từ localStorage, chịu lỗi JSON/private-mode → []. */
const readHistory = (): Array<DraftHistoryEntry> => {
    if (typeof window === "undefined") return EMPTY_ENTRIES
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (!raw) return EMPTY_ENTRIES
        const parsed: unknown = JSON.parse(raw)
        if (!Array.isArray(parsed)) return EMPTY_ENTRIES
        return parsed.filter(
            (e): e is DraftHistoryEntry =>
                Boolean(e) &&
                Array.isArray((e as DraftHistoryEntry).slots) &&
                typeof (e as DraftHistoryEntry).savedAt === "number" &&
                typeof (e as DraftHistoryEntry).label === "string",
        )
    } catch {
        return EMPTY_ENTRIES
    }
}

/** Snapshot ổn định cho useSyncExternalStore — chỉ đọc lại storage sau khi write. */
const getSnapshot = (): Array<DraftHistoryEntry> => {
    if (cache === null) cache = readHistory()
    return cache
}

/**
 * Subscribe thay đổi history: write nội bộ (qua listeners) + event `storage`
 * (đồng bộ cross-tab — invalidate cache để đọc lại storage thật).
 */
const subscribe = (onStoreChange: () => void): (() => void) => {
    const handler = () => {
        cache = null
        onStoreChange()
    }
    listeners.add(handler)
    window.addEventListener("storage", handler)
    return () => {
        listeners.delete(handler)
        window.removeEventListener("storage", handler)
    }
}

/** Ghi history xuống storage + invalidate cache + notify subscribers. */
const writeHistory = (entries: Array<DraftHistoryEntry>): void => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    } catch {
        // History chỉ là tiện ích — lỗi quota không chặn flow chính.
    }
    cache = entries
    for (const cb of listeners) cb()
}

/**
 * History các draft đã hoàn chỉnh, persist trong localStorage `aov-draft-history`
 * (tối đa 20 entry, mới nhất lên đầu, dedupe theo chuỗi encode).
 */
export const useDraftHistory = () => {
    const entries = useSyncExternalStore(
        subscribe,
        getSnapshot,
        () => EMPTY_ENTRIES,
    )

    /** Lưu draft vào history: dedupe theo encoded, unshift lên đầu, cắt ở 20. */
    const save = useCallback((slots: Array<DraftSlot>, label: string) => {
        const encoded = encodeDraft(slots)
        if (!encoded) return
        const rest = getSnapshot().filter((e) => encodeDraft(e.slots) !== encoded)
        writeHistory(
            [{ slots, savedAt: Date.now(), label }, ...rest].slice(0, MAX_ENTRIES),
        )
    }, [])

    /** Xoá một entry theo savedAt. */
    const remove = useCallback((savedAt: number) => {
        writeHistory(getSnapshot().filter((e) => e.savedAt !== savedAt))
    }, [])

    return { entries, save, remove }
}

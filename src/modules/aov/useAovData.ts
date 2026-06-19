"use client"
import useSWR from "swr"

import { loadAovData, type AovData } from "./loadAovData"

/** Key SWR cố định → toàn app chỉ tải dữ liệu tĩnh một lần rồi cache. */
const SWR_KEY = "aov-static-data"

/**
 * Hook tải + cache dữ liệu draft tĩnh cho client.
 * Dùng SWR với key cố định nên nhiều component gọi vẫn chỉ fetch một lần.
 * @returns `{ data, error, isLoading }` — data gồm catalog tướng + series
 */
export const useAovData = () => {
    const { data, error, isLoading } = useSWR<AovData>(SWR_KEY, loadAovData, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    })
    return { data, error, isLoading }
}

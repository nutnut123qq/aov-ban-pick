"use client"

import { useState, useEffect, useCallback, useRef } from "react"

/**
 * Generic async data state
 */
export interface AsyncState<T> {
    data: T | null
    isLoading: boolean
    error: Error | null
}

/**
 * Options for useAsyncData hook
 */
export interface UseAsyncDataOptions<T> {
    /** The async function to fetch data */
    fetcher: () => Promise<T>
    /** Initial data to display while loading */
    initialData?: T | null
    /** Whether to fetch on mount (default: true) */
    fetchOnMount?: boolean
    /** Dependencies that trigger re-fetch when changed */
    dependencies?: unknown[]
    /** Callback when error occurs */
    onError?: (error: Error) => void
    /** Callback when data is successfully fetched */
    onSuccess?: (data: T) => void
}

/**
 * Custom hook for managing async data fetching with loading and error states
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useAsyncData({
 *   fetcher: () => getCourses(),
 *   dependencies: [categoryId],
 * })
 * ```
 */
export function useAsyncData<T>(options: UseAsyncDataOptions<T>) {
    const {
        fetcher,
        initialData = null,
        fetchOnMount = true,
        dependencies = [],
        onError,
        onSuccess,
    } = options

    const [state, setState] = useState<AsyncState<T>>({
        data: initialData,
        isLoading: fetchOnMount,
        error: null,
    })

    const isMountedRef = useRef(true)
    const fetcherRef = useRef(fetcher)

    // Update fetcher ref when it changes
    useEffect(() => {
        fetcherRef.current = fetcher
    }, [fetcher])

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true
        return () => {
            isMountedRef.current = false
        }
    }, [])

    const fetch = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }))

        try {
            const result = await fetcherRef.current()

            if (isMountedRef.current) {
                setState({
                    data: result,
                    isLoading: false,
                    error: null,
                })
                onSuccess?.(result)
            }
        } catch (error) {
            if (isMountedRef.current) {
                const err = error instanceof Error ? error : new Error("Unknown error")
                setState({
                    data: null,
                    isLoading: false,
                    error: err,
                })
                onError?.(err)
            }
        }
    }, [onError, onSuccess])

    // Fetch on mount and when dependencies change
    useEffect(() => {
        if (fetchOnMount || dependencies.length > 0) {
            fetch()
        }
    }, [fetchOnMount, fetch, ...dependencies])

    const refetch = useCallback(() => {
        return fetch()
    }, [fetch])

    const reset = useCallback(() => {
        setState({
            data: initialData,
            isLoading: false,
            error: null,
        })
    }, [initialData])

    return {
        ...state,
        refetch,
        reset,
        isIdle: !state.isLoading && !state.error && !state.data,
        isSuccess: !state.isLoading && !state.error && state.data !== null,
        isError: !state.isLoading && state.error !== null,
    }
}

/**
 * Simpler version of useAsyncData for basic use cases
 */
export function useSimpleAsync<T>(
    asyncFn: () => Promise<T>,
    deps: unknown[] = []
) {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const execute = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await asyncFn()
            setData(result)
        } catch (e) {
            setError(e instanceof Error ? e : new Error("Unknown error"))
        } finally {
            setLoading(false)
        }
    }, [asyncFn])

    useEffect(() => {
        execute()
    }, [execute, ...deps])

    return { data, loading, error, refetch: execute }
}

// Hook for managing hover preview card behavior

"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface HoverPreviewOptions {
    enabled?: boolean
    hoverDelay?: number
    leaveDelay?: number
}

interface HoverPreviewState {
    isOpen: boolean
    position: { x: number; y: number } | null
    mounted: boolean
}

export function useHoverPreview(options: HoverPreviewOptions = {}) {
    const { enabled = true, hoverDelay = 200, leaveDelay = 100 } = options

    const [state, setState] = useState<HoverPreviewState>({
        isOpen: false,
        position: null,
        mounted: false,
    })

    const cardRef = useRef<HTMLDivElement>(null)
    const hoverPreviewRef = useRef<HTMLDivElement>(null)
    const hoverTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

    useEffect(() => {
        setState(prev => ({ ...prev, mounted: true }))
    }, [])

    const calculatePosition = useCallback((cardElement: HTMLElement) => {
        const cardRect = cardElement.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const hoverCardHeight = 520
        const gap = 16

        let x = cardRect.right + gap
        let y = cardRect.top

        if (x + 340 > viewportWidth - 20) {
            x = viewportWidth - 340 - 20
        }

        if (y + hoverCardHeight > viewportHeight - 20) {
            y = Math.max(20, viewportHeight - hoverCardHeight - 20)
        }

        return { x, y }
    }, [])

    const openPreview = useCallback(() => {
        if (!enabled) return

        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
        }

        hoverTimeoutRef.current = setTimeout(() => {
            if (cardRef.current) {
                const position = calculatePosition(cardRef.current)
                setState({ isOpen: true, position, mounted: true })
            }
        }, hoverDelay)
    }, [enabled, hoverDelay, calculatePosition])

    const closePreview = useCallback(() => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
        }

        setTimeout(() => {
            if (hoverPreviewRef.current && hoverPreviewRef.current.matches(":hover")) {
                return
            }
            setState(prev => ({ ...prev, isOpen: false }))
        }, leaveDelay)
    }, [leaveDelay])

    const handlePreviewMouseEnter = useCallback(() => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
        }
        setState(prev => ({ ...prev, isOpen: true }))
    }, [])

    const handlePreviewMouseLeave = useCallback(() => {
        setState(prev => ({ ...prev, isOpen: false }))
    }, [])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setState(prev => ({ ...prev, isOpen: false }))
            }
        }
        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [])

    useEffect(() => {
        const handleScroll = () => {
            setState(prev => ({ ...prev, isOpen: false }))
        }
        window.addEventListener("scroll", handleScroll, true)
        return () => window.removeEventListener("scroll", handleScroll, true)
    }, [])

    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current)
            }
        }
    }, [])

    return {
        cardRef,
        hoverPreviewRef,
        isOpen: state.isOpen,
        position: state.position,
        mounted: state.mounted,
        openPreview,
        closePreview,
        handlePreviewMouseEnter,
        handlePreviewMouseLeave,
    }
}

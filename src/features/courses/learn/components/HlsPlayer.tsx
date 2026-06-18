"use client"

import React, { useEffect, useRef } from "react"
import Hls from "hls.js"

interface HlsPlayerProps {
    /** HLS master playlist (`.m3u8`) URL, or a plain video URL as fallback. */
    src: string
    poster?: string
    onEnded?: () => void
}

/**
 * Adaptive HLS player: native HLS on Safari, hls.js elsewhere, plain `<video>`
 * for non-HLS sources.
 */
export const HlsPlayer = ({ src, poster, onEnded }: HlsPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        const video = videoRef.current
        if (!video || !src) return

        const isHls = src.includes(".m3u8")
        let hls: Hls | null = null

        if (!isHls) {
            video.src = src
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            // Safari / iOS — native HLS
            video.src = src
        } else if (Hls.isSupported()) {
            hls = new Hls({ enableWorker: true, lowLatencyMode: false })
            hls.loadSource(src)
            hls.attachMedia(video)
        } else {
            video.src = src
        }

        return () => {
            if (hls) hls.destroy()
        }
    }, [src])

    return (
        <video
            ref={videoRef}
            controls
            playsInline
            poster={poster}
            onEnded={onEnded}
            className="w-full h-full bg-black rounded-lg"
        />
    )
}

export default HlsPlayer

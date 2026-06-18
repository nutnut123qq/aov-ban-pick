"use client"
import React, { useRef, useState, useEffect } from "react"
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    SkipBack,
    SkipForward,
    Settings,
    Subtitles,
    ChevronLeft,
    RotateCcw,
    Film,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatDuration } from "../utils"

interface VideoPlayerProps {
    videoUrl?: string
    title: string
    onEnded?: () => void
    onTimeUpdate?: (currentTime: number) => void
    initialTime?: number
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
    videoUrl,
    title,
    onEnded,
    onTimeUpdate,
    initialTime = 0,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const progressRef = useRef<HTMLDivElement>(null)

    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [showSpeedMenu, setShowSpeedMenu] = useState(false)
    const [buffered, setBuffered] = useState(0)

    const controlsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

    // Format time display
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    // Handle play/pause
    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    // Handle seek
    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (progressRef.current && videoRef.current) {
            const rect = progressRef.current.getBoundingClientRect()
            const percent = (e.clientX - rect.left) / rect.width
            const newTime = percent * duration
            videoRef.current.currentTime = newTime
            setCurrentTime(newTime)
        }
    }

    // Handle volume
    const handleVolumeChange = (value: number[]) => {
        const newVolume = value[0]
        setVolume(newVolume)
        if (videoRef.current) {
            videoRef.current.volume = newVolume
            setIsMuted(newVolume === 0)
        }
    }

    // Toggle mute
    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (containerRef.current) {
            if (!isFullscreen) {
                containerRef.current.requestFullscreen()
            } else {
                document.exitFullscreen()
            }
        }
    }

    // Handle playback rate
    const handlePlaybackRate = (rate: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = rate
            setPlaybackRate(rate)
            setShowSpeedMenu(false)
        }
    }

    // Skip forward/backward
    const skip = (seconds: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime += seconds
        }
    }

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!videoRef.current) return

            switch (e.key) {
                case " ":
                case "k":
                    e.preventDefault()
                    togglePlay()
                    break
                case "ArrowLeft":
                    skip(-10)
                    break
                case "ArrowRight":
                    skip(10)
                    break
                case "ArrowUp":
                    e.preventDefault()
                    setVolume((v) => Math.min(1, v + 0.1))
                    break
                case "ArrowDown":
                    e.preventDefault()
                    setVolume((v) => Math.max(0, v - 0.1))
                    break
                case "m":
                    toggleMute()
                    break
                case "f":
                    toggleFullscreen()
                    break
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [])

    // Handle fullscreen change
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }
        document.addEventListener("fullscreenchange", handleFullscreenChange)
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }, [])

    // Show/hide controls
    const handleMouseMove = () => {
        setShowControls(true)
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current)
        }
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false)
            }, 3000)
        }
    }

    // Video event handlers
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime)
            onTimeUpdate?.(videoRef.current.currentTime)
        }
    }

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration)
            if (initialTime > 0) {
                videoRef.current.currentTime = initialTime
            }
        }
    }

    const handleProgress = () => {
        if (videoRef.current && videoRef.current.buffered.length > 0) {
            const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1)
            setBuffered((bufferedEnd / duration) * 100)
        }
    }

    const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2]

    if (!videoUrl) {
        return (
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video flex flex-col items-center justify-center text-white/70 gap-3">
                <Film className="w-12 h-12" />
                <p className="text-sm">Bài học này chưa có video</p>
            </div>
        )
    }

    return (
        <TooltipProvider delayDuration={0}>
            <div
                ref={containerRef}
                className="relative bg-black rounded-lg overflow-hidden group"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => isPlaying && setShowControls(false)}
            >
                {/* Video Element */}
                <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    src={videoUrl}
                    onClick={togglePlay}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onProgress={handleProgress}
                    onEnded={onEnded}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                />

                {/* Play/Pause Overlay */}
                <div
                    className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 ${
                        showControls || !isPlaying ? "opacity-100" : "opacity-0"
                    }`}
                    onClick={togglePlay}
                >
                    {!isPlaying && (
                        <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                            <Play className="w-10 h-10 text-black ml-1" fill="black" />
                        </div>
                    )}
                </div>

                {/* Controls Bar */}
                <div
                    className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${
                        showControls ? "opacity-100" : "opacity-0"
                    }`}
                >
                    {/* Progress Bar */}
                    <div
                        ref={progressRef}
                        className="relative h-1 bg-white/30 rounded-full cursor-pointer mb-4 group/progress"
                        onClick={handleSeek}
                    >
                        {/* Buffered */}
                        <div
                            className="absolute top-0 left-0 h-full bg-white/50 rounded-full"
                            style={{ width: `${buffered}%` }}
                        />
                        {/* Progress */}
                        <div
                            className="absolute top-0 left-0 h-full bg-primary rounded-full"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                        {/* Scrubber */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"
                            style={{ left: `calc(${(currentTime / duration) * 100}% - 6px)` }}
                        />
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {/* Play/Pause */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-white hover:bg-white/20"
                                        onClick={togglePlay}
                                    >
                                        {isPlaying ? (
                                            <Pause className="w-5 h-5" />
                                        ) : (
                                            <Play className="w-5 h-5 ml-0.5" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>{isPlaying ? "Tạm dừng (k)" : "Phát (k)"}</TooltipContent>
                            </Tooltip>

                            {/* Skip Back */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-white hover:bg-white/20"
                                        onClick={() => skip(-10)}
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Lùi 10 giây</TooltipContent>
                            </Tooltip>

                            {/* Skip Forward */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-white hover:bg-white/20"
                                        onClick={() => skip(10)}
                                    >
                                        <SkipForward className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Tới 10 giây</TooltipContent>
                            </Tooltip>

                            {/* Volume */}
                            <div className="flex items-center gap-1 group/volume">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-white hover:bg-white/20"
                                            onClick={toggleMute}
                                        >
                                            {isMuted || volume === 0 ? (
                                                <VolumeX className="w-5 h-5" />
                                            ) : (
                                                <Volume2 className="w-5 h-5" />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{isMuted ? "Bật tiếng" : "Tắt tiếng (m)"}</TooltipContent>
                                </Tooltip>
                                <div className="w-0 overflow-hidden transition-all group-hover/volume:w-20">
                                    <Slider
                                        value={[isMuted ? 0 : volume]}
                                        max={1}
                                        step={0.1}
                                        onValueChange={handleVolumeChange}
                                        className="w-20"
                                    />
                                </div>
                            </div>

                            {/* Time */}
                            <span className="text-white text-sm ml-2">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            {/* Playback Speed */}
                            <div className="relative">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-white hover:bg-white/20"
                                            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                                        >
                                            <span className="text-sm font-medium">{playbackRate}x</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Tốc độ phát</TooltipContent>
                                </Tooltip>
                                {showSpeedMenu && (
                                    <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg shadow-lg py-2 min-w-[100px]">
                                        {speedOptions.map((rate) => (
                                            <button
                                                key={rate}
                                                className={`w-full px-4 py-1.5 text-sm text-left hover:bg-white/10 ${
                                                    playbackRate === rate ? "text-primary" : "text-white"
                                                }`}
                                                onClick={() => handlePlaybackRate(rate)}
                                            >
                                                {rate}x {rate === 1 && "(Bình thường)"}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Fullscreen */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-white hover:bg-white/20"
                                        onClick={toggleFullscreen}
                                    >
                                        {isFullscreen ? (
                                            <Minimize className="w-5 h-5" />
                                        ) : (
                                            <Maximize className="w-5 h-5" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>{isFullscreen ? "Thoát toàn màn hình (f)" : "Toàn màn hình (f)"}</TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </div>

                {/* Video Title (when not fullscreen) */}
                {!isFullscreen && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4">
                        <h2 className="text-white font-medium truncate">{title}</h2>
                    </div>
                )}
            </div>
        </TooltipProvider>
    )
}

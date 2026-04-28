"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Play, Users, Clock, ChevronRight, Star } from "lucide-react"
import { CourseHoverPreview } from "@/components/course/CourseHoverPreview"
import type { CourseEntity } from "@/mocks"
import { useState, useRef, useCallback, useEffect } from "react"
import { createPortal } from "react-dom"

interface CourseCardProps {
    course: CourseEntity
    showHoverPreview?: boolean
}

const formatPrice = (price: number, currency: string = "VND") => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
    }).format(price)
}

const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
        return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
}

const levelColors = {
    BEGINNER: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    INTERMEDIATE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    ADVANCED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const levelLabels = {
    BEGINNER: "Cơ bản",
    INTERMEDIATE: "Trung cấp",
    ADVANCED: "Nâng cao",
}

export function CourseCard({ course, showHoverPreview = true }: CourseCardProps) {
    const [isHoverPreviewOpen, setIsHoverPreviewOpen] = useState(false)
    const [hoverPreviewPosition, setHoverPreviewPosition] = useState<{ x: number; y: number } | null>(null)
    const [mounted, setMounted] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)
    const hoverPreviewRef = useRef<HTMLDivElement>(null)
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        setMounted(true)
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

    const handleMouseEnter = useCallback(() => {
        if (!showHoverPreview) return

        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
        }

        hoverTimeoutRef.current = setTimeout(() => {
            if (cardRef.current) {
                const position = calculatePosition(cardRef.current)
                setHoverPreviewPosition(position)
                setIsHoverPreviewOpen(true)
            }
        }, 200)
    }, [showHoverPreview, calculatePosition])

    const handleMouseLeave = useCallback(() => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
        }

        setTimeout(() => {
            if (hoverPreviewRef.current && hoverPreviewRef.current.matches(":hover")) {
                return
            }
            setIsHoverPreviewOpen(false)
        }, 100)
    }, [])

    const handlePreviewMouseEnter = useCallback(() => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
        }
        setIsHoverPreviewOpen(true)
    }, [])

    const handlePreviewMouseLeave = useCallback(() => {
        setIsHoverPreviewOpen(false)
    }, [])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsHoverPreviewOpen(false)
            }
        }
        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [])

    useEffect(() => {
        const handleScroll = () => {
            setIsHoverPreviewOpen(false)
        }
        window.addEventListener("scroll", handleScroll, true)
        return () => window.removeEventListener("scroll", handleScroll, true)
    }, [])

    const hoverPreviewContent = isHoverPreviewOpen && hoverPreviewPosition && mounted ? (
        <div
            ref={hoverPreviewRef}
            onMouseEnter={handlePreviewMouseEnter}
            onMouseLeave={handlePreviewMouseLeave}
            style={{
                position: "fixed",
                left: hoverPreviewPosition.x,
                top: hoverPreviewPosition.y,
                zIndex: 99999,
            }}
        >
            <CourseHoverPreview course={course} />
        </div>
    ) : null

    return (
        <div className="relative">
            <Link href={`/courses/${course.slug}`}>
                <div
                    ref={cardRef}
                    className="h-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer border border-gray-100 dark:border-gray-800"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                            src={course.thumbnail || "/placeholder-course.jpg"}
                            alt={course.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {course.isFeatured && (
                            <span className="absolute top-3 left-3 px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-md">
                                Nổi bật
                            </span>
                        )}
                        {course.discountPrice && (
                            <span className="absolute top-3 right-3 px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-md">
                                -{Math.round((1 - course.discountPrice / course.price) * 100)}%
                            </span>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-white/0 group-hover:bg-white/90 flex items-center justify-center transition-all duration-300 scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100">
                                <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${levelColors[course.level]}`}>
                                {levelLabels[course.level]}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{course.category?.name}</span>
                        </div>
                        <h3 className="font-semibold text-base leading-snug mb-1 line-clamp-2 text-gray-900 dark:text-gray-100">
                            {course.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                            {course.shortDescription}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                            <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {course.enrollmentCount.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(course.duration)}
                            </span>
                            {course.rating && (
                                <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    {course.rating.toFixed(1)}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                {course.discountPrice ? (
                                    <>
                                        <span className="text-lg font-bold text-primary">
                                            {formatPrice(course.discountPrice)}
                                        </span>
                                        <span className="text-sm text-gray-400 line-through">
                                            {formatPrice(course.price)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-lg font-bold text-primary">
                                        {formatPrice(course.price)}
                                    </span>
                                )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </div>
            </Link>

            {mounted && createPortal(hoverPreviewContent, document.body)}
        </div>
    )
}

export default CourseCard

"use client"

import React, { memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Play, Users, Clock, ChevronRight, Star } from "lucide-react"
import { createPortal } from "react-dom"

import { CourseHoverPreview } from "@/components/course/CourseHoverPreview"
import { useHoverPreview } from "@/modules/hooks"
import { formatPrice, formatDurationShort } from "@/modules/utils"
import { levelConfig } from "@/modules/utils/course"
import { COURSE_CARD } from "@/modules/utils/constants"

import type { CourseEntity } from "@/modules/types"

interface CourseCardProps {
    course: CourseEntity
    showHoverPreview?: boolean
    variant?: "default" | "compact" | "featured"
    className?: string
}

/**
 * Unified CourseCard component with hover preview support
 * Optimized with React.memo for performance
 * All cards have consistent height for uniform grid display
 */
export const CourseCard = memo(function CourseCard({
    course,
    showHoverPreview = true,
    variant = "default",
    className = "",
}: CourseCardProps) {
    const {
        cardRef,
        hoverPreviewRef,
        isOpen,
        position,
        mounted,
        openPreview,
        closePreview,
        handlePreviewMouseEnter,
        handlePreviewMouseLeave,
    } = useHoverPreview({
        enabled: showHoverPreview,
        hoverDelay: COURSE_CARD.HOVER_DELAY_MS,
        leaveDelay: COURSE_CARD.LEAVE_DELAY_MS,
    })

    const hoverPreviewContent = isOpen && position && mounted ? (
        <div
            ref={hoverPreviewRef}
            onMouseEnter={handlePreviewMouseEnter}
            onMouseLeave={handlePreviewMouseLeave}
            style={{
                position: "fixed",
                left: position.x,
                top: position.y,
                zIndex: 99999,
            }}
        >
            <CourseHoverPreview course={course} />
        </div>
    ) : null

    const levelStyle = course.level ? levelConfig[course.level as import("@/modules/types/enums").CourseLevel] : { label: "", color: "bg-gray-100 text-gray-800" }
    const thumbnailUrl = course.thumbnailUrl || course.cdnUrl || "/placeholder-course.jpg"
    const displayPrice = course.discountPrice ?? course.originalPrice ?? 0
    const originalPrice = course.originalPrice ?? 0

    const cardClasses = {
        default: "bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer border border-gray-100 dark:border-gray-800",
        compact: "bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 group cursor-pointer border border-gray-100 dark:border-gray-800",
        featured: "bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer border-2 border-primary/20",
    }

    return (
        <div className={`relative flex flex-col h-full ${className}`}>
            <Link href={`/courses/${course.slug ?? course.id}`} className="flex flex-col h-full">
                <div
                    ref={cardRef}
                    className={`${cardClasses[variant]} flex flex-col h-full`}
                    onMouseEnter={openPreview}
                    onMouseLeave={closePreview}
                >
                    {/* Image - Fixed aspect ratio for consistency */}
                    <div className="relative aspect-[16/10] overflow-hidden shrink-0">
                        <Image
                            src={thumbnailUrl}
                            alt={course.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                        {course.isFeatured && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold bg-primary text-primary-foreground rounded-md">
                                Nổi bật
                            </span>
                        )}
                        {course.discountPrice && originalPrice > 0 && (
                            <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-semibold bg-red-500 text-white rounded-md">
                                -{Math.round((1 - course.discountPrice / originalPrice) * 100)}%
                            </span>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/0 group-hover:bg-white/90 flex items-center justify-center transition-all duration-300 scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100">
                                <Play className="w-5 h-5 text-gray-900 ml-0.5" fill="currentColor" />
                            </div>
                        </div>
                    </div>

                    {/* Content - Fixed height section */}
                    <div className="p-3 flex flex-col flex-1 min-h-0">
                        {/* Top: Level + Category */}
                        <div className="flex items-center gap-1.5 mb-1.5 shrink-0">
                            {course.level && (
                                <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${levelStyle.color}`}>
                                    {levelStyle.label}
                                </span>
                            )}
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                                {course.category?.name}
                            </span>
                        </div>

                        {/* Title - Fixed 2 lines */}
                        <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-1 text-gray-900 dark:text-gray-100 shrink-0">
                            {course.title}
                        </h3>

                        {/* Description - Fixed 2 lines */}
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mb-2 flex-1">
                            {course.shortDescription || course.description}
                        </p>

                        {/* Stats - Fixed height */}
                        <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 mb-2 shrink-0">
                            <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {course.enrollmentCount > 999 
                                    ? `${(course.enrollmentCount / 1000).toFixed(1)}k` 
                                    : course.enrollmentCount}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDurationShort(course.estimatedMinutes ?? 0)}
                            </span>
                            {course.rating && (
                                <span className="flex items-center gap-0.5">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    {course.rating.toFixed(1)}
                                </span>
                            )}
                        </div>

                        {/* Price - Fixed layout */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 shrink-0">
                            <div className="flex items-center gap-1.5">
                                {course.discountPrice ? (
                                    <>
                                        <span className="text-base font-bold text-primary">
                                            {formatPrice(course.discountPrice)}
                                        </span>
                                        <span className="text-[11px] text-gray-400 line-through">
                                            {formatPrice(originalPrice)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-base font-bold text-primary">
                                        {formatPrice(originalPrice)}
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
})

export default CourseCard

"use client"

import React, { useCallback } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import Image from "next/image"
import { Play, Users, Clock, ChevronRight, Star } from "lucide-react"

import { CourseHoverPreview } from "./CourseHoverPreview"
import { useHoverPreview } from "@/modules/hooks"
import { formatPrice, formatDurationShort } from "@/modules/utils"
import { levelConfig } from "@/modules/utils/course"

import type { CourseEntity } from "@/modules/types"
import type { CourseLevel } from "@/modules/types/enums"

interface CourseCardProps {
    course: CourseEntity
    showHoverPreview?: boolean
}

export function CourseCard({ course, showHoverPreview = true }: CourseCardProps) {
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
    } = useHoverPreview({ enabled: showHoverPreview })

    const isMobileOrTablet = useCallback(() => {
        if (typeof window === "undefined") return false
        return window.innerWidth < 1024
    }, [])

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

    const levelStyle = course.level ? levelConfig[course.level as CourseLevel] : { label: "", color: "bg-gray-100 text-gray-800" }

    return (
        <div className="relative">
            <Link href={`/courses/${course.slug}`}>
                <div
                    ref={cardRef}
                    className="h-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer border border-gray-100 dark:border-gray-800"
                    onMouseEnter={openPreview}
                    onMouseLeave={closePreview}
                >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                            src={course.thumbnailUrl || course.cdnUrl || "/placeholder-course.jpg"}
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
                                -{Math.round((1 - course.discountPrice / (course.originalPrice ?? 1)) * 100)}%
                            </span>
                        )}
                        {/* Play button overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-white/0 group-hover:bg-white/90 flex items-center justify-center transition-all duration-300 scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100">
                                <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${levelStyle.color}`}>
                                {levelStyle.label}
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
                                {formatDurationShort(course.estimatedMinutes ?? 0)}
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
                                            {formatPrice(course.originalPrice ?? 0)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-lg font-bold text-primary">
                                        {formatPrice(course.originalPrice ?? 0)}
                                    </span>
                                )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </div>
            </Link>

            {/* Hover Preview Card - Render via Portal to escape overflow containers */}
            {mounted && createPortal(hoverPreviewContent, document.body)}
        </div>
    )
}

export default CourseCard

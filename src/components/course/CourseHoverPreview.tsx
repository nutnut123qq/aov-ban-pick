"use client"

import React from "react"
import { Star, Clock, Check, FileText, Globe, ShoppingCart, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { CourseEntity } from "@/mocks"

interface CourseHoverPreviewProps {
    course: CourseEntity
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

const levelLabels = {
    BEGINNER: "Cơ bản",
    INTERMEDIATE: "Trung cấp",
    ADVANCED: "Nâng cao",
}

export function CourseHoverPreview({ course }: CourseHoverPreviewProps) {
    const instructorName = course.instructors?.[0]?.user
        ? `${course.instructors[0].user.firstName || ""} ${course.instructors[0].user.lastName || ""}`.trim()
        : "Giảng viên"

    return (
        <div className="relative w-[310px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-300 dark:border-gray-800 overflow-visible animate-in fade-in-0 zoom-in-95 duration-200">
            {/* Triangle pointer */}
            <div className="relative -left-3 top-8">
                {/* Outer triangle (border) */}
                <div className="absolute w-0 h-0 
                    -translate-x-[2px] -translate-y-[2px]
                    border-t-[12px] border-t-transparent 
                    border-b-[12px] border-b-transparent 
                    border-r-[14px] border-r-gray-300 dark:border-r-gray-800" />
                {/* Inner triangle (background) */}
                <div className="absolute w-0 h-0 
                    border-t-[10px] border-t-transparent 
                    border-b-[10px] border-b-transparent 
                    border-r-[12px] border-r-white dark:border-r-gray-800" />
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Badges */}
                <div className="flex items-center gap-2 mb-3">
                    {course.isFeatured && (
                        <Badge className="bg-primary text-primary-foreground">Nổi bật</Badge>
                    )}
                    {course.isPremium && (
                        <Badge className="bg-amber-500 text-white">Premium</Badge>
                    )}
                    <Badge variant="secondary">{levelLabels[course.level]}</Badge>
                </div>

                {/* Title */}
                <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                    {course.title}
                </h3>

                {/* Instructor */}
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {instructorName}
                </p>

                {/* Rating */}
                {course.rating && (
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold">{course.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                            ({course.reviewCount.toLocaleString()} đánh giá)
                        </span>
                    </div>
                )}

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDuration(course.duration)}
                    </span>
                    <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {course.language || "Tiếng Việt"}
                    </span>
                    <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {course.enrollmentCount.toLocaleString()} học viên
                    </span>
                </div>

                {/* Short description */}
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                    {course.shortDescription || course.description?.slice(0, 100)}
                </p>

                {/* Learning outcomes */}
                {course.outcomes && course.outcomes.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            Bạn sẽ học được
                        </h4>
                        <ul className="space-y-1.5">
                            {course.outcomes.slice(0, 4).map((outcome, index) => (
                                <li key={index} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                                    <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                                    <span className="line-clamp-1">{outcome}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Price & CTA */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-baseline gap-2">
                            {course.discountPrice ? (
                                <>
                                    <span className="text-xl font-bold text-black dark:text-white">
                                        {formatPrice(course.discountPrice)}
                                    </span>
                                    <span className="text-sm text-gray-400 line-through">
                                        {formatPrice(course.price)}
                                    </span>
                                </>
                            ) : (
                                <span className="text-xl font-bold text-black dark:text-white">
                                    {formatPrice(course.price)}
                                </span>
                            )}
                        </div>
                        {course.discountPrice && (
                            <Badge variant="destructive" className="text-xs">
                                -{Math.round((1 - course.discountPrice / course.price) * 100)}%
                            </Badge>
                        )}
                    </div>
                    <Button className="w-full gap-2 py-6 text-base font-semibold" size="lg">
                        <ShoppingCart className="w-5 h-5" />
                        Thêm vào giỏ hàng
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default CourseHoverPreview

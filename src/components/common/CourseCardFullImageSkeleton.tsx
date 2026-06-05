"use client"

import React from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface CourseCardFullImageSkeletonProps {
    aspectRatio?: "video" | "square" | "wide" | "auto"
    className?: string
}

const aspectRatioClasses = {
    video: "aspect-[16/10]",
    square: "aspect-square",
    wide: "aspect-[21/9]",
    auto: "aspect-auto",
}

/**
 * Skeleton loader for CourseCardFullImage
 * Matches the proportions of the updated card design
 */
export function CourseCardFullImageSkeleton({ 
    aspectRatio = "video",
    className = "" 
}: CourseCardFullImageSkeletonProps) {
    return (
        <div className={`h-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 ${className}`}>
            {/* Image */}
            <Skeleton className={`${aspectRatioClasses[aspectRatio]} rounded-none`} />
            
            {/* Content */}
            <div className="p-3">
                {/* Level + Category */}
                <div className="flex items-center gap-1.5 mb-1.5">
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="h-3 w-16" />
                </div>
                
                {/* Title */}
                <Skeleton className="h-4 w-full mb-0.5" />
                <Skeleton className="h-4 w-2/3 mb-2" />
                
                {/* Description */}
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-3/4 mb-2" />
                
                {/* Stats */}
                <div className="flex items-center gap-3 mb-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-10" />
                </div>
                
                {/* Price */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-4" />
                </div>
            </div>
        </div>
    )
}

export default CourseCardFullImageSkeleton

"use client"

import React from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface CourseCardFullImageSkeletonProps {
    aspectRatio?: "video" | "square" | "wide" | "auto"
}

const aspectRatioClasses = {
    video: "aspect-video",
    square: "aspect-square",
    wide: "aspect-[21/9]",
    auto: "aspect-auto h-48",
}

export function CourseCardFullImageSkeleton({ aspectRatio = "video" }: CourseCardFullImageSkeletonProps) {
    return (
        <div className="h-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
            <Skeleton className={`${aspectRatioClasses[aspectRatio]} rounded-t-xl rounded-b-none`} />
            <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-5 w-full mb-1" />
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-3 w-full mb-3" />
                <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-4" />
                </div>
            </div>
        </div>
    )
}

export default CourseCardFullImageSkeleton

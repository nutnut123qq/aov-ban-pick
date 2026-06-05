"use client"

import React from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function ProgramCardSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
            <Skeleton className="aspect-[16/10] rounded-none" />
            <div className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                    <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-5 w-full mb-1" />
                <Skeleton className="h-5 w-2/3 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4 mb-3" />
                <div className="flex gap-4 mb-3">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-10" />
                </div>
                <div className="space-y-1.5 mb-3">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-4" />
                </div>
            </div>
        </div>
    )
}

export function LearningPathCardSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
            <Skeleton className="aspect-[16/10] rounded-none" />
            <div className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                    <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-5 w-full mb-1" />
                <Skeleton className="h-5 w-2/3 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4 mb-3" />
                <div className="flex gap-4 mb-3">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                </div>
                <div className="flex-1" />
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                    <Skeleton className="h-9 w-full rounded-md" />
                </div>
            </div>
        </div>
    )
}

export default ProgramCardSkeleton

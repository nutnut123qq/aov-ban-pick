import React from "react"
import { Skeleton } from "@/components/ui/skeleton"

export const CourseDetailSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen">
            <Skeleton className="w-full h-80" />
            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                    <div>
                        <Skeleton className="h-96 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    )
}

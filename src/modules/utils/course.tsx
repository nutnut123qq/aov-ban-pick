// Course-related utilities - labels, colors, configs
"use client"

import type { LessonEntity } from "@/modules/types"
import { Video, FileText, FileQuestion, Play } from "lucide-react"
import type { CourseLevel, EnrollmentStatus } from "@/modules/types/enums"

/**
 * Course level configuration with label and colors
 */
export const levelConfig: Record<CourseLevel, { label: string; color: string }> = {
    BEGINNER: {
        label: "Cơ bản",
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    },
    INTERMEDIATE: {
        label: "Trung cấp",
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    },
    ADVANCED: {
        label: "Nâng cao",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    },
}

/**
 * Enrollment status configuration
 */
export const enrollmentStatusConfig: Record<EnrollmentStatus, { label: string; color: string }> = {
    PENDING: {
        label: "Đang chờ",
        color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    },
    APPROVED: {
        label: "Đã duyệt",
        color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    REJECTED: {
        label: "Từ chối",
        color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    },
    ENROLLED: {
        label: "Đang học",
        color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    DROPPED: {
        label: "Đã bỏ",
        color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    },
    COMPLETED: {
        label: "Hoàn thành",
        color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
}

/**
 * Get icon for lesson type
 */
export const getLessonIcon = (type: LessonEntity["type"]) => {
    switch (type) {
        case "VIDEO":
            return <Video className="w-4 h-4" />
        case "TEXT":
            return <FileText className="w-4 h-4" />
        case "QUIZ":
            return <FileQuestion className="w-4 h-4" />
        default:
            return <Play className="w-4 h-4" />
    }
}

/**
 * Course level color only (for inline use)
 */
export const levelColors: Record<CourseLevel, string> = {
    BEGINNER: "text-green-600 dark:text-green-400",
    INTERMEDIATE: "text-yellow-600 dark:text-yellow-400",
    ADVANCED: "text-red-600 dark:text-red-400",
}

/**
 * Course level badge classes
 */
export const levelBadgeClasses: Record<CourseLevel, string> = {
    BEGINNER: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    INTERMEDIATE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    ADVANCED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

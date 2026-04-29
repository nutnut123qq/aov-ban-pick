"use client"
import { LessonEntity } from "@/mocks"
import { Video, FileText, FileQuestion, Play } from "lucide-react"

export const formatPrice = (price: number, currency: string = "VND") => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
    }).format(price)
}

export const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
        return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
}

export const formatDurationLong = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const parts = []
    if (hours > 0) parts.push(`${hours} giờ`)
    if (minutes > 0) parts.push(`${minutes} phút`)
    return parts.join(" ")
}

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

export const levelLabels = {
    BEGINNER: { label: "Cơ bản", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
    INTERMEDIATE: { label: "Trung cấp", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
    ADVANCED: { label: "Nâng cao", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
} as const

export const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: ["easeOut"] as const },
}

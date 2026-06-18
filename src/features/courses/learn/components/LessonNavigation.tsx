"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import {
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    Share2,
    Check,
} from "lucide-react"

interface LessonNavigationProps {
    prevLesson?: {
        id: string
        title: string
    }
    nextLesson?: {
        id: string
        title: string
    }
    isCompleted?: boolean
    onMarkComplete?: () => void
    onPrev?: () => void
    onNext?: () => void
}

export const LessonNavigation: React.FC<LessonNavigationProps> = ({
    prevLesson,
    nextLesson,
    isCompleted,
    onMarkComplete,
    onPrev,
    onNext,
}) => {
    const [shared, setShared] = React.useState(false)

    const handleShare = async () => {
        if (typeof window === "undefined") return
        try {
            await navigator.clipboard.writeText(window.location.href)
            setShared(true)
            setTimeout(() => setShared(false), 1500)
        } catch {
            // clipboard blocked — ignore
        }
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
            {/* Prev Button */}
            <Button
                variant="outline"
                onClick={onPrev}
                disabled={!prevLesson}
                className="w-full sm:w-auto"
            >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Bài trước
            </Button>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    title="Đánh dấu hoàn thành"
                    onClick={onMarkComplete}
                >
                    {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                        <CheckCircle className="w-5 h-5" />
                    )}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    title={shared ? "Đã sao chép liên kết" : "Chia sẻ"}
                    onClick={handleShare}
                >
                    {shared ? (
                        <Check className="w-5 h-5 text-green-500" />
                    ) : (
                        <Share2 className="w-5 h-5" />
                    )}
                </Button>
            </div>

            {/* Next Button */}
            <Button
                onClick={onNext}
                disabled={!nextLesson}
                className="w-full sm:w-auto"
            >
                Bài tiếp theo
                <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
        </div>
    )
}

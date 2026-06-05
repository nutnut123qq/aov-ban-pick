"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import {
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    MessageSquare,
    Flag,
    Bookmark,
    Share2,
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
                <Button variant="ghost" size="icon" title="Bình luận">
                    <MessageSquare className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" title="Đánh dấu">
                    <Bookmark className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" title="Chia sẻ">
                    <Share2 className="w-5 h-5" />
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

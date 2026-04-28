"use client"
import React from "react"
import { Award, Download, Share2, MessageSquare, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface LessonSidebarProps {
    title: string
    description?: string
    completedLessons: number
    totalLessons: number
    isEnrolled: boolean
    coursePrice?: number
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
    title,
    description,
    completedLessons,
    totalLessons,
    isEnrolled,
    coursePrice,
}) => {
    const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

    return (
        <div className="space-y-6">
            {/* Course Progress */}
            <div className="p-4 bg-card rounded-lg border">
                <h3 className="font-medium mb-3">Tiến độ học tập</h3>
                <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{completedLessons}/{totalLessons} bài</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                </div>

                {progress === 100 && (
                    <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="flex items-center gap-2 text-green-600">
                            <Award className="w-5 h-5" />
                            <span className="font-medium">Chúc mừng bạn đã hoàn thành khóa học!</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Lesson Info */}
            {description && (
                <div className="p-4 bg-card rounded-lg border">
                    <h3 className="font-medium mb-2">Mô tả bài học</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                    <ThumbsUp className="w-4 h-4" />
                    Hữu ích
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Bình luận
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                    <Share2 className="w-4 h-4" />
                    Chia sẻ
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                    <Download className="w-4 h-4" />
                    Tải xuống
                </Button>
            </div>
        </div>
    )
}

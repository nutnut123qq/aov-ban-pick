import React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Play, Bookmark, CheckCircle2 } from "lucide-react"
import type { CourseEntity } from "@/modules/types"
import { useQueryCourseEnrollmentStatusSwr } from "@/hooks/singleton/swr"
import { formatPrice } from "./utils"

interface CoursePriceCardProps {
    course: CourseEntity
    totalLessons: number
}

export const CoursePriceCard: React.FC<CoursePriceCardProps> = ({
    course,
    totalLessons,
}) => {
    const { data: enrollmentStatus, isLoading: enrollmentLoading } = useQueryCourseEnrollmentStatusSwr()
    const displayPrice = course.discountPrice ?? course.originalPrice ?? 0
    const originalPrice = course.originalPrice ?? 0
    const isEnrolled = enrollmentStatus?.isEnrolled ?? false

    return (
        <div className="sticky top-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                {/* Thumbnail with play button */}
                <div className="relative aspect-video">
                    <Image
                        src={course.thumbnailUrl || course.cdnUrl || "/placeholder-course.jpg"}
                        alt={course.title}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Button size="lg" variant="secondary" className="gap-2">
                            <Play className="w-5 h-5" />
                            Xem giới thiệu
                        </Button>
                    </div>
                </div>

                {/* Price & Actions */}
                <div className="p-6 space-y-4">
                    {!isEnrolled && (
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-primary">
                                {formatPrice(displayPrice)}
                            </span>
                            {course.discountPrice && originalPrice > 0 && (
                                <span className="text-lg text-muted-foreground line-through">
                                    {formatPrice(originalPrice)}
                                </span>
                            )}
                        </div>
                    )}

                    <Button size="lg" className="w-full gap-2" disabled={enrollmentLoading}>
                        {enrollmentLoading
                            ? "Đang kiểm tra..."
                            : isEnrolled
                                ? "Tiếp tục học"
                                : "Đăng ký khóa học"}
                    </Button>

                    <Button size="lg" variant="outline" className="w-full gap-2">
                        <Bookmark className="w-4 h-4" />
                        Lưu khóa học
                    </Button>

                    <Separator />

                    {/* Features list */}
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Truy cập trọn đờI
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Certificate of completion
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            {totalLessons} bài học
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Hỗ trợ 24/7
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

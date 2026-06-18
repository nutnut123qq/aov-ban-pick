import React, { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Play, Bookmark, CheckCircle2 } from "lucide-react"
import type { CourseEntity } from "@/modules/types"
import { PaymentType } from "@/modules/types"
import { listMyFavorites, addFavorite, removeFavorite } from "@/modules/api"
import { toastSuccess, toastError } from "@/modules/toast"
import { useAuthToken } from "@/hooks"
import {
    useQueryCourseEnrollmentStatusSwr,
    useMutateCourseEnrollSwr,
} from "@/hooks/singleton/swr"
import { useKeycloak } from "@/hooks/singleton"
import { formatPrice } from "./utils"

interface CoursePriceCardProps {
    course: CourseEntity
    totalLessons: number
}

export const CoursePriceCard: React.FC<CoursePriceCardProps> = ({
    course,
    totalLessons,
}) => {
    const router = useRouter()
    const { isAuthenticated, login } = useKeycloak()
    const { token } = useAuthToken()
    const { data: enrollmentStatus, isLoading: enrollmentLoading } = useQueryCourseEnrollmentStatusSwr()
    const enrollSwr = useMutateCourseEnrollSwr()
    const [saved, setSaved] = useState(false)
    const [savingFav, setSavingFav] = useState(false)
    const displayPrice = course.discountPrice ?? course.originalPrice ?? 0
    const originalPrice = course.originalPrice ?? 0

    // Load bookmark state from the server.
    useEffect(() => {
        if (!token) return
        let active = true
        listMyFavorites({ token })
            .then((ids) => {
                if (active) setSaved(ids.includes(course.id))
            })
            .catch(() => undefined)
        return () => {
            active = false
        }
    }, [token, course.id])

    const handleToggleSave = async () => {
        if (!token) {
            await login()
            return
        }
        if (savingFav) return
        const next = !saved
        setSaved(next) // optimistic
        setSavingFav(true)
        try {
            if (next) {
                await addFavorite({ token, courseId: course.id })
                toastSuccess("Đã lưu khóa học.")
            } else {
                await removeFavorite({ token, courseId: course.id })
                toastSuccess("Đã bỏ lưu khóa học.")
            }
        } catch (err) {
            console.error("Toggle favorite error:", err)
            setSaved(!next) // rollback
            toastError("Không cập nhật được. Vui lòng thử lại.")
        } finally {
            setSavingFav(false)
        }
    }
    const isEnrolled = enrollmentStatus?.isEnrolled ?? false
    const isEnrolling = enrollSwr.isMutating

    const handlePrimaryClick = async () => {
        // Already enrolled → straight to the learning experience.
        if (isEnrolled) {
            router.push(`/learn/${course.slug}`)
            return
        }
        // Require sign-in before starting checkout.
        if (!isAuthenticated) {
            await login()
            return
        }
        try {
            const origin =
                typeof window !== "undefined" ? window.location.origin : ""
            const returnUrl = `${origin}/courses/${course.slug}`
            const res = await enrollSwr.trigger({
                request: {
                    courseId: course.id,
                    paymentType: PaymentType.PayOS,
                    payosReturnUrl: returnUrl,
                    payosCancelUrl: returnUrl,
                },
            })
            const checkoutUrl = res?.data?.courseEnroll?.checkoutUrl
            if (checkoutUrl && typeof window !== "undefined") {
                window.location.href = checkoutUrl
            }
        } catch (error) {
            console.error("Error starting course enrollment:", error)
        }
    }

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

                    <Button
                        size="lg"
                        className="w-full gap-2"
                        disabled={enrollmentLoading || isEnrolling}
                        onClick={handlePrimaryClick}
                    >
                        {enrollmentLoading
                            ? "Đang kiểm tra..."
                            : isEnrolling
                                ? "Đang xử lý..."
                                : isEnrolled
                                    ? "Tiếp tục học"
                                    : "Đăng ký khóa học"}
                    </Button>

                    <Button
                        size="lg"
                        variant="outline"
                        className="w-full gap-2"
                        disabled={savingFav}
                        onClick={handleToggleSave}
                    >
                        <Bookmark
                            className={`w-4 h-4 ${saved ? "fill-current" : ""}`}
                        />
                        {saved ? "Đã lưu" : "Lưu khóa học"}
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

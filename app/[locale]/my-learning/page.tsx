"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { BookOpen, Clock, CheckCircle, Circle, Play, Award, Calendar, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

import { getMyEnrollments } from "@/mocks"
import type { EnrollmentEntity } from "@/mocks"

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
}

const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
        return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
}

const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    APPROVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    ENROLLED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    DROPPED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
}

const statusLabels = {
    PENDING: "Đang chờ",
    APPROVED: "Đã duyệt",
    REJECTED: "Từ chối",
    ENROLLED: "Đang học",
    DROPPED: "Đã bỏ",
    COMPLETED: "Hoàn thành",
}

const EnrolledCourseCard = ({ enrollment }: { enrollment: EnrollmentEntity }) => {
    return (
        <Link href={`/courses/${enrollment.course?.slug}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                <div className="flex">
                    <div className="relative w-48 h-32 shrink-0">
                        <Image
                            src={enrollment.course?.thumbnail || "/placeholder-course.jpg"}
                            alt={enrollment.course?.title || ""}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Play className="w-10 h-10 text-white" fill="currentColor" />
                        </div>
                    </div>
                    <CardContent className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <Badge className={statusColors[enrollment.status]}>
                                    {statusLabels[enrollment.status]}
                                </Badge>
                                <h3 className="font-semibold mt-2 line-clamp-1">
                                    {enrollment.course?.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {enrollment.class?.title}
                                </p>
                            </div>
                            <div className="text-right shrink-0">
                                <div className="text-2xl font-bold text-primary">
                                    {enrollment.progress}%
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Progress value={enrollment.progress} className="h-2" />
                        </div>
                        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(enrollment.course?.duration || 0)}
                            </span>
                            {enrollment.lastAccessedAt && (
                                <span>
                                    Lần cuối: {new Date(enrollment.lastAccessedAt).toLocaleDateString("vi-VN")}
                                </span>
                            )}
                        </div>
                    </CardContent>
                </div>
            </Card>
        </Link>
    )
}

const MyLearningPage = () => {
    const [enrollments, setEnrollments] = useState<EnrollmentEntity[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getMyEnrollments()
                setEnrollments(data)
            } catch (error) {
                console.error("Error loading enrollments:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [])

    const inProgressCourses = enrollments.filter((e) => e.status === "ENROLLED")
    const completedCourses = enrollments.filter((e) => e.status === "COMPLETED")
    const totalProgress = enrollments.length > 0
        ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)
        : 0

    return (
        <div className="min-h-screen">
            {/* Header */}
          

            <div className="container mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
                            <div className="text-3xl font-bold">{enrollments.length}</div>
                            <div className="text-sm text-muted-foreground">Tổng khóa học</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                            <div className="text-3xl font-bold">{inProgressCourses.length}</div>
                            <div className="text-sm text-muted-foreground">Đang học</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                            <div className="text-3xl font-bold">{completedCourses.length}</div>
                            <div className="text-sm text-muted-foreground">Hoàn thành</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <Award className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                            <div className="text-3xl font-bold">{totalProgress}%</div>
                            <div className="text-sm text-muted-foreground">Tiến độ TB</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Continue Learning */}
                {inProgressCourses.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Play className="w-5 h-5 text-primary" />
                            Tiếp tục học
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {isLoading ? (
                                Array.from({ length: 2 }).map((_, i) => (
                                    <Card key={i}>
                                        <CardContent className="p-0">
                                            <div className="flex">
                                                <Skeleton className="w-48 h-32 rounded-none" />
                                                <div className="flex-1 p-4">
                                                    <Skeleton className="h-4 w-20 mb-2" />
                                                    <Skeleton className="h-5 w-full mb-2" />
                                                    <Skeleton className="h-4 w-3/4" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                inProgressCourses.map((enrollment) => (
                                    <EnrolledCourseCard key={enrollment.id} enrollment={enrollment} />
                                ))
                            )}
                        </div>
                    </section>
                )}

                <Separator className="my-8" />

                {/* All Courses */}
                <section>
                    <h2 className="text-xl font-bold mb-6">Tất cả khóa học</h2>
                    {isLoading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Card key={i}>
                                    <CardContent className="p-0">
                                        <div className="flex">
                                            <Skeleton className="w-48 h-32 rounded-none" />
                                            <div className="flex-1 p-4">
                                                <Skeleton className="h-4 w-20 mb-2" />
                                                <Skeleton className="h-5 w-full mb-2" />
                                                <Skeleton className="h-4 w-3/4" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : enrollments.length > 0 ? (
                        <div className="space-y-4">
                            {enrollments.map((enrollment) => (
                                <EnrolledCourseCard key={enrollment.id} enrollment={enrollment} />
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-12">
                            <CardContent>
                                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="font-semibold mb-2">Chưa có khóa học nào</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Bắt đầu hành trình học tập của bạn ngay hôm nay
                                </p>
                                <Button asChild>
                                    <Link href="/courses">Khám phá khóa học</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </section>
            </div>
        </div>
    )
}

export default MyLearningPage

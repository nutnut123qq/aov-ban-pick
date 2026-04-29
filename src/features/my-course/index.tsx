"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Play, Users, Clock, ChevronRight, BookOpen, CheckCircle2, Award, TrendingUp, BookMarked, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { CourseCardFullImageSkeleton } from "@/components/common"
import { getMyEnrollments } from "@/mocks"
import type { EnrollmentEntity } from "@/mocks"

const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
        return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
}

const statusColors = {
    PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    REJECTED: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    ENROLLED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    DROPPED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
}

const statusLabels = {
    PENDING: "Đang chờ",
    APPROVED: "Đã duyệt",
    REJECTED: "Từ chối",
    ENROLLED: "Đang học",
    DROPPED: "Đã bỏ",
    COMPLETED: "Hoàn thành",
}

const EnrolledCourseCard = ({ enrollment, index }: { enrollment: EnrollmentEntity; index: number }) => {
    const course = enrollment.course as any

    return (
        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.1 }}
                        >
            <Link href={`/courses/${course?.slug}`}>
                <div className="h-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer border border-gray-100 dark:border-gray-800">
                    {/* Image - Same as CourseCard */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                            src={course?.thumbnail || "/placeholder-course.jpg"}
                            alt={course?.title || ""}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                        {/* Featured badge */}
                        {course?.isFeatured && (
                            <span className="absolute top-3 left-3 px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-md">
                                Nổi bật
                            </span>
                        )}
                        {/* Discount badge */}
                        {course?.discountPrice && (
                            <span className="absolute top-3 right-3 px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-md">
                                -{Math.round((1 - course.discountPrice / course.price) * 100)}%
                            </span>
                        )}
                        {/* Play button overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-white/0 group-hover:bg-white/90 flex items-center justify-center transition-all duration-300 scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100">
                                <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
                            </div>
                        </div>
                    </div>

                    {/* Content - Same structure as CourseCard */}
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            {/* Status badge instead of level */}
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${statusColors[enrollment.status]}`}>
                                {statusLabels[enrollment.status]}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{course?.category?.name}</span>
                        </div>
                        <h3 className="font-semibold text-base leading-snug mb-1 line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                            {course?.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                            {course?.shortDescription}
                        </p>

                        {/* Progress bar */}
                        <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    Tiến độ
                                </span>
                                <span className="font-medium">{enrollment.progress}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                    style={{ width: `${enrollment.progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                            <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {course?.enrollmentCount?.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(course?.duration || 0)}
                            </span>
                            {course?.rating && (
                                <span className="flex items-center gap-1">
                                    <span className="w-3 h-3 flex items-center justify-center text-yellow-400">★</span>
                                    {course.rating.toFixed(1)}
                                </span>
                            )}
                        </div>

                        {/* Footer with price and progress */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                {course?.discountPrice ? (
                                    <>
                                        <span className="text-lg font-bold text-primary">
                                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(course.discountPrice)}
                                        </span>
                                        <span className="text-sm text-gray-400 line-through">
                                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(course.price)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-lg font-bold text-primary">
                                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(course?.price || 0)}
                                    </span>
                                )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
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

    const statsData = [
        { icon: BookOpen, label: "Tổng", value: enrollments.length, color: "text-primary", bg: "bg-primary/10" },
        { icon: TrendingUp, label: "Đang học", value: inProgressCourses.length, color: "text-blue-500", bg: "bg-blue-500/10" },
        { icon: CheckCircle2, label: "Hoàn thành", value: completedCourses.length, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { icon: Award, label: "Tiến độ", value: `${totalProgress}%`, color: "text-amber-500", bg: "bg-amber-500/10" },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="mb-6"
                        >
                    <h1 className="text-2xl font-bold mb-1">Khóa học của tôi</h1>
                    <p className="text-sm text-muted-foreground">Theo dõi và quản lý hành trình học tập của bạn</p>
                </motion.div>

                {/* Stats Grid - Compact */}
                <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                            className="grid grid-cols-4 gap-3 mb-6"
                        >
                    {statsData.map((stat, i) => (
                        <div key={i} className={`${stat.bg} rounded-xl p-3`}>
                            <div className="flex items-center gap-2">
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                                <div className="text-xs text-muted-foreground">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Tabs Content */}
                <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
                        >
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="mb-4 bg-muted/50 h-auto p-1 rounded-lg">
                            <TabsTrigger value="all" className="gap-2 py-2 px-4 data-[state=active]:bg-background">
                                <BookMarked className="w-4 h-4" />
                                Tất cả
                            </TabsTrigger>
                            <TabsTrigger value="in-progress" className="gap-2 py-2 px-4 data-[state=active]:bg-background">
                                <TrendingUp className="w-4 h-4" />
                                Đang học
                            </TabsTrigger>
                            <TabsTrigger value="completed" className="gap-2 py-2 px-4 data-[state=active]:bg-background">
                                <CheckCircle2 className="w-4 h-4" />
                                Hoàn thành
                            </TabsTrigger>
                        </TabsList>

                        {/* All Courses */}
                        <TabsContent value="all" className="mt-0">
                            {isLoading ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <CourseCardFullImageSkeleton key={i} />
                                    ))}
                                </div>
                            ) : enrollments.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {enrollments.map((enrollment, index) => (
                                        <EnrolledCourseCard key={enrollment.id} enrollment={enrollment} index={index} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState />
                            )}
                        </TabsContent>

                        {/* In Progress */}
                        <TabsContent value="in-progress" className="mt-0">
                            {isLoading ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {Array.from({ length: 2 }).map((_, i) => (
                                        <CourseCardFullImageSkeleton key={i} />
                                    ))}
                                </div>
                            ) : inProgressCourses.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {inProgressCourses.map((enrollment, index) => (
                                        <EnrolledCourseCard key={enrollment.id} enrollment={enrollment} index={index} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState type="in-progress" />
                            )}
                        </TabsContent>

                        {/* Completed */}
                        <TabsContent value="completed" className="mt-0">
                            {isLoading ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {Array.from({ length: 2 }).map((_, i) => (
                                        <CourseCardFullImageSkeleton key={i} />
                                    ))}
                                </div>
                            ) : completedCourses.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {completedCourses.map((enrollment, index) => (
                                        <EnrolledCourseCard key={enrollment.id} enrollment={enrollment} index={index} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState type="completed" />
                            )}
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </div>
        </div>
    )
}

const EmptyState = ({ type = "all" }: { type?: "all" | "in-progress" | "completed" }) => {
    const content = {
        all: {
            icon: BookOpen,
            title: "Chưa có khóa học nào",
            description: "Bắt đầu hành trình học tập của bạn ngay hôm nay",
            action: "Khám phá khóa học",
            href: "/courses",
        },
        "in-progress": {
            icon: Sparkles,
            title: "Không có khóa đang học",
            description: "Các khóa học bạn đang học sẽ xuất hiện ở đây",
            action: "Khám phá khóa học",
            href: "/courses",
        },
        completed: {
            icon: Award,
            title: "Chưa có khóa hoàn thành",
            description: "Hoàn thành khóa học để nhận chứng chỉ",
            action: "Tiếp tục học",
            href: "/courses",
        },
    }

    const { icon: Icon, title, description, action, href } = content[type]

    return (
        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="text-center py-12"
                        >
            <Card className="max-w-sm mx-auto p-6">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-base mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{description}</p>
                <Button asChild size="sm">
                    <Link href={href}>{action}</Link>
                </Button>
            </Card>
        </motion.div>
    )
}

export default MyLearningPage

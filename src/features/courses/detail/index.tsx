"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
    ArrowLeft,
    Clock,
    Users,
    Star,
    Play,
    BookOpen,
    Award,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Share2,
    Bookmark,
    Lock,
    FileText,
    Video,
    FileQuestion,
    CheckCircle,
    Circle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

import {
    getCourseBySlug,
    getCourses,
    getCourseContent,
} from "@/mocks"
import type { CourseEntity, CourseSectionEntity, CourseChapterEntity, LessonEntity } from "@/mocks"

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
}

const formatPrice = (price: number, currency: string = "VND") => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
    }).format(price)
}

const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
        return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
}

const formatDurationLong = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const parts = []
    if (hours > 0) parts.push(`${hours} giờ`)
    if (minutes > 0) parts.push(`${minutes} phút`)
    return parts.join(" ")
}

const getLessonIcon = (type: LessonEntity["type"]) => {
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

const levelLabels = {
    BEGINNER: { label: "Cơ bản", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
    INTERMEDIATE: { label: "Trung cấp", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
    ADVANCED: { label: "Nâng cao", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
}

const CourseDetailPage = () => {
    const params = useParams()
    const slug = params.slug as string

    const [course, setCourse] = useState<CourseEntity | null>(null)
    const [relatedCourses, setRelatedCourses] = useState<CourseEntity[]>([])
    const [courseContent, setCourseContent] = useState<CourseSectionEntity[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

    useEffect(() => {
        const loadData = async () => {
            try {
                const [courseData, relatedData, contentData] = await Promise.all([
                    getCourseBySlug(slug),
                    getCourses({ limit: 4 }),
                    getCourseContent(),
                ])
                setCourse(courseData)
                setRelatedCourses(relatedData.data.filter((c) => c.slug !== slug).slice(0, 3))
                setCourseContent(contentData)
                // Expand first section by default
                if (contentData.length > 0) {
                    setExpandedSections(new Set([contentData[0].id]))
                }
            } catch (error) {
                console.error("Error loading course:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [slug])

    const toggleSection = (sectionId: string) => {
        const newExpanded = new Set(expandedSections)
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId)
        } else {
            newExpanded.add(sectionId)
        }
        setExpandedSections(newExpanded)
    }

    const totalLessons = courseContent.reduce((acc, section) => {
        return acc + section.chapters?.reduce((chAcc, chapter) => {
            return chAcc + (chapter.lessons?.length || 0)
        }, 0) || 0
    }, 0)

    const totalDuration = courseContent.reduce((acc, section) => {
        return acc + section.chapters?.reduce((chAcc, chapter) => {
            return chAcc + (chapter.lessons?.reduce((lesAcc, lesson) => lesAcc + (lesson.duration || 0), 0) || 0)
        }, 0) || 0
    }, 0)

    if (isLoading) {
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

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Không tìm thấy khóa học</h1>
                    <Button asChild>
                        <Link href="/courses">Quay lại danh sách</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-12">
                <div className="container mx-auto px-4">
                    <Link href="/courses">
                        <Button variant="ghost" className="mb-4 gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại khóa học
                        </Button>
                    </Link>
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <Badge className={levelLabels[course.level].color}>
                                        {levelLabels[course.level].label}
                                    </Badge>
                                    <Badge variant="secondary">{course.category?.name}</Badge>
                                    {course.isFeatured && (
                                        <Badge className="bg-primary text-primary-foreground">Nổi bật</Badge>
                                    )}
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
                                <p className="text-lg text-muted-foreground">{course.shortDescription}</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 text-sm">
                                {course.rating && (
                                    <div className="flex items-center gap-1">
                                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                        <span className="font-semibold">{course.rating.toFixed(1)}</span>
                                        <span className="text-muted-foreground">({course.reviewCount} đánh giá)</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Users className="w-5 h-5" />
                                    <span>{course.enrollmentCount.toLocaleString()} học viên</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-5 h-5" />
                                    <span>{formatDurationLong(totalDuration)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <BookOpen className="w-5 h-5" />
                                    <span>{totalLessons} bài học</span>
                                </div>
                            </div>

                            {/* Instructor */}
                            <div className="flex items-center gap-4">
                                <Avatar className="w-12 h-12">
                                    <AvatarImage src={course.instructors?.[0]?.user?.avatar || ""} />
                                    <AvatarFallback>
                                        {course.instructors?.[0]?.user?.firstName?.charAt(0) || "I"}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">
                                        {course.instructors?.[0]?.user?.firstName} {course.instructors?.[0]?.user?.lastName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {course.instructors?.[0]?.title || "Giảng viên"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Price Card */}
                        <div>
                            <Card className="sticky top-4 overflow-hidden">
                                <div className="relative aspect-video">
                                    <Image
                                        src={course.thumbnail || "/placeholder-course.jpg"}
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
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-primary">
                                            {formatPrice(course.discountPrice || course.price)}
                                        </span>
                                        {course.discountPrice && (
                                            <span className="text-lg text-muted-foreground line-through">
                                                {formatPrice(course.price)}
                                            </span>
                                        )}
                                    </div>
                                    <Button size="lg" className="w-full gap-2">
                                        Đăng ký khóa học
                                    </Button>
                                    <Button size="lg" variant="outline" className="w-full gap-2">
                                        <Bookmark className="w-4 h-4" />
                                        Lưu khóa học
                                    </Button>
                                    <Separator />
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            Truy cập trọn đời
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
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Tabs */}
                        <Tabs defaultValue="curriculum" className="w-full">
                            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0">
                                <TabsTrigger
                                    value="curriculum"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                                >
                                    Nội dung khóa học
                                </TabsTrigger>
                                <TabsTrigger
                                    value="overview"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                                >
                                    Tổng quan
                                </TabsTrigger>
                                <TabsTrigger
                                    value="instructor"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                                >
                                    Giảng viên
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="curriculum" className="mt-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        {courseContent.length} phần • {totalLessons} bài học • {formatDurationLong(totalDuration)}
                                    </p>
                                </div>

                                {courseContent.map((section) => (
                                    <Card key={section.id}>
                                        <button
                                            className="w-full p-4 flex items-center justify-between text-left"
                                            onClick={() => toggleSection(section.id)}
                                        >
                                            <div>
                                                <h3 className="font-semibold">{section.title}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {section.chapters?.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0) || 0} bài học
                                                </p>
                                            </div>
                                            {expandedSections.has(section.id) ? (
                                                <ChevronUp className="w-5 h-5" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5" />
                                            )}
                                        </button>

                                        {expandedSections.has(section.id) && section.chapters && (
                                            <CardContent className="pt-0 pb-4">
                                                {section.chapters.map((chapter) => (
                                                    <div key={chapter.id} className="border-t first:border-0">
                                                        <p className="text-sm font-medium p-3 bg-muted/50">
                                                            {chapter.title}
                                                        </p>
                                                        {chapter.lessons?.map((lesson) => (
                                                            <div
                                                                key={lesson.id}
                                                                className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                                                            >
                                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                                    {getLessonIcon(lesson.type)}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-sm">{lesson.title}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {lesson.type === "VIDEO" && lesson.duration && formatDuration(lesson.duration)}
                                                                        {lesson.type === "QUIZ" && "Quiz"}
                                                                        {lesson.type === "TEXT" && "Bài đọc"}
                                                                    </p>
                                                                </div>
                                                                {lesson.isFree ? (
                                                                    <Badge variant="secondary">Miễn phí</Badge>
                                                                ) : (
                                                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </CardContent>
                                        )}
                                    </Card>
                                ))}
                            </TabsContent>

                            <TabsContent value="overview" className="mt-6 space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold mb-4">Mô tả khóa học</h2>
                                    <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                                        {course.description}
                                    </div>
                                </div>

                                {course.requirements && course.requirements.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-bold mb-4">Yêu cầu</h2>
                                        <ul className="space-y-2">
                                            {course.requirements.map((req, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                                    <span>{req}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {course.outcomes && course.outcomes.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-bold mb-4">Bạn sẽ học được gì</h2>
                                        <ul className="grid md:grid-cols-2 gap-3">
                                            {course.outcomes.map((outcome, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <Award className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                                    <span>{outcome}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="instructor" className="mt-6">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <Avatar className="w-20 h-20">
                                                <AvatarImage src={course.instructors?.[0]?.user?.avatar || ""} />
                                                <AvatarFallback className="text-xl">
                                                    {course.instructors?.[0]?.user?.firstName?.charAt(0) || "I"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold">
                                                    {course.instructors?.[0]?.user?.firstName} {course.instructors?.[0]?.user?.lastName}
                                                </h3>
                                                <p className="text-muted-foreground mb-4">
                                                    {course.instructors?.[0]?.title || "Giảng viên"}
                                                </p>
                                                <div className="flex gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                        4.9 Rating
                                                    </span>
                                                    <span>•</span>
                                                    <span>500+ Reviews</span>
                                                    <span>•</span>
                                                    <span>2000+ Students</span>
                                                </div>
                                            </div>
                                        </div>
                                        {course.instructors?.[0]?.bio && (
                                            <div className="mt-6 pt-6 border-t">
                                                <p className="text-muted-foreground">{course.instructors[0].bio}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Related Courses */}
                    {relatedCourses.length > 0 && (
                        <div className="lg:col-span-3">
                            <h2 className="text-xl font-bold mb-6">Khóa học liên quan</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                {relatedCourses.map((relatedCourse) => (
                                    <Link key={relatedCourse.id} href={`/courses/${relatedCourse.slug}`}>
                                        <Card className="overflow-hidden hover:shadow-lg transition-all">
                                            <div className="relative aspect-video">
                                                <Image
                                                    src={relatedCourse.thumbnail || "/placeholder-course.jpg"}
                                                    alt={relatedCourse.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <CardContent className="p-4">
                                                <h3 className="font-semibold line-clamp-2 mb-2">{relatedCourse.title}</h3>
                                                <p className="text-sm text-muted-foreground">{relatedCourse.category?.name}</p>
                                                <p className="text-lg font-bold text-primary mt-2">
                                                    {formatPrice(relatedCourse.discountPrice || relatedCourse.price)}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CourseDetailPage

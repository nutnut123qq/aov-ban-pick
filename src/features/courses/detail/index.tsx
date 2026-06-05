"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { queryCourse, QueryCourse } from "@/modules/api"
import type { CourseEntity } from "@/modules/types"
import type { CourseSectionEntity } from "@/modules/types"
import {
    useQueryCoursesSwr,
    useQueryCourseEnrollmentStatusSwr,
} from "@/hooks/singleton/swr"
import { useAppDispatch } from "@/redux"
import { setCourseId } from "@/redux/slices"

import {
    CourseHero,
    CoursePriceCard,
    CourseCurriculum,
    CourseOverview,
    CourseInstructor,
    RelatedCourses,
    CourseDetailSkeleton,
} from "./components"

const CourseDetailPage = () => {
    const params = useParams()
    const slug = params.slug as string
    const dispatch = useAppDispatch()

    const [course, setCourse] = useState<CourseEntity | null>(null)
    const [courseContent, setCourseContent] = useState<CourseSectionEntity[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

    const { data: coursesData } = useQueryCoursesSwr()
    const allCourses = (coursesData?.courses.data ?? []) as CourseEntity[]

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true)
            try {
                const res = await queryCourse({
                    query: QueryCourse.QueryBySlug,
                    variables: {
                        request: { slug },
                    },
                })
                const courseData = (res.data as import("@/modules/api/graphql/queries/query-course").QueryCourseBySlugResponse | undefined)?.courseBySlug ?? null
                setCourse(courseData)
                if (courseData?.id) {
                    dispatch(setCourseId(courseData.id))
                }
                const modules = courseData?.modules ?? []
                const adaptedSections: CourseSectionEntity[] = modules.map((module) => ({
                    id: module.id,
                    courseId: courseData?.id ?? "",
                    title: module.title,
                    description: module.description ?? undefined,
                    order: module.orderIndex,
                    isPublished: true,
                    createdAt: (module as unknown as { createdAt: string }).createdAt ?? new Date().toISOString(),
                    updatedAt: (module as unknown as { updatedAt: string }).updatedAt ?? new Date().toISOString(),
                    chapters: [
                        {
                            id: `${module.id}-chapter`,
                            sectionId: module.id,
                            title: "",
                            description: "",
                            order: 0,
                            isPublished: true,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            lessons: (module.contents ?? []).map((content) => {
                                let duration = 0
                                try {
                                    const parsed = JSON.parse(content.data ?? "{}")
                                    duration = parsed.estimatedMinutes ?? 0
                                } catch {
                                    duration = 0
                                }
                                return {
                                    id: content.id,
                                    chapterId: `${module.id}-chapter`,
                                    courseId: courseData?.id ?? "",
                                    title: `Bài ${content.orderIndex + 1}`,
                                    description: "",
                                    type: "VIDEO" as const,
                                    duration,
                                    order: content.orderIndex,
                                    isFree: false,
                                    isPublished: true,
                                    createdAt: (content as unknown as { createdAt: string }).createdAt ?? new Date().toISOString(),
                                    updatedAt: (content as unknown as { updatedAt: string }).updatedAt ?? new Date().toISOString(),
                                }
                            }),
                        },
                    ],
                })) as unknown as CourseSectionEntity[]
                setCourseContent(adaptedSections)
                if (adaptedSections.length > 0) {
                    setExpandedSections(new Set([adaptedSections[0].id]))
                }
            } catch (error) {
                console.error("Error loading course:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [slug, dispatch])

    const relatedCourses = allCourses
        .filter((c) => c.slug !== slug && c.id !== course?.id)
        .slice(0, 3)

    const toggleSection = (sectionId: string) => {
        const newExpanded = new Set(expandedSections)
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId)
        } else {
            newExpanded.add(sectionId)
        }
        setExpandedSections(newExpanded)
    }

    const totalLessons = (courseContent || []).reduce((acc, section) => {
        return acc + ((section.chapters || []).reduce((chAcc, chapter) => {
            return chAcc + ((chapter.lessons || []).length)
        }, 0))
    }, 0)

    const totalDuration = (courseContent || []).reduce((acc, section) => {
        return acc + ((section.chapters || []).reduce((chAcc, chapter) => {
            return chAcc + ((chapter.lessons || []).reduce((lesAcc, lesson) => lesAcc + (lesson.duration || 0), 0))
        }, 0))
    }, 0)

    if (isLoading) {
        return <CourseDetailSkeleton />
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
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <CourseHero
                    course={course}
                    totalLessons={totalLessons}
                    totalDuration={totalDuration}
                />
            </motion.div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Price Card (Mobile) */}
                        <div className="lg:hidden">
                            <CoursePriceCard course={course} totalLessons={totalLessons} />
                        </div>

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

                            <TabsContent value="curriculum" className="mt-6">
                                <CourseCurriculum
                                    sections={courseContent}
                                    expandedSections={expandedSections}
                                    onToggleSection={toggleSection}
                                    courseSlug={slug}
                                />
                            </TabsContent>

                            <TabsContent value="overview" className="mt-6">
                                <CourseOverview course={course} />
                            </TabsContent>

                            <TabsContent value="instructor" className="mt-6">
                                <CourseInstructor course={course} />
                            </TabsContent>
                        </Tabs>

                        {/* Related Courses */}
                        <RelatedCourses courses={relatedCourses} />
                    </div>

                    {/* Price Card (Desktop) */}
                    <div className="hidden lg:block ">
                        <CoursePriceCard course={course} totalLessons={totalLessons} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CourseDetailPage

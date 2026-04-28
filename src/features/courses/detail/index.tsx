"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
    getCourseBySlug,
    getCourses,
    getCourseContent,
} from "@/mocks"
import type { CourseEntity, CourseSectionEntity } from "@/mocks"
import {
    CourseHero,
    CoursePriceCard,
    CourseCurriculum,
    CourseOverview,
    CourseInstructor,
    RelatedCourses,
    CourseDetailSkeleton,
    fadeInUp,
    formatDurationLong,
} from "./components"

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
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={fadeInUp.transition}
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

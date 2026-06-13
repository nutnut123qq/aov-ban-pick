"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Separator } from "@/components/ui/separator"
import { Carousel, defaultBannerSlides } from "@/components/ui/carousel"
import {
    defaultCoursesSorts,
    queryCourses,
    queryTrainingPrograms,
} from "@/modules/api"
import { useKeycloak } from "@/hooks/singleton"
import type { CourseEntity, CourseCategoryEntity, TrainingProgramEntity } from "@/modules/types"

import {
    CategoriesSection,
    CourseSection,
    ProgramsSection,
    WhyChooseUsSection,
    CTASection,
} from "./components"

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const },
}

const HomePage = () => {
    const token = useKeycloak().token
    const [featuredCourses, setFeaturedCourses] = useState<CourseEntity[]>([])
    const [popularCourses, setPopularCourses] = useState<CourseEntity[]>([])
    const [newestCourses, setNewestCourses] = useState<CourseEntity[]>([])
    const [categories, setCategories] = useState<CourseCategoryEntity[]>([])
    const [programs, setPrograms] = useState<TrainingProgramEntity[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const [allCoursesRes, programsData] = await Promise.all([
                    queryCourses({
                        variables: {
                            request: {
                                filters: {
                                    sorts: [...defaultCoursesSorts],
                                    pageNumber: 0,
                                    limit: 100,
                                },
                            },
                        },
                    }),
                    token
                        ? queryTrainingPrograms({
                            token,
                            size: 3,
                        })
                        : Promise.resolve([]),
                ])

                const allCourses = allCoursesRes.data?.courses.data ?? []
                setFeaturedCourses(allCourses.filter((c) => c.isFeatured).slice(0, 8))

                const sortedByEnrollment = [...allCourses].sort((a, b) => b.enrollmentCount - a.enrollmentCount)
                setPopularCourses(sortedByEnrollment.slice(0, 8))

                const sortedByNewest = [...allCourses].sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0).getTime()
                    const dateB = new Date(b.createdAt || 0).getTime()
                    return dateB - dateA
                })
                setNewestCourses(sortedByNewest.slice(0, 8))

                const categoryMap = new Map<string, CourseCategoryEntity>()
                allCourses.forEach((course) => {
                    const category = course.category
                    if (!category?.id) return

                    const current = categoryMap.get(category.id)
                    categoryMap.set(category.id, {
                        id: category.id,
                        name: category.name,
                        slug: null,
                        parentId: null,
                        order: current?.order ?? categoryMap.size,
                        isActive: true,
                        courseCount: (current?.courseCount ?? 0) + 1,
                        createdAt: course.createdAt ?? "",
                        updatedAt: course.updatedAt ?? "",
                    })
                })
                setCategories(
                    Array.from(categoryMap.values())
                        .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
                        .slice(0, 6)
                )
                setPrograms(programsData as TrainingProgramEntity[])
            } catch (error) {
                console.error("Error loading home data:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [token])

    return (
        <div className="space-y-20">
            {/* Hero Banner Carousel */}
            <motion.section {...fadeInUp}>
                <Carousel
                    slides={defaultBannerSlides}
                    autoplay={true}
                    pagination={true}
                    navigation={true}
                    loop={true}
                />
            </motion.section>

            {/* Categories */}
            <CategoriesSection
                categories={categories}
                isLoading={isLoading}
            />

            <Separator />

            {/* Featured Courses */}
            <CourseSection
                title="Khóa học nổi bật"
                subtitle="Những khóa học được yêu thích nhất"
                courses={featuredCourses}
                isLoading={isLoading}
            />

            {/* Most Popular Courses */}
            <CourseSection
                title="Khóa học nhiều người mua"
                subtitle="Top khóa học được đăng ký nhiều nhất"
                courses={popularCourses}
                isLoading={isLoading}
            />

            {/* Newest Courses */}
            <CourseSection
                title="Khóa học mới nhất"
                subtitle="Những khóa học vừa được cập nhật"
                courses={newestCourses}
                isLoading={isLoading}
            />

            {/* Programs */}
            <ProgramsSection
                programs={programs}
                isLoading={isLoading}
            />

            {/* Why Choose Us */}
            <WhyChooseUsSection />

            {/* CTA Section */}
            <CTASection />

            {/* Footer */}
            <footer className="text-center text-sm text-muted-foreground">
                <div className="container mx-auto">
                    <p>© 2024 Tedo. Tất cả quyền được bảo lưu.</p>
                </div>
            </footer>
        </div>
    )
}

export default HomePage

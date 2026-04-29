"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Separator } from "@/components/ui/separator"
import { Carousel, defaultBannerSlides } from "@/components/ui/carousel"
import {
    getFeaturedCourses,
    getCategories,
    getPrograms,
    getCourses,
} from "@/mocks"
import type { CourseEntity, CourseCategoryEntity, TrainingProgramEntity } from "@/mocks"

import {
    CategoriesSection,
    CourseSection,
    ProgramsSection,
    WhyChooseUsSection,
    CTASection,
} from "./components"
import { CourseCardSkeleton } from "@/components/common"

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const },
}

const HomePage = () => {
    const [featuredCourses, setFeaturedCourses] = useState<CourseEntity[]>([])
    const [popularCourses, setPopularCourses] = useState<CourseEntity[]>([])
    const [newestCourses, setNewestCourses] = useState<CourseEntity[]>([])
    const [categories, setCategories] = useState<CourseCategoryEntity[]>([])
    const [programs, setPrograms] = useState<TrainingProgramEntity[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const [coursesData, categoriesData, programsData, allCoursesData] = await Promise.all([
                    getFeaturedCourses(),
                    getCategories(),
                    getPrograms({ limit: 3 }),
                    getCourses({ limit: 50 }),
                ])
                setFeaturedCourses(coursesData)
                setCategories(categoriesData.slice(0, 6))
                setPrograms(programsData.data)

                const sortedByEnrollment = [...allCoursesData.data].sort((a, b) => b.enrollmentCount - a.enrollmentCount)
                setPopularCourses(sortedByEnrollment.slice(0, 8))

                const sortedByNewest = [...allCoursesData.data].sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0).getTime()
                    const dateB = new Date(b.createdAt || 0).getTime()
                    return dateB - dateA
                })
                setNewestCourses(sortedByNewest.slice(0, 8))
            } catch (error) {
                console.error("Error loading home data:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [])

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

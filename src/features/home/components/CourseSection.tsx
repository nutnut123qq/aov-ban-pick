"use client"

import React from "react"
import Link from "next/link"
import { Autoplay, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CourseCard } from "@/components/course/CourseCard"
import { CourseCardSkeleton } from "@/components/common"
import type { CourseEntity } from "@/mocks"

import "swiper/css"
import "swiper/css/pagination"

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const },
}

interface CourseSectionProps {
    title: string
    subtitle: string
    courses: CourseEntity[]
    isLoading?: boolean
    viewAllHref?: string
    skeletonCount?: number
    className?: string
}

export function CourseSection({ 
    title, 
    subtitle, 
    courses, 
    isLoading = false, 
    viewAllHref = "/courses",
    skeletonCount = 4,
    className = ""
}: CourseSectionProps) {
    return (
        <motion.section {...fadeInUp} className={className}>
            <div className="container mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">{title}</h2>
                        <p className="text-muted-foreground mt-1">{subtitle}</p>
                    </div>
                    <Button variant="ghost" className="gap-1" asChild>
                        <Link href={viewAllHref}>Xem tất cả <ArrowRight className="w-4 h-4" /></Link>
                    </Button>
                </div>
                <Swiper
                    modules={[Autoplay, Pagination]}
                    spaceBetween={24}
                    slidesPerView={1}
                    breakpoints={{
                        640: { slidesPerView: 2 },
                        768: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                        1280: { slidesPerView: 4 },
                    }}
                    className="course-swiper"
                >
                    {isLoading ? (
                        Array.from({ length: skeletonCount }).map((_, i) => (
                            <SwiperSlide key={i}><CourseCardSkeleton /></SwiperSlide>
                        ))
                    ) : (
                        courses.map((course) => (
                            <SwiperSlide key={course.id}>
                                <CourseCard course={course} />
                            </SwiperSlide>
                        ))
                    )}
                </Swiper>
            </div>
        </motion.section>
    )
}

export default CourseSection

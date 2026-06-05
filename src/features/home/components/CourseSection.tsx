"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Autoplay, Pagination, Navigation } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"
import type { Swiper as SwiperType } from "swiper"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CourseCard } from "@/components/course/CourseCard"
import { CourseCardSkeleton } from "@/components/common"
import type { CourseEntity } from "@/modules/types"

import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"

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
    const [swiper, setSwiper] = useState<SwiperType | null>(null)

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
                <div className="relative group">
                    <Swiper
                        onSwiper={setSwiper}
                        modules={[Autoplay, Pagination, Navigation]}
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

                    {/* Custom Navigation Arrows */}
                    <button
                        onClick={() => swiper?.slidePrev()}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 z-10
                            w-10 h-10 rounded-full bg-background/90 dark:bg-[#1e2330]/90 backdrop-blur shadow-lg dark:shadow-black/40
                            flex items-center justify-center
                            text-foreground hover:bg-background dark:hover:bg-[#252b3b] hover:scale-125
                            active:scale-90
                            transition-all duration-200 ease-out
                            border border-border/50 dark:border-white/10
                            hidden md:flex"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => swiper?.slideNext()}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 z-10
                            w-10 h-10 rounded-full bg-background/90 dark:bg-[#1e2330]/90 backdrop-blur shadow-lg dark:shadow-black/40
                            flex items-center justify-center
                            text-foreground hover:bg-background dark:hover:bg-[#252b3b] hover:scale-125
                            active:scale-90
                            transition-all duration-200 ease-out
                            border border-border/50 dark:border-white/10
                            hidden md:flex"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </motion.section>
    )
}

export default CourseSection

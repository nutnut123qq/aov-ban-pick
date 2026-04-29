"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Swiper, SwiperSlide } from "swiper/react"
import type { Swiper as SwiperType } from "swiper"
import { Autoplay, Pagination, Navigation } from "swiper/modules"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ProgramCard } from "./ProgramCard"
import { Skeleton } from "@/components/ui/skeleton"
import type { TrainingProgramEntity } from "@/mocks"

import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const },
}

interface ProgramsSectionProps {
    title?: string
    subtitle?: string
    programs: TrainingProgramEntity[]
    isLoading?: boolean
    skeletonCount?: number
}

export function ProgramsSection({ 
    title = "Chương trình đào tạo",
    subtitle = "Lộ trình học tập toàn diện từ cơ bản đến chuyên sâu",
    programs, 
    isLoading = false,
    skeletonCount = 3
}: ProgramsSectionProps) {
    const [swiper, setSwiper] = useState<SwiperType | null>(null)

    return (
        <motion.section {...fadeInUp}>
            <div className="container mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">{title}</h2>
                        <p className="text-muted-foreground mt-1">{subtitle}</p>
                    </div>
                    <Button variant="ghost" className="gap-1" asChild>
                        <Link href="/programs">Xem tất cả <ArrowRight className="w-4 h-4" /></Link>
                    </Button>
                </div>
                <div className="relative">
                    <Swiper
                        onSwiper={setSwiper}
                        modules={[Autoplay, Pagination, Navigation]}
                        spaceBetween={24}
                        slidesPerView={1}
                        breakpoints={{
                            640: { slidesPerView: 1 },
                            768: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                        }}
                        className="programs-swiper"
                    >
                        {isLoading ? (
                            Array.from({ length: skeletonCount }).map((_, i) => (
                                <SwiperSlide key={i}>
                                    <Skeleton className="h-64 rounded-xl" />
                                </SwiperSlide>
                            ))
                        ) : (
                            programs.map((program) => (
                                <SwiperSlide key={program.id}>
                                    <ProgramCard program={program} />
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

export default ProgramsSection

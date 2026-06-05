"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import {
    Autoplay,
    Pagination,
    Navigation,
    EffectFade,
} from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import "swiper/css/effect-fade"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

interface BannerSlide {
    id: number
    title: string
    subtitle: string
    description: string
    image: string
    ctaText?: string
    ctaLink?: string
    badge?: string
}

interface CarouselProps {
    slides: BannerSlide[]
    autoplay?: boolean
    pagination?: boolean
    navigation?: boolean
    loop?: boolean
    className?: string
}

const BannerSlideContent = ({ slide }: { slide: BannerSlide }) => (
    <div className="relative h-full">
        {/* Background Image */}
        <div className="absolute inset-0">
            <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl space-y-6">
                    {slide.badge && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium border border-white/20">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            {slide.badge}
                        </div>
                    )}

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                        {slide.title}
                    </h1>

                    <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                        {slide.description}
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        {slide.ctaText && slide.ctaLink && (
                            <Link href={slide.ctaLink}>
                                <Button 
                                    size="lg" 
                                    className="gap-2 shadow-lg bg-white text-black hover:bg-white/90 font-semibold px-6"
                                >
                                    {slide.ctaText} <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        )}
                        <Button
                            size="lg"
                            className="gap-2 border-2 border-white text-white hover:bg-white hover:text-black font-semibold px-6"
                        >
                            <Play className="w-4 h-4" /> Xem thêm
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
)

export function Carousel({
    slides,
    autoplay = true,
    pagination = true,
    navigation = true,
    loop = true,
    className = "",
}: CarouselProps) {
    return (
        <div className={`relative ${className}`} style={{ minHeight: "550px" }}>
            <Swiper
                modules={[Autoplay, Pagination, Navigation, EffectFade]}
                autoplay={autoplay ? { delay: 5000, disableOnInteraction: false } : false}
                pagination={pagination ? { clickable: true } : false}
                navigation={navigation}
                loop={loop}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                speed={800}
                className="h-full"
                style={{ height: "550px" }}
            >
                {slides.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        <BannerSlideContent slide={slide} />
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom Pagination */}
            {pagination && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
                    <style>{`
                        .swiper-pagination-bullet {
                            width: 8px;
                            height: 8px;
                            background: rgba(255, 255, 255, 0.5);
                            border-radius: 9999px;
                            transition: all 0.3s ease;
                            cursor: pointer;
                        }
                        .swiper-pagination-bullet-active {
                            width: 32px;
                            background: white;
                        }
                    `}</style>
                </div>
            )}

            {/* Custom Navigation Arrows */}
            {navigation && (
                <>
                    <style>{`
                        .swiper-button-next,
                        .swiper-button-prev {
                            width: 44px !important;
                            height: 44px !important;
                            color: white !important;
                            background: rgba(255, 255, 255, 0.15) !important;
                            backdrop-filter: blur(8px) !important;
                            -webkit-backdrop-filter: blur(8px) !important;
                            border: 1px solid rgba(255, 255, 255, 0.25) !important;
                            border-radius: 9999px !important;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
                            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                            display: flex !important;
                            align-items: center !important;
                            justify-content: center !important;
                        }
                        .swiper-button-next::after,
                        .swiper-button-prev::after {
                            font-size: 16px !important;
                            font-weight: 700 !important;
                            transition: transform 0.3s ease !important;
                        }
                        .swiper-button-next:hover,
                        .swiper-button-prev:hover {
                            background: rgba(255, 255, 255, 0.9) !important;
                            color: #181d26 !important;
                            border-color: rgba(255, 255, 255, 0.9) !important;
                            transform: scale(1.12) !important;
                            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25) !important;
                        }
                        .swiper-button-next:hover::after {
                            transform: translateX(1px) !important;
                        }
                        .swiper-button-prev:hover::after {
                            transform: translateX(-1px) !important;
                        }
                        .swiper-button-disabled {
                            opacity: 0.35 !important;
                            pointer-events: none !important;
                        }
                        @media (max-width: 768px) {
                            .swiper-button-next,
                            .swiper-button-prev {
                                display: none !important;
                            }
                        }
                    `}</style>
                </>
            )}
        </div>
    )
}

// Default banner slides for the homepage
export const defaultBannerSlides: BannerSlide[] = [
    {
        id: 1,
        title: "Tedo",
        subtitle: "Nền tảng đào tạo IT hàng đầu",
        description: "Khóa học IT trên mạng tràn lan, nhưng nội dung cô đọng và đi vào tư duy thực chiến lại rất ít. Tedo được thành lập ra để thay đổi điều đó.",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&q=80",
        ctaLink: "/courses",
        badge: "Nền tảng đào tạo IT hàng đầu",
    },
    {
        id: 2,
        title: "Học từ Tư duy đến Kỹ năng",
        subtitle: "Chương trình toàn diện",
        description: "Chúng tớ tập trung xây dựng tư duy lập trình - từ Fullstack, DevOps, Security đến Solution Architect.",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80",
        badge: "1000+ Học viên",
    },
    {
        id: 3,
        title: "Chi phí tối thiểu, Chất lượng cao",
        subtitle: "Học phí dễ tiếp cận",
        description: "Mô hình tinh gọn, loại bỏ chi phí không cần thiết để giữ học phí ở mức dễ tiếp cận, phù hợp với mọi đối tượng học viên.",
        image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920&q=80",
        ctaLink: "/courses",
        badge: "Học phí ưu đãi",
    },
]

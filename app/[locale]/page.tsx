"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Play, Users, BookOpen, Award, ChevronRight, Star, Clock, Layers } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

import {
    getFeaturedCourses,
    getCategories,
    getPrograms,
} from "@/mocks"
import type { CourseEntity, CourseCategoryEntity, TrainingProgramEntity } from "@/mocks"

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const },
}

// Format price to VND
const formatPrice = (price: number, currency: string = "VND") => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
    }).format(price)
}

// Format duration
const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
        return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
}

// Course Card Component
const CourseCard = ({ course }: { course: CourseEntity }) => {
    const levelColors = {
        BEGINNER: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        INTERMEDIATE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        ADVANCED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }

    return (
        <Link href={`/courses/${course.slug}`}>
            <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                <div className="relative aspect-video overflow-hidden">
                    <Image
                        src={course.thumbnail || "/placeholder-course.jpg"}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {course.isFeatured && (
                        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                            Nổi bật
                        </Badge>
                    )}
                    {course.discountPrice && (
                        <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">
                            -{Math.round((1 - course.discountPrice / course.price) * 100)}%
                        </Badge>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                            <Play className="w-6 h-6 text-foreground ml-1" fill="currentColor" />
                        </div>
                    </div>
                </div>
                <CardHeader className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className={levelColors[course.level]}>
                            {course.level === "BEGINNER" ? "Cơ bản" : course.level === "INTERMEDIATE" ? "Trung cấp" : "Nâng cao"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{course.category?.name}</span>
                    </div>
                    <CardTitle className="line-clamp-2 text-base leading-snug">
                        {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">
                        {course.shortDescription}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {course.enrollmentCount.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(course.duration)}
                        </span>
                        {course.rating && (
                            <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                {course.rating.toFixed(1)}
                            </span>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {course.discountPrice ? (
                            <>
                                <span className="text-lg font-bold text-primary">
                                    {formatPrice(course.discountPrice)}
                                </span>
                                <span className="text-sm text-muted-foreground line-through">
                                    {formatPrice(course.price)}
                                </span>
                            </>
                        ) : (
                            <span className="text-lg font-bold text-primary">
                                {formatPrice(course.price)}
                            </span>
                        )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </CardFooter>
            </Card>
        </Link>
    )
}

// Program Card Component
const ProgramCard = ({ program }: { program: TrainingProgramEntity }) => {
    return (
        <Link href={`/programs/${program.slug}`}>
            <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                        src={program.thumbnail || "/placeholder-program.jpg"}
                        alt={program.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                        <Badge className="mb-2 bg-primary text-primary-foreground">
                            Chương trình {program.courseCount} khóa
                        </Badge>
                        <h3 className="text-white font-bold text-lg line-clamp-2">
                            {program.title}
                        </h3>
                    </div>
                </div>
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {program.shortDescription}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {program.enrollmentCount} học viên
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(program.duration)}
                        </span>
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {program.discountPrice ? (
                            <>
                                <span className="text-lg font-bold text-primary">
                                    {formatPrice(program.discountPrice)}
                                </span>
                                <span className="text-sm text-muted-foreground line-through">
                                    {formatPrice(program.price)}
                                </span>
                            </>
                        ) : (
                            <span className="text-lg font-bold text-primary">
                                {formatPrice(program.price)}
                            </span>
                        )}
                    </div>
                    <Button size="sm" variant="ghost" className="gap-1">
                        Xem chi tiết <ArrowRight className="w-3 h-3" />
                    </Button>
                </CardFooter>
            </Card>
        </Link>
    )
}

// Category Card Component
const CategoryCard = ({ category }: { category: CourseCategoryEntity }) => {
    return (
        <Link href={`/categories/${category.slug}`}>
            <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer text-center">
                <CardContent className="p-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Layers className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">
                        {category.courseCount} khóa học
                    </p>
                </CardContent>
            </Card>
        </Link>
    )
}

// Loading Skeleton
const CourseCardSkeleton = () => (
    <Card className="h-full">
        <Skeleton className="aspect-video rounded-none" />
        <CardHeader className="p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
            <Skeleton className="h-3 w-full" />
        </CardContent>
        <CardFooter className="p-4 pt-0">
            <Skeleton className="h-6 w-24" />
        </CardFooter>
    </Card>
)

const Page = () => {
    const [featuredCourses, setFeaturedCourses] = useState<CourseEntity[]>([])
    const [categories, setCategories] = useState<CourseCategoryEntity[]>([])
    const [programs, setPrograms] = useState<TrainingProgramEntity[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const [coursesData, categoriesData, programsData] = await Promise.all([
                    getFeaturedCourses(),
                    getCategories(),
                    getPrograms({ limit: 3 }),
                ])
                setFeaturedCourses(coursesData)
                setCategories(categoriesData.slice(0, 6))
                setPrograms(programsData.data)
            } catch (error) {
                console.error("Error loading home data:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [])

    return (
        <div className="space-y-20 py-8">
            {/* Hero Section */}
            <motion.section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8 md:p-12" {...fadeInUp}>
                <div className="container mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            <BookOpen className="w-4 h-4" />
                            Nền tảng đào tạo IT hàng đầu
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                            StarCi Academy
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Khóa học IT trên mạng tràn lan, nhưng nội dung cô đọng và đi vào tư duy thực chiến lại rất ít.
                            StarCi Academy được thành lập ra để thay đổi điều đó.
                        </p>
                        <p className="text-muted-foreground italic">
                            Chúng tớ tập trung xây dựng tư duy lập trình - từ Fullstack, DevOps, Security đến Solution Architect.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Button size="lg" className="gap-2">
                                Khám phá khóa học <ArrowRight className="w-4 h-4" />
                            </Button>
                            <Button size="lg" variant="outline" className="gap-2">
                                <Play className="w-4 h-4" /> Xem giới thiệu
                            </Button>
                        </div>
                    </div>
                    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                        <Image
                            src="/hero-image.jpg"
                            alt="StarCi Academy"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-primary">1000+</div>
                        <div className="text-sm text-muted-foreground mt-1">Học viên</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-primary">50+</div>
                        <div className="text-sm text-muted-foreground mt-1">Khóa học</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-primary">20+</div>
                        <div className="text-sm text-muted-foreground mt-1">Giảng viên</div>
                    </div>
                </div>
                </div>
            </motion.section>

            {/* Categories */}
            <motion.section {...fadeInUp}>
                <div className="container mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Danh mục khóa học</h2>
                        <p className="text-muted-foreground mt-1">Tìm kiếm theo lĩnh vực bạn quan tâm</p>
                    </div>
                    <Button variant="ghost" className="gap-1">
                        Xem tất cả <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-32 rounded-xl" />
                        ))
                    ) : (
                        categories.map((category) => (
                            <CategoryCard key={category.id} category={category} />
                        ))
                    )}
                </div>
                </div>
            </motion.section>

            <Separator />

            {/* Featured Courses */}
            <motion.section {...fadeInUp}>
                <div className="container mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Khóa học nổi bật</h2>
                        <p className="text-muted-foreground mt-1">Những khóa học được yêu thích nhất</p>
                    </div>
                    <Button variant="ghost" className="gap-1">
                        Xem tất cả <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <CourseCardSkeleton key={i} />
                        ))
                    ) : (
                        featuredCourses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))
                    )}
                </div>
                </div>
            </motion.section>

            {/* Programs */}
            <motion.section {...fadeInUp}>
                <div className="container mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Chương trình đào tạo</h2>
                        <p className="text-muted-foreground mt-1">Lộ trình học tập toàn diện từ cơ bản đến chuyên sâu</p>
                    </div>
                    <Button variant="ghost" className="gap-1">
                        Xem tất cả <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-64 rounded-xl" />
                        ))
                    ) : (
                        programs.map((program) => (
                            <ProgramCard key={program.id} program={program} />
                        ))
                    )}
                </div>
                </div>
            </motion.section>

            {/* Why Choose Us */}
            <motion.section className="py-16" {...fadeInUp}>
                <div className="container mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-2xl font-bold">Điều gì làm cho StarCi Academy khác biệt?</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                        StarCi Academy tập trung vào bản chất của ngành IT. Chúng tớ không chỉ dạy kiến thức 
                        mà còn đào tạo tư duy lập trình chuẩn mực và khả năng thiết kế hệ thống.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <Card className="text-center p-8 hover:shadow-lg transition-all duration-300">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg mb-3">Tư duy trước stack</h3>
                        <p className="text-sm text-muted-foreground">
                            Công nghệ thay đổi liên tục. Chúng tớ tập trung dạy bản chất, keyword và tư duy 
                            để bạn tự research và mở rộng theo bất kỳ stack nào.
                        </p>
                    </Card>
                    <Card className="text-center p-8 hover:shadow-lg transition-all duration-300">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Award className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg mb-3">Chi phí tối thiểu, chất lượng cao</h3>
                        <p className="text-sm text-muted-foreground">
                            Mô hình tinh gọn, loại bỏ chi phí không cần thiết để giữ học phí ở mức dễ tiếp cận, 
                            phù hợp với mọi đối tượng học viên.
                        </p>
                    </Card>
                    <Card className="text-center p-8 hover:shadow-lg transition-all duration-300">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Users className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg mb-3">From Code to Career</h3>
                        <p className="text-sm text-muted-foreground">
                            Dạy để bạn xây dựng project có giá trị thực sự và hỗ trợ lâu dài 
                            trong quá trình phát triển sự nghiệp.
                        </p>
                    </Card>
                </div>
                </div>
            </motion.section>

            {/* CTA Section */}
            <motion.section className="bg-primary text-primary-foreground rounded-3xl p-10 md:p-16 text-center" {...fadeInUp}>
                <div className="container mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Sẵn sàng bắt đầu hành trình của bạn?
                </h2>
                <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
                    Đăng ký ngay hôm nay và nhận ưu đãi học phí cho khóa học đầu tiên của bạn.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Button size="lg" variant="secondary" className="gap-2">
                        Đăng ký ngay <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                        Liên hệ tư vấn
                    </Button>
                </div>
                </div>
            </motion.section>

            {/* Footer */}
            <footer className="text-center text-sm text-muted-foreground">
                <div className="container mx-auto">
                <p>© 2024 StarCi Academy. Tất cả quyền được bảo lưu.</p>
                </div>
            </footer>
        </div>
    )
}

export default Page

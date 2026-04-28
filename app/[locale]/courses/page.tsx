"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Search, Filter, Grid3X3, List, SlidersHorizontal, X, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

import {
    getCourses,
    getCategories,
} from "@/mocks"
import type { CourseEntity, CourseCategoryEntity } from "@/mocks"

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const },
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

interface FilterState {
    search: string
    categoryId: string
    level: string
    priceRange: string
    sortBy: string
}

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
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{course.enrollmentCount.toLocaleString()} học viên</span>
                        <span>{formatDuration(course.duration)}</span>
                        {course.rating && (
                            <span className="flex items-center gap-1">
                                ⭐ {course.rating.toFixed(1)}
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
                </CardFooter>
            </Card>
        </Link>
    )
}

const CourseCardSkeleton = () => (
    <Card className="h-full">
        <Skeleton className="aspect-video rounded-none" />
        <CardHeader className="p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-5 w-full mb-2" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
            <Skeleton className="h-3 w-full" />
        </CardContent>
        <CardFooter className="p-4 pt-0">
            <Skeleton className="h-6 w-24" />
        </CardFooter>
    </Card>
)

const CoursesPage = () => {
    const [courses, setCourses] = useState<CourseEntity[]>([])
    const [categories, setCategories] = useState<CourseCategoryEntity[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [showMobileFilters, setShowMobileFilters] = useState(false)

    const [filters, setFilters] = useState<FilterState>({
        search: "",
        categoryId: "all",
        level: "all",
        priceRange: "all",
        sortBy: "popular",
    })

    const loadData = async () => {
        setIsLoading(true)
        try {
            const [coursesData, categoriesData] = await Promise.all([
                getCourses({ limit: 20, sortBy: "enrollmentCount", sortOrder: "desc" }),
                getCategories(),
            ])
            setCourses(coursesData.data)
            setCategories(categoriesData)
        } catch (error) {
            console.error("Error loading courses:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const filteredCourses = courses.filter((course) => {
        if (filters.search && !course.title.toLowerCase().includes(filters.search.toLowerCase())) {
            return false
        }
        if (filters.categoryId !== "all" && course.categoryId !== filters.categoryId) {
            return false
        }
        if (filters.level !== "all" && course.level !== filters.level) {
            return false
        }
        if (filters.priceRange !== "all") {
            if (filters.priceRange === "free" && course.price > 0) return false
            if (filters.priceRange === "paid" && course.price === 0) return false
            if (filters.priceRange === "discount" && !course.discountPrice) return false
        }
        return true
    })

    const levels = [
        { value: "all", label: "Tất cả" },
        { value: "BEGINNER", label: "Cơ bản" },
        { value: "INTERMEDIATE", label: "Trung cấp" },
        { value: "ADVANCED", label: "Nâng cao" },
    ]

    const priceRanges = [
        { value: "all", label: "Tất cả" },
        { value: "free", label: "Miễn phí" },
        { value: "paid", label: "Trả phí" },
        { value: "discount", label: "Đang giảm giá" },
    ]

    const sortOptions = [
        { value: "popular", label: "Phổ biến nhất" },
        { value: "newest", label: "Mới nhất" },
        { value: "price-asc", label: "Giá: Thấp đến cao" },
        { value: "price-desc", label: "Giá: Cao đến thấp" },
        { value: "rating", label: "Đánh giá cao nhất" },
    ]

    const FilterContent = () => (
        <div className="space-y-6">
            {/* Category Filter */}
            <div>
                <Label className="text-sm font-medium mb-3 block">Danh mục</Label>
                <div className="space-y-2">
                    <Button
                        variant={filters.categoryId === "all" ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setFilters({ ...filters, categoryId: "all" })}
                    >
                        Tất cả danh mục
                    </Button>
                    {categories.map((cat) => (
                        <Button
                            key={cat.id}
                            variant={filters.categoryId === cat.id ? "default" : "ghost"}
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => setFilters({ ...filters, categoryId: cat.id })}
                        >
                            {cat.name}
                            <Badge variant="secondary" className="ml-auto">{cat.courseCount}</Badge>
                        </Button>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Level Filter */}
            <div>
                <Label className="text-sm font-medium mb-3 block">Cấp độ</Label>
                <div className="space-y-2">
                    {levels.map((level) => (
                        <div key={level.value} className="flex items-center gap-2">
                            <Checkbox
                                id={`level-${level.value}`}
                                checked={filters.level === level.value}
                                onCheckedChange={() => setFilters({ ...filters, level: level.value })}
                            />
                            <Label htmlFor={`level-${level.value}`} className="text-sm cursor-pointer">
                                {level.label}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Price Filter */}
            <div>
                <Label className="text-sm font-medium mb-3 block">Giá</Label>
                <div className="space-y-2">
                    {priceRanges.map((range) => (
                        <div key={range.value} className="flex items-center gap-2">
                            <Checkbox
                                id={`price-${range.value}`}
                                checked={filters.priceRange === range.value}
                                onCheckedChange={() => setFilters({ ...filters, priceRange: range.value })}
                            />
                            <Label htmlFor={`price-${range.value}`} className="text-sm cursor-pointer">
                                {range.label}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            <Button
                variant="outline"
                className="w-full"
                onClick={() => setFilters({
                    search: "",
                    categoryId: "all",
                    level: "all",
                    priceRange: "all",
                    sortBy: "popular",
                })}
            >
                Xóa bộ lọc
            </Button>
        </div>
    )

    return (
        <div className="min-h-screen">
            {/* Header */}
            <motion.section className="bg-gradient-to-r from-primary/10 to-primary/5 py-12" {...fadeInUp}>
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-2">Khóa học</h1>
                    <p className="text-muted-foreground">
                        Khám phá {courses.length}+ khóa học chất lượng cao
                    </p>
                </div>
            </motion.section>

            <div className="container mx-auto px-4 py-8">
                {/* Search & Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm khóa học..."
                            className="pl-10"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-2">
                        {/* Mobile Filter */}
                        <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="md:hidden">
                                    <SlidersHorizontal className="w-4 h-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left">
                                <SheetHeader>
                                    <SheetTitle>Bộ lọc</SheetTitle>
                                </SheetHeader>
                                <div className="mt-6">
                                    <FilterContent />
                                </div>
                                <SheetClose asChild>
                                    <Button className="w-full mt-6">Áp dụng</Button>
                                </SheetClose>
                            </SheetContent>
                        </Sheet>

                        {/* Sort */}
                        <Select value={filters.sortBy} onValueChange={(v) => setFilters({ ...filters, sortBy: v })}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sắp xếp" />
                            </SelectTrigger>
                            <SelectContent>
                                {sortOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* View Mode */}
                        <div className="flex border rounded-lg overflow-hidden">
                            <Button
                                variant={viewMode === "grid" ? "default" : "ghost"}
                                size="icon"
                                className="rounded-none"
                                onClick={() => setViewMode("grid")}
                            >
                                <Grid3X3 className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={viewMode === "list" ? "default" : "ghost"}
                                size="icon"
                                className="rounded-none"
                                onClick={() => setViewMode("list")}
                            >
                                <List className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Desktop Sidebar Filters */}
                    <aside className="hidden md:block w-64 shrink-0">
                        <div className="sticky top-4">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                Bộ lọc
                            </h3>
                            <FilterContent />
                        </div>
                    </aside>

                    {/* Course Grid */}
                    <div className="flex-1">
                        {/* Active Filters */}
                        {(filters.categoryId !== "all" || filters.level !== "all" || filters.priceRange !== "all") && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {filters.categoryId !== "all" && (
                                    <Badge variant="secondary" className="gap-1">
                                        {categories.find((c) => c.id === filters.categoryId)?.name}
                                        <X
                                            className="w-3 h-3 cursor-pointer"
                                            onClick={() => setFilters({ ...filters, categoryId: "all" })}
                                        />
                                    </Badge>
                                )}
                                {filters.level !== "all" && (
                                    <Badge variant="secondary" className="gap-1">
                                        {levels.find((l) => l.value === filters.level)?.label}
                                        <X
                                            className="w-3 h-3 cursor-pointer"
                                            onClick={() => setFilters({ ...filters, level: "all" })}
                                        />
                                    </Badge>
                                )}
                                {filters.priceRange !== "all" && (
                                    <Badge variant="secondary" className="gap-1">
                                        {priceRanges.find((p) => p.value === filters.priceRange)?.label}
                                        <X
                                            className="w-3 h-3 cursor-pointer"
                                            onClick={() => setFilters({ ...filters, priceRange: "all" })}
                                        />
                                    </Badge>
                                )}
                            </div>
                        )}

                        <p className="text-sm text-muted-foreground mb-6">
                            Tìm thấy {filteredCourses.length} khóa học
                        </p>

                        {viewMode === "grid" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {isLoading ? (
                                    Array.from({ length: 8 }).map((_, i) => <CourseCardSkeleton key={i} />)
                                ) : filteredCourses.length > 0 ? (
                                    filteredCourses.map((course) => (
                                        <CourseCard key={course.id} course={course} />
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-12">
                                        <p className="text-muted-foreground">Không tìm thấy khóa học nào</p>
                                        <Button
                                            variant="link"
                                            onClick={() => setFilters({
                                                search: "",
                                                categoryId: "all",
                                                level: "all",
                                                priceRange: "all",
                                                sortBy: "popular",
                                            })}
                                        >
                                            Xóa bộ lọc
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {isLoading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <Card key={i} className="flex">
                                            <Skeleton className="w-64 h-40 rounded-none" />
                                            <CardHeader className="flex-1">
                                                <Skeleton className="h-6 w-3/4 mb-2" />
                                                <Skeleton className="h-4 w-full mb-2" />
                                                <Skeleton className="h-4 w-1/2" />
                                            </CardHeader>
                                        </Card>
                                    ))
                                ) : (
                                    filteredCourses.map((course) => (
                                        <Link key={course.id} href={`/courses/${course.slug}`}>
                                            <Card className="flex hover:shadow-lg transition-all cursor-pointer">
                                                <div className="w-64 h-40 relative shrink-0">
                                                    <Image
                                                        src={course.thumbnail || "/placeholder-course.jpg"}
                                                        alt={course.title}
                                                        fill
                                                        className="object-cover rounded-l-lg"
                                                    />
                                                </div>
                                                <CardHeader className="flex-1">
                                                    <CardTitle>{course.title}</CardTitle>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {course.shortDescription}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                                        <span>{course.enrollmentCount} học viên</span>
                                                        <span>{formatDuration(course.duration)}</span>
                                                        {course.rating && <span>⭐ {course.rating}</span>}
                                                    </div>
                                                </CardHeader>
                                                <CardFooter className="flex flex-col items-end justify-center">
                                                    <span className="text-lg font-bold text-primary">
                                                        {formatPrice(course.discountPrice || course.price)}
                                                    </span>
                                                </CardFooter>
                                            </Card>
                                        </Link>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CoursesPage

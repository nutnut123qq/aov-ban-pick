"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Search, Filter, Grid3X3, List, SlidersHorizontal, X, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { CourseCard, CourseCardSkeleton } from "@/components/common"

import {
    getCategories,
} from "@/mocks"
import type { CourseCategoryEntity } from "@/modules/types"
import type { CourseEntity } from "@/modules/types"
import {
    useQueryCoursesSwr,
} from "@/hooks/singleton/swr"

import { formatPrice, formatDurationShort } from "@/modules/utils"
import { levelConfig } from "@/modules/utils/course"

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
}

const formatDuration = formatDurationShort

interface FilterState {
    search: string
    categoryId: string
    level: string
    priceRange: string
    sortBy: string
}

const CoursesPage = () => {
    const { data: coursesData, isLoading } = useQueryCoursesSwr()
    const courses = (coursesData?.courses.data ?? []) as CourseEntity[]

    const [categories, setCategories] = useState<CourseCategoryEntity[]>([])
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [showMobileFilters, setShowMobileFilters] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 12

    const [filters, setFilters] = useState<FilterState>({
        search: "",
        categoryId: "all",
        level: "all",
        priceRange: "all",
        sortBy: "popular",
    })

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categoriesData = await getCategories()
                setCategories(categoriesData)
            } catch (error) {
                console.error("Error loading categories:", error)
            }
        }
        loadCategories()
    }, [])

    const filteredCourses = courses.filter((course) => {
        if (filters.search && !course.title.toLowerCase().includes(filters.search.toLowerCase())) {
            return false
        }
        if (filters.categoryId !== "all" && course.category?.id !== filters.categoryId) {
            return false
        }
        if (filters.level !== "all" && course.level !== filters.level) {
            return false
        }
        if (filters.priceRange !== "all") {
            const price = course.originalPrice ?? 0
            if (filters.priceRange === "free" && price > 0) return false
            if (filters.priceRange === "paid" && price === 0) return false
            if (filters.priceRange === "discount" && !course.discountPrice) return false
        }
        return true
    })

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [filters])

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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                                {isLoading ? (
                                    Array.from({ length: 8 }).map((_, i) => <CourseCardSkeleton key={i} />)
                                ) : filteredCourses.length > 0 ? (
                                    filteredCourses
                                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                        .map((course) => (
                                            <div key={course.id} className="flex">
                                                <CourseCard course={course} className="w-full" />
                                            </div>
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
                                        <div key={i} className="flex bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                                            <Skeleton className="w-64 h-40 rounded-none" />
                                            <div className="flex-1 p-4">
                                                <Skeleton className="h-6 w-3/4 mb-2" />
                                                <Skeleton className="h-4 w-full mb-2" />
                                                <Skeleton className="h-4 w-1/2" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    filteredCourses
                                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                        .map((course) => (
                                            <Link key={course.id} href={`/courses/${course.slug ?? course.id}`}>
                                                <div className="flex bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-gray-100 dark:border-gray-800">
                                                <div className="w-64 h-40 relative shrink-0">
                                                    <Image
                                                        src={course.thumbnailUrl || course.cdnUrl || "/placeholder-course.jpg"}
                                                        alt={course.title}
                                                        fill
                                                        className="object-cover rounded-l-2xl"
                                                    />
                                                    {course.isFeatured && (
                                                        <span className="absolute top-3 left-3 px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-md">
                                                            Nổi bật
                                                        </span>
                                                    )}
                                                    {course.discountPrice && (course.originalPrice ?? 0) > 0 && (
                                                        <span className="absolute top-3 right-3 px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-md">
                                                            -{Math.round((1 - course.discountPrice / (course.originalPrice ?? 1)) * 100)}%
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-1 p-4 flex flex-col justify-center">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {course.level && (
                                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${levelConfig[course.level as import("@/modules/types/enums").CourseLevel].color}`}>
                                                                {levelConfig[course.level as import("@/modules/types/enums").CourseLevel].label}
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-muted-foreground">{course.category?.name}</span>
                                                    </div>
                                                    <h3 className="font-semibold text-base line-clamp-1 mb-1">{course.title}</h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                                        {course.shortDescription || course.description}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            {course.enrollmentCount.toLocaleString()} học viên
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            {formatDuration(course.estimatedMinutes ?? 0)}
                                                        </span>
                                                        {course.rating && (
                                                            <span className="flex items-center gap-1">
                                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                                {course.rating.toFixed(1)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="p-4 flex flex-col items-end justify-center">
                                                    <div className="flex flex-col items-end">
                                                        {course.discountPrice ? (
                                                            <>
                                                                <span className="text-lg font-bold text-primary">
                                                                    {formatPrice(course.discountPrice)}
                                                                </span>
                                                                <span className="text-sm text-gray-400 line-through">
                                                                    {formatPrice(course.originalPrice ?? 0)}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-lg font-bold text-primary">
                                                                {formatPrice(course.originalPrice ?? 0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {!isLoading && filteredCourses.length > 0 && (
                    <div className="mt-8">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                                {Array.from({ length: Math.ceil(filteredCourses.length / itemsPerPage) }).map((_, i) => {
                                    const page = i + 1
                                    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage)
                                    if (
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    ) {
                                        return (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    isActive={currentPage === page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className="cursor-pointer"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )
                                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                                        return <PaginationEllipsis key={page} />
                                    }
                                    return null
                                })}
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredCourses.length / itemsPerPage), p + 1))}
                                        className={currentPage === Math.ceil(filteredCourses.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CoursesPage

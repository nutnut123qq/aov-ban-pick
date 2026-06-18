"use client"

import React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CategoryCard } from "./CategoryCard"
import { Skeleton } from "@/components/ui/skeleton"
import type { CourseCategoryEntity } from "@/modules/types"

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const },
}

interface CategoriesSectionProps {
    title?: string
    subtitle?: string
    categories: CourseCategoryEntity[]
    isLoading?: boolean
    skeletonCount?: number
}

export function CategoriesSection({ 
    title = "Danh mục khóa học",
    subtitle = "Tìm kiếm theo lĩnh vực bạn quan tâm",
    categories, 
    isLoading = false,
    skeletonCount = 6
}: CategoriesSectionProps) {
    return (
        <motion.section {...fadeInUp}>
            <div className="container mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">{title}</h2>
                        <p className="text-muted-foreground mt-1">{subtitle}</p>
                    </div>
                    <Button asChild variant="ghost" className="gap-1">
                        <Link href="/courses">
                            Xem tất cả <ArrowRight className="w-4 h-4" />
                        </Link>
                    </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {isLoading ? (
                        Array.from({ length: skeletonCount }).map((_, i) => (
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
    )
}

export default CategoriesSection

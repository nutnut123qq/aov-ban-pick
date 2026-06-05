"use client"

import React from "react"
import Link from "next/link"
import { Layers } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { CourseCategoryEntity } from "@/modules/types"

interface CategoryCardProps {
    category: CourseCategoryEntity
}

export function CategoryCard({ category }: CategoryCardProps) {
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

export default CategoryCard

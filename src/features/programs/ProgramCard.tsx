"use client"

import React, { memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Users, BookOpen, Clock, Award } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice, formatDurationShort } from "@/modules/utils"

import type { TrainingProgramEntity, LearningPathEntity } from "@/mocks"

// ============================================
// PROGRAM CARD
// ============================================
interface ProgramCardProps {
    program: TrainingProgramEntity
    className?: string
}

export const ProgramCard = memo(function ProgramCard({
    program,
    className = "",
}: ProgramCardProps) {
    return (
        <div className={`relative flex flex-col h-full ${className}`}>
            <Link href={`/programs/${program.slug}`} className="flex flex-col h-full group">
                <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-gray-100 dark:border-gray-800">
                    
                    {/* Image - Fixed aspect ratio */}
                    <div className="relative aspect-[16/10] overflow-hidden shrink-0">
                        <Image
                            src={program.thumbnail || "/placeholder-program.jpg"}
                            alt={program.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                        
                        {/* Badge on image */}
                        <div className="absolute top-3 left-3">
                            <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground text-[10px] font-semibold">
                                {program.courseCount} khóa học
                            </Badge>
                        </div>
                        
                        {/* Hover play button */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/0 group-hover:bg-white/90 flex items-center justify-center transition-all duration-300 scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100">
                                <ArrowRight className="w-5 h-5 text-gray-900" />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1 min-h-0">
                        {/* Title */}
                        <h3 className="font-bold text-base leading-snug line-clamp-2 mb-2 text-gray-900 dark:text-gray-100 shrink-0">
                            {program.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 flex-shrink-0">
                            {program.shortDescription}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3 flex-shrink-0">
                            <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {program.enrollmentCount > 999 
                                    ? `${(program.enrollmentCount / 1000).toFixed(1)}k` 
                                    : program.enrollmentCount}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDurationShort(program.duration)}
                            </span>
                        </div>

                        {/* Course preview */}
                        {program.curriculumItems && program.curriculumItems.length > 0 && (
                            <div className="flex-1 min-h-0 mb-3">
                                <div className="space-y-1.5">
                                    {program.curriculumItems.slice(0, 2).map((item) => (
                                        <div key={item.id} className="flex items-center gap-2 text-xs">
                                            <BookOpen className="w-3 h-3 text-primary shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400 truncate">
                                                {item.course?.title || "Khóa học"}
                                            </span>
                                        </div>
                                    ))}
                                    {program.curriculumItems.length > 2 && (
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                            +{program.curriculumItems.length - 2} khóa học khác
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Price & CTA */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
                            <div className="flex items-center gap-2">
                                {program.discountPrice ? (
                                    <>
                                        <span className="text-lg font-bold text-primary">
                                            {formatPrice(program.discountPrice)}
                                        </span>
                                        <span className="text-xs text-gray-400 line-through">
                                            {formatPrice(program.price)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-lg font-bold text-primary">
                                        {formatPrice(program.price)}
                                    </span>
                                )}
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    )
})

// ============================================
// LEARNING PATH CARD
// ============================================
interface LearningPathCardProps {
    path: LearningPathEntity
    className?: string
}

export const LearningPathCard = memo(function LearningPathCard({
    path,
    className = "",
}: LearningPathCardProps) {
    return (
        <div className={`relative flex flex-col h-full ${className}`}>
            <Link href={`/learning-paths/${path.slug}`} className="flex flex-col h-full group">
                <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-gray-100 dark:border-gray-800">
                    
                    {/* Image - Fixed aspect ratio */}
                    <div className="relative aspect-[16/10] overflow-hidden shrink-0">
                        <Image
                            src={path.thumbnail || "/placeholder-path.jpg"}
                            alt={path.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                        
                        {/* Badge on image */}
                        <div className="absolute top-3 left-3">
                            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-gray-900 text-[10px] font-semibold">
                                Learning Path
                            </Badge>
                        </div>
                        
                        {/* Hover arrow */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/0 group-hover:bg-white/90 flex items-center justify-center transition-all duration-300 scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100">
                                <ArrowRight className="w-5 h-5 text-gray-900" />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1 min-h-0">
                        {/* Title */}
                        <h3 className="font-bold text-base leading-snug line-clamp-2 mb-2 text-gray-900 dark:text-gray-100 shrink-0">
                            {path.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 flex-shrink-0">
                            {path.description}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3 flex-shrink-0">
                            <span className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                {path.courses?.length || 0} khóa học
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {path.enrollmentCount > 999 
                                    ? `${(path.enrollmentCount / 1000).toFixed(1)}k` 
                                    : path.enrollmentCount}
                            </span>
                        </div>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* CTA */}
                        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                            <Button variant="outline" size="sm" className="w-full gap-2 group/btn">
                                Khám phá
                                <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    )
})

// ============================================
// SKELETON LOADERS
// ============================================
export function ProgramCardSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="aspect-[16/10]" />
            <div className="p-4">
                <div className="h-5 w-3/4 mb-2" />
                <div className="h-4 w-full mb-1" />
                <div className="h-4 w-2/3 mb-3" />
                <div className="flex gap-4 mb-3">
                    <div className="h-3 w-12" />
                    <div className="h-3 w-10" />
                </div>
                <div className="space-y-1.5 mb-3">
                    <div className="h-3 w-full" />
                    <div className="h-3 w-3/4" />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="h-5 w-20" />
                    <div className="h-4 w-4" />
                </div>
            </div>
        </div>
    )
}

export function LearningPathCardSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="aspect-[16/10]" />
            <div className="p-4">
                <div className="h-5 w-3/4 mb-2" />
                <div className="h-4 w-full mb-1" />
                <div className="h-4 w-2/3 mb-3" />
                <div className="flex gap-4 mb-3">
                    <div className="h-3 w-16" />
                    <div className="h-3 w-12" />
                </div>
                <div className="flex-1" />
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="h-9 w-full rounded-md" />
                </div>
            </div>
        </div>
    )
}

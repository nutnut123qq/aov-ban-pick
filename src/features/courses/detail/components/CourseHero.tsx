import React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Users, Clock, BookOpen } from "lucide-react"
import type { CourseEntity } from "@/modules/types"
import type { CourseLevel } from "@/modules/types/enums"
import { levelLabels, formatDurationLong } from "./utils"

interface CourseHeroProps {
    course: CourseEntity
    totalLessons: number
    totalDuration: number
}

export const CourseHero: React.FC<CourseHeroProps> = ({
    course,
    totalLessons,
    totalDuration,
}) => {
    const level = course.level
    const levelStyle = level ? levelLabels[level as CourseLevel] : { label: "", color: "bg-gray-100 text-gray-800" }

    return (
        <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-12">
            <div className="container mx-auto px-4">
                <Link href="/courses">
                    <Button variant="ghost" className="mb-4 gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại khóa học
                    </Button>
                </Link>
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Badges */}
                        <div className="flex items-center gap-3 mb-4">
                            {level && (
                                <Badge className={levelStyle.color}>
                                    {levelStyle.label}
                                </Badge>
                            )}
                            <Badge variant="secondary">{course.category?.name}</Badge>
                            {course.isFeatured && (
                                <Badge className="bg-primary text-primary-foreground">Nổi bật</Badge>
                            )}
                        </div>

                        {/* Title & Description */}
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
                            <p className="text-lg text-muted-foreground">{course.shortDescription || course.description}</p>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap items-center gap-6 text-sm">
                            {course.rating && (
                                <div className="flex items-center gap-1">
                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold">{course.rating.toFixed(1)}</span>
                                    <span className="text-muted-foreground">({course.reviewCount} đánh giá)</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <Users className="w-5 h-5" />
                                <span>{course.enrollmentCount.toLocaleString()} học viên</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-5 h-5" />
                                <span>{formatDurationLong(totalDuration)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <BookOpen className="w-5 h-5" />
                                <span>{totalLessons} bài học</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

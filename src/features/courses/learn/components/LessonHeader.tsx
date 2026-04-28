"use client"
import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Users, Clock, BookOpen, Play, CheckCircle } from "lucide-react"
import type { CourseEntity } from "@/mocks"
import { formatPrice, formatDurationLong, levelLabels } from "../utils"

interface LessonHeaderProps {
    course: CourseEntity
    currentLessonTitle?: string
}

export const LessonHeader: React.FC<LessonHeaderProps> = ({
    course,
    currentLessonTitle,
}) => {
    const instructor = course.instructors?.[0]

    return (
        <div className="bg-white dark:bg-gray-900 border-b">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Left: Course Info */}
                    <div className="flex items-center gap-4">
                        <Link href={`/courses/${course.slug}`} className="hidden sm:block">
                            <Image
                                src={course.thumbnail || "/placeholder-course.jpg"}
                                alt={course.title}
                                width={80}
                                height={45}
                                className="rounded object-cover"
                            />
                        </Link>
                        <div>
                            <Link
                                href={`/courses/${course.slug}`}
                                className="font-medium hover:text-primary transition-colors"
                            >
                                {course.title}
                            </Link>
                            {currentLessonTitle && (
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                    {currentLessonTitle}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right: Instructor & Progress */}
                    <div className="flex items-center gap-6">
                        {/* Instructor */}
                        <div className="hidden md:flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={instructor?.user?.avatar || ""} />
                                <AvatarFallback className="text-xs">
                                    {instructor?.user?.firstName?.charAt(0) || "I"}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                                {instructor?.user?.firstName} {instructor?.user?.lastName}
                            </span>
                        </div>

                        {/* Quick Stats */}
                        <div className="hidden lg:flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                12/50
                            </span>
                            <span>60% hoàn thành</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

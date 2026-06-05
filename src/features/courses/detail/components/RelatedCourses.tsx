import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import type { CourseEntity } from "@/modules/types"
import { formatPrice } from "./utils"

interface RelatedCoursesProps {
    courses: CourseEntity[]
}

export const RelatedCourses: React.FC<RelatedCoursesProps> = ({ courses }) => {
    if (courses.length === 0) return null

    return (
        <div className="lg:col-span-3">
            <h2 className="text-xl font-bold mb-6">Khóa học liên quan</h2>
            <div className="grid md:grid-cols-3 gap-6">
                {courses.map((relatedCourse) => (
                    <Link key={relatedCourse.id} href={`/courses/${relatedCourse.slug ?? relatedCourse.id}`}>
                        <Card className="overflow-hidden hover:shadow-lg transition-all">
                            <div className="relative aspect-video">
                                <Image
                                    src={relatedCourse.thumbnailUrl || relatedCourse.cdnUrl || "/placeholder-course.jpg"}
                                    alt={relatedCourse.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <CardContent className="p-4">
                                <h3 className="font-semibold line-clamp-2 mb-2">{relatedCourse.title}</h3>
                                <p className="text-sm text-muted-foreground">{relatedCourse.category?.name}</p>
                                <p className="text-lg font-bold text-primary mt-2">
                                    {formatPrice(relatedCourse.discountPrice ?? relatedCourse.originalPrice ?? 0)}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
